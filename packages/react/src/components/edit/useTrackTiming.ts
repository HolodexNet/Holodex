import { useState, useEffect } from "react";

interface UseTrackTiming {
  timeStart: number;
  timeEnd: number;
  duration: number;
  adjustStartTime: (newStartTime: number) => void;
  adjustEndTime: (newEndTime: number) => void;
  adjustDuration: (newDuration: number) => void;
}

function useTrackTiming(
  videoDuration: number,
  initialStart: number = 0,
  initialEnd: number = 180,
  initialDuration: number = 180,
): UseTrackTiming {
  const [timeStart, setTimeStart] = useState<number>(initialStart);
  const [timeEnd, setTimeEnd] = useState<number>(initialEnd);
  const [duration, setDuration] = useState<number>(initialDuration);

  useEffect(() => {
    const adjustedEndTime = Math.min(timeStart + duration, videoDuration);
    setTimeEnd(adjustedEndTime);
    setDuration(adjustedEndTime - timeStart);
  }, [timeStart, duration, videoDuration]);

  useEffect(() => {
    const adjustedDuration = timeEnd - timeStart;
    setDuration(adjustedDuration);
  }, [timeStart, timeEnd, videoDuration]);

  const adjustStartTime = (newStartTime: number) => {
    const clampedStartTime = Math.max(0, Math.min(newStartTime, videoDuration));
    setTimeStart(clampedStartTime);
    const newEndTime = clampedStartTime + duration;
    setTimeEnd(newEndTime > videoDuration ? videoDuration : newEndTime);
    if (newEndTime > videoDuration) {
      setDuration(videoDuration - clampedStartTime);
    }
  };

  const adjustEndTime = (newEndTime: number) => {
    const clampedEndTime = Math.max(
      timeStart,
      Math.min(newEndTime, videoDuration),
    );
    setTimeEnd(clampedEndTime);
    setDuration(clampedEndTime - timeStart);
  };

  const adjustDuration = (newDuration: number) => {
    const clampedDuration = Math.max(
      0,
      Math.min(newDuration, videoDuration - timeStart),
    );
    setDuration(clampedDuration);
    setTimeEnd(timeStart + clampedDuration);
  };
  return {
    timeStart,
    timeEnd,
    duration,
    adjustStartTime,
    adjustEndTime,
    adjustDuration,
  };
}

export default useTrackTiming;
