import { useState, useRef, useCallback } from "react";
import Timeline from "@losting/timeline";
import { gte } from "sorted-array-functions";
import { useMeasure } from "react-use";
import {
  ParsedMessageOFFSETComparator,
  subtitlesAtom,
  useSubtitles,
} from "./subtitles";
import { useAtomValue } from "jotai";
import { PlayingVideoState, playerRefAtom } from "@/store/player";
import { useInterval } from "usehooks-ts";
import { useAtomCallback } from "jotai/utils";

/**
 * waveform should be a [ second, value ] sorted array where the second value is between 0-100
 */
export const useTimelineRendererBase = (
  waveform: [number, number][],
  videoStatus: PlayingVideoState | undefined,
) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const getPlayer = useAtomCallback(
    useCallback((get) => get(playerRefAtom), []),
  );

  // const [currentTime, setCurrentTime] = useState(0);
  // const containerRef = useRef(null);
  const [containerRef, containerSize] = useMeasure<HTMLDivElement>();
  const listOfSubs = useAtomValue(subtitlesAtom);
  const { subtitles: allSubs } = useSubtitles(); // Use Jotai atom for subtitles
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(50);
  const timelineRef = useRef<Timeline | null>(null);
  // Initialize Timeline once the component has mounted and canvasRef.current is available

  const canvasCbRef = useCallback((node: HTMLCanvasElement | null) => {
    canvasRef.current = node;
    if (node !== null) {
      const t = new Timeline(node, {
        // Timeline configuration...\
        fps: 120,
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
        console.log("drag", s);
      });

      t.on("timeUpdate", (v) => {
        // setCurrentTime(v[0]);
        const player = getPlayer();
        player?.seekTo(v[0]);
        player?.getInternalPlayer()?.playVideo?.();
        console.log("timeUpdate", v);
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
            (Date.now() - videoStatus.progressRecordedAt) / 1000
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
          ? null
          : 100
      : null,
  );

  // const currentSubs = () => {
  const lower = gte(
    listOfSubs,
    { video_offset: startTime - 10 } as unknown as ParsedMessage,
    ParsedMessageOFFSETComparator,
  );
  const upper = gte(
    listOfSubs,
    { video_offset: endTime + 10 } as unknown as ParsedMessage,
    ParsedMessageOFFSETComparator,
  );
  const currentSubs = listOfSubs.slice(lower, upper < 0 ? undefined : upper);
  // }, [listOfSubs, startTime, endTime]);

  return {
    canvasCbRef,
    containerRef,
    canvasRef,
    containerSize,
    allSubs,
    currentSubs,
    startTime,
    endTime,
  };
};
