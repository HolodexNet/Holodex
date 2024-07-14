import { useState, useRef, useCallback } from "react";
import Timeline from "@losting/timeline";
import { useMeasure } from "react-use";
import { useAtomValue } from "jotai";
import { PlayingVideoState, videoPlayerRefAtomFamily } from "@/store/player";
import { useInterval } from "usehooks-ts";

/**
 * waveform should be a [ second, value ] sorted array where the second value is between 0-100
 */
export const useTimelineRendererBase = (
  waveform: [number, number][],
  videoStatus: PlayingVideoState | undefined,
) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerRefAtom = videoPlayerRefAtomFamily(
    videoStatus?.videoId || "__nonexistent__",
  );
  const player = useAtomValue(playerRefAtom);

  const [containerRef, containerSize] = useMeasure<HTMLDivElement>();
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(50);
  const timelineRef = useRef<Timeline | null>(null);
  // Initialize Timeline once the component has mounted and canvasRef.current is available

  const canvasCbRef = useCallback((node: HTMLCanvasElement | null) => {
    canvasRef.current = node;
    if (node !== null) {
      const t = new Timeline(node, {
        // Timeline configuration...\
        fps: 60,
        maxZoom: 8,
        minZoom: 1,
        fill: true,
        scaleSpacing: 80,
        textColor: "#eee",
        pointColor: "#0c9",
        pointWidth: 4,
      });

      t.on("drag", (s) => {
        setStartTime(s[0]);
        setEndTime(s[1]);
      });

      t.on("timeUpdate", (v) => {
        // if player is already playing, keep playing.
        const isPlaying = player?.getInternalPlayer()?.getPlayerState() === 1;
        player?.seekTo(v[0]);
        if (isPlaying) player?.getInternalPlayer()?.playVideo?.();
        console.log("timeUpdate", v, player);
      });

      timelineRef.current = t;
    } else {
      timelineRef.current = null;
    }
  }, []);

  useInterval(
    () => {
      if (!timelineRef.current) return;
      const x = timelineRef.current.draw({
        currentTime: videoStatus
          ? videoStatus.progress +
            (videoStatus?.status == "playing"
              ? (Date.now() - videoStatus.progressRecordedAt) / 1000
              : 0)
          : 0,
        waveform,
      });
      if (x) {
        setStartTime(x.startTime);
        setEndTime(x.endTime);
      }
    },
    timelineRef.current
      ? videoStatus?.status == "playing"
        ? 15
        : videoStatus?.status == "paused" || videoStatus?.status == "stopped"
          ? 50
          : 50
      : null,
  );

  return {
    canvasCbRef,
    containerRef,
    canvasRef,
    containerSize,
    startTime,
    endTime,
  };
};
