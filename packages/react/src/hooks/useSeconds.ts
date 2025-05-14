import { useState, useEffect } from "react";

const roundSeconds = (
  t: Date,
  delay: number,
  forceFloor: boolean,
  interval: number,
): [Date, number] => {
  const tk = +t - delay;
  const d = (tk + interval) % interval;
  const nextMs = interval - d;

  if (d < interval / 2 || forceFloor) {
    return [new Date(tk - d + delay), nextMs];
  }
  return [new Date(tk + (interval - d + delay)), nextMs + interval];
};

export const useSeconds = (
  delay = 0,
  interval = 1000,
): [Date, Date, number] => {
  const [eventTimeTmp, setEventTime] = useState<Date | null>(null);
  const eventTime = eventTimeTmp || new Date();
  const [time, nextMs] = roundSeconds(
    eventTime,
    delay,
    !eventTimeTmp,
    interval,
  );

  useEffect(() => {
    const handle = setTimeout(
      () => {
        setEventTime(new Date());
      },
      Math.max(nextMs, 1),
    );

    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventTime]);

  return [time, eventTime, nextMs];
};
