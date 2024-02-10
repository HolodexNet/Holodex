import React, { useState, useRef, useEffect, useMemo } from "react";
import Timeline from "@losting/timeline";
import { gte } from "sorted-array-functions";
import { useMeasure } from "react-use";
import { useSubtitles } from "./subtitles";

const useTimelineRendererBase = (list, waveform, currentTime) => {
  const canvasRef = useRef(null);
  // const containerRef = useRef(null);
  const [containerRef, containerSize] = useMeasure();
  const { subtitles: allSubs } = useSubtitles(); // Use Jotai atom for subtitles
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(1);

  useEffect(() => {
    if (!canvasRef.current) return;

    const t = new Timeline(canvasRef.current, {
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
      currentTime(v[0]);
    });

    const draw = () => {
      const x = t.draw({
        currentTime: currentTime,
        waveform: waveform || [],
      });
      if (x) {
        setStartTime(x.startTime);
        setEndTime(x.endTime);
      }
    };

    draw();

    return () => {
      // Cleanup if necessary, e.g., removing event listeners
    };
  }, [canvasRef, currentTime, waveform]);

  const currentSubs = useMemo(() => {
    const lower = gte(
      allSubs,
      { video_offset: startTime - 10 },
      ChatDB.ParsedMessageOFFSETComparator,
    );
    const upper = gte(
      allSubs,
      { video_offset: endTime + 10 },
      ChatDB.ParsedMessageOFFSETComparator,
    );
    return allSubs.slice(lower, upper < 0 ? undefined : upper);
  }, [allSubs, startTime, endTime]);

  return {
    containerRef,
    canvasRef,
    containerSize,
    allSubs,
    currentSubs,
    startTime,
    endTime,
  };
};
