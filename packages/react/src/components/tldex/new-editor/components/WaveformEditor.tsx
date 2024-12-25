import { formatDuration } from "@/lib/time";
import { useRef, useEffect } from "react";
import { useAtomValue } from "jotai";
import { playerRefAtom, videoStatusAtomFamily } from "@/store/player";
import { normalizedLoudnessAtom } from "../atoms/waveformAtoms";
import { useTimeline } from "./Timeline/useTimeline";
import "./WaveformEditor.scss";

const DEFAULT_COLORS = {
  selected: "#3b82f6", // Bright blue - stands out for selection
  active: "#22c55e", // Vibrant green - clear activity indicator
  hover: "#64748b", // Muted slate - subtle hover state
  default: "#475569", // Darker slate - unselected items
  background: "#0f172a", // Deep navy - dark background
  text: "#e2e8f0", // Light gray - readable text
  tooltip: "#94a3b8", // Medium slate - tooltip background
  scrollTrack: "#1e293b", // Slightly lighter than background
  scrollThumb: "#475569", // Visible but not distracting
  timeCursor: "#ef4444", // Bright red - clear position indicator
  timeGrid: "#334155", // Dark slate - subtle grid lines
};
export const WaveformEditor = ({ videoId }: { videoId: string }) => {
  const waveform = useAtomValue(normalizedLoudnessAtom);
  const player = useAtomValue(playerRefAtom);
  const videoStatus = useAtomValue(videoStatusAtomFamily(videoId));

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const timeline = useTimeline(
    canvasRef.current!,
    bgCanvasRef.current!,
    player!,
    videoStatus.duration,
    {
      autoScroll: true,
      colors: DEFAULT_COLORS,
    },
  );

  useEffect(() => {
    if (waveform) {
      timeline.loadWaveform(waveform);
    }
  }, [waveform, timeline]);

  return (
    <div className="flex w-full flex-col flex-nowrap">
      <div className="slider-container">
        <input
          type="range"
          min="0"
          max={videoStatus.duration}
          value={videoStatus.progress || 0}
          className="timeline-slider"
          step="0.1"
          onChange={(e) => {
            const newTime = parseFloat(e.target.value);
            player?.seekTo(newTime);
          }}
        />
      </div>
      <div
        className="relative max-w-full shrink overflow-hidden"
        ref={containerRef}
      >
        <canvas
          className="w-full"
          style={{ height: "130px" }}
          ref={canvasRef}
        />
        <canvas
          className="absolute left-0 top-0 w-full"
          style={{ height: "130px" }}
          ref={bgCanvasRef}
        />
        <div className="pointer-events-none absolute z-10 -mt-10 flex w-full justify-between text-xs">
          <span>
            {formatDuration((timeline.selectedArea?.begin ?? 0) * 1000)}
          </span>
          <span>
            {formatDuration((timeline.selectedArea?.end ?? 0) * 1000)}
          </span>
        </div>
      </div>
    </div>
  );
};
