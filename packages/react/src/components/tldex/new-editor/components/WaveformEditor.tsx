import { formatDuration } from "@/lib/time";
import { useTimelineRendererBase } from "../hooks/timeline";

import { playerRefAtom, videoStatusAtomFamily } from "@/store/player";
import { useAtomValue } from "jotai";

import { waveformAtom } from "../atoms/waveformAtoms";
import "./WaveformEditor.scss";

import React from "react";
import { Rnd } from "react-rnd";

export const WaveformEditor = ({ videoId }: { videoId: string }) => {
  const waveform = useAtomValue(waveformAtom);
  const player = useAtomValue(playerRefAtom);
  const videoStatusAtom = videoStatusAtomFamily(videoId);
  const videoStatus = useAtomValue(videoStatusAtom);

  const {
    canvasCbRef,
    containerRef,
    startTime,
    endTime,
    currentSubs,
    containerSize,
  } = useTimelineRendererBase(waveform, videoStatus);

  const timeToPosition = (time: number) => {
    const timeRange = endTime - startTime;
    const position = ((time - startTime) / timeRange) * containerSize.width;
    return position;
  };

  const positionToTime = (position: number) => {
    const timeRange = endTime - startTime;
    const time = (position / containerSize.width) * timeRange + startTime;
    return Math.max(startTime, Math.min(time, endTime));
  };

  const handleDrag = (index: number, d: { x: number; y: number }) => {
    // can't yet.
  };

  return (
    <div
      className="flex w-full flex-col flex-nowrap"
      style={{ height: "200px" }}
    >
      <div className="slider-container">
        <input
          type="range"
          min="0"
          max={videoStatus.duration}
          value={videoStatus.progress || 0}
          className="timeline-slider"
          step="0.1"
          onChange={(e) => {
            console.log(e);
            const newTime = parseFloat(e.target.value);
            player?.seekTo(newTime);
          }}
        />
      </div>
      <div className="relative shrink grow" ref={containerRef}>
        {currentSubs.map((subtitle, index) => (
          <Rnd
            key={subtitle.key}
            position={{
              x: timeToPosition(subtitle.video_offset),
              y: 15,
            }}
            size={{
              width:
                timeToPosition(
                  subtitle.video_offset + (subtitle.duration || 3) / 1000,
                ) - timeToPosition(subtitle.video_offset),
              height: 30,
            }}
            onDragStop={(e, d) => handleDrag(index, d)}
            bounds="parent"
            style={{ position: "absolute" }}
            className="border border-x-2 border-primary-9"
            enableResizing={{ left: true, right: true }}
          >
            <div
              className="h-full w-full cursor-move text-wrap bg-base-3 text-base-12 opacity-80 bg-blend-multiply"
              title={subtitle.message}
            >
              <span className="truncate text-xs text-white">
                {subtitle.message}
              </span>
            </div>
          </Rnd>
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
