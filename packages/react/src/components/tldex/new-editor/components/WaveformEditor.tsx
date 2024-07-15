import { formatDuration } from "@/lib/time";
import { useTimelineRendererBase } from "../hooks/timeline";

import { playerRefAtom, videoStatusAtomFamily } from "@/store/player";
import { useAtomValue } from "jotai";

import { waveformAtom } from "../atoms/waveformAtoms";
import "./WaveformEditor.scss";

import React from "react";
import { Rnd } from "react-rnd";
import { subtitleManagerAtom, useSpecificSubtitle } from "../hooks/subtitles";

export const WaveformEditor = ({ videoId }: { videoId: string }) => {
  const waveform = useAtomValue(waveformAtom);
  const player = useAtomValue(playerRefAtom);
  const videoStatusAtom = videoStatusAtomFamily(videoId);
  const videoStatus = useAtomValue(videoStatusAtom);

  const { canvasCbRef, containerRef, startTime, endTime, containerSize } =
    useTimelineRendererBase(waveform, videoStatus);

  const { intervalTree } = useAtomValue(subtitleManagerAtom);
  const currentSubs = intervalTree.search([startTime - 20, endTime + 20]);

  return (
    <div
      className="flex w-full flex-col flex-nowrap"
      // style={{ height: "200px" }}
    >
      {/* eslint-disable-next-line tailwindcss/no-custom-classname */}
      <div className="slider-container">
        <input
          type="range"
          min="0"
          max={videoStatus.duration}
          value={videoStatus.progress || 0}
          // eslint-disable-next-line tailwindcss/no-custom-classname
          className="timeline-slider"
          step="0.1"
          onChange={(e) => {
            console.log(e);
            const newTime = parseFloat(e.target.value);
            player?.seekTo(newTime);
          }}
        />
      </div>
      <div
        className="relative max-w-full shrink overflow-hidden"
        ref={containerRef}
      >
        {currentSubs.map((id) => (
          <RndSubtitle
            key={"sub-track" + id}
            subtitleId={id}
            startTime={startTime}
            endTime={endTime}
            containerWidth={containerSize.width}
          />
        ))}
        <canvas
          className="w-full"
          style={{ height: "130px" }}
          ref={canvasCbRef}
        />
        <div className="pointer-events-none absolute z-10 -mt-10 flex w-full justify-between text-xs">
          <span>{formatDuration(startTime * 1000)}</span>
          <span>{formatDuration(endTime * 1000)}</span>
        </div>
      </div>
    </div>
  );
};

interface RndSubtitleProps {
  subtitleId: string;
  startTime: number;
  endTime: number;
  containerWidth: number;
}

export const RndSubtitle: React.FC<RndSubtitleProps> = ({
  subtitleId,
  startTime,
  endTime,
  containerWidth,
}) => {
  const [subtitle, edit] = useSpecificSubtitle(subtitleId);

  const timeToPosition = (time: number) => {
    const timeRange = endTime - startTime;
    const position = ((time - startTime) / timeRange) * containerWidth;
    return position;
  };

  const positionToTime = (position: number) => {
    const timeRange = endTime - startTime;
    const time = (position / containerWidth) * timeRange + startTime;
    return Math.max(startTime, Math.min(time, endTime));
  };

  const handleDrag = (_: unknown, d: { x: number; y: number }) => {
    const newStartTime = positionToTime(d.x);
    edit({
      type: "UPDATE_SUBTITLE",
      payload: {
        ...subtitle,
        video_offset: newStartTime,
        end: newStartTime + subtitle.duration / 1000,
      },
    });
  };

  const handleResize = (_: unknown, _direction: string, ref: HTMLElement) => {
    const newWidth = ref.offsetWidth;
    const newDuration =
      (newWidth / containerWidth) * (endTime - startTime) * 1000;
    edit({
      type: "UPDATE_SUBTITLE",
      payload: {
        ...subtitle,
        duration: newDuration,
        end: subtitle.video_offset + newDuration / 1000,
      },
    });
  };

  return (
    <Rnd
      position={{
        x: timeToPosition(subtitle.video_offset),
        y: 15,
      }}
      size={{
        width:
          timeToPosition(
            subtitle.video_offset + (subtitle.duration || 3000) / 1000,
          ) - timeToPosition(subtitle.video_offset),
        height: 30,
      }}
      onDragStop={handleDrag}
      onResize={handleResize}
      bounds="parent"
      className="border border-x-2 border-primary-9"
      enableResizing={{ left: true, right: true }}
    >
      <div
        className="h-full w-full cursor-move text-wrap bg-base-3 text-base-12 opacity-80 bg-blend-multiply"
        title={subtitle.message}
      >
        <span className="truncate text-xs text-white">{subtitle.message}</span>
      </div>
    </Rnd>
  );
};
