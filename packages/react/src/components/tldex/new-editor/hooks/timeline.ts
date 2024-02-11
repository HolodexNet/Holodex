import { useState, useRef, useEffect, useCallback } from "react";
import Timeline from "@losting/timeline";
import { gte } from "sorted-array-functions";
import { useMeasure } from "react-use";
import {
  ParsedMessageOFFSETComparator,
  subtitlesAtom,
  useSubtitles,
} from "./subtitles";
import { useAtomValue } from "jotai";

/**
 * waveform should be a [ second, value ] sorted array where the second value is between 0-100
 */
export const useTimelineRendererBase = (waveform: [number, number][]) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  // const containerRef = useRef(null);
  const [containerRef, containerSize] = useMeasure();
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
      });

      t.on("timeUpdate", (v) => {
        setCurrentTime(v[0]);
      });

      timelineRef.current = t;
    } else {
      timelineRef.current = null;
    }
  }, []);

  // Effect for handling currentTime updates
  useEffect(() => {
    if (!timelineRef.current) return;

    const x = timelineRef.current.draw({
      currentTime,
      waveform,
    });
    if (x) {
      setStartTime(x.startTime);
      setEndTime(x.endTime);
    }
  }, [currentTime, waveform]);

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
