import { useState, useEffect } from "react";

interface UseTrackTiming {
  time: number;
  timeEnd: number;
  duration: number;
  adjustStartTime: (newStartTime: number) => void;
  adjustEndTime: (newEndTime: number) => void;
  adjustDuration: (newDuration: number) => void;
}

function useTrackTiming(
  initialStart: number = 0,
  initialEnd: number = 180,
  initialDuration: number = 180,
): UseTrackTiming {
  const [time, setTime] = useState<number>(initialStart);
  const [timeEnd, setTimeEnd] = useState<number>(initialEnd);
  const [duration, setDuration] = useState<number>(initialDuration);

  useEffect(() => {
    setTimeEnd(time + duration);
  }, [time, duration]);

  useEffect(() => {
    setDuration(timeEnd - time);
  }, [timeEnd]);

  const adjustStartTime = (newStartTime: number) => {
    setTime(newStartTime);
    setTimeEnd(newStartTime + duration); // Update end time to maintain the duration
  };

  const adjustEndTime = (newEndTime: number) => {
    setTimeEnd(newEndTime);
    setDuration(newEndTime - time); // Update duration to reflect the new end time
  };

  const adjustDuration = (newDuration: number) => {
    setDuration(newDuration);
    setTimeEnd(time + newDuration); // Update end time to reflect the new duration
  };

  return {
    time,
    timeEnd,
    duration,
    adjustStartTime,
    adjustEndTime,
    adjustDuration,
  };
}

export default useTrackTiming;
