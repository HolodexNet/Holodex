import { formatDuration } from "@/lib/time";
import { useTimelineRendererBase } from "../hooks/timeline";

import { playerRefAtom, videoStatusAtomFamily } from "@/store/player";
import { useAtomValue } from "jotai";

import { normalizedLoudnessAtom } from "../atoms/waveformAtoms";
import "./WaveformEditor.scss";

import { subtitleManagerAtom } from "../hooks/subtitles";
import { RndSubtitle } from "./RndSubtitle";

export const WaveformEditor = ({ videoId }: { videoId: string }) => {
  const waveform = useAtomValue(normalizedLoudnessAtom);
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
