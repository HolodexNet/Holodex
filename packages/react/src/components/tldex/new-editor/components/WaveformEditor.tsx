import { formatDuration } from "@/lib/time";
import { useTimelineRendererBase } from "../hooks/timeline";

import { playerRefAtom, videoStatusAtomFamily } from "@/store/player";
import { useAtomValue } from "jotai";

import { waveformAtom } from "../atoms/waveformAtoms";
import "./WaveformEditor.scss";

export const WaveformEditor = ({ videoId }: { videoId: string }) => {
  const waveform = useAtomValue(waveformAtom);
  const player = useAtomValue(playerRefAtom);
  const videoStatusAtom = videoStatusAtomFamily(videoId);
  const videoStatus = useAtomValue(videoStatusAtom);

  const { canvasCbRef, containerRef, startTime, endTime } =
    useTimelineRendererBase(waveform, videoStatus);

  return (
    <div
      className="flex w-full flex-col flex-nowrap"
      style={{ height: "150px" }}
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
            const newTime = parseFloat(e.target.value);
            player?.seekTo(newTime);
          }}
        />
      </div>
      <div className="relative shrink grow" ref={containerRef}>
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
