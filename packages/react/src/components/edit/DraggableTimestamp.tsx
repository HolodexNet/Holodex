import { useState, Ref, useEffect, useRef } from "react";
import { useAtomValue } from "jotai";
// import { yourTimestampAtom } from './store'; // Replace with your actual atom path
import { videoStatusAtomFamily } from "@/store/player";
import MaskedInput from "react-text-mask";
import { Input } from "@/shadcn/ui/input";
import { clsx } from "clsx";

const parseTime = (timeString: string): number => {
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

const calculateTimeChange = (deltaX: number): number => {
  const maxDistance = 100; // Max distance for 1:1 ratio
  const minRatio = 2; // Ratio at max distance
  const maxRatio = 10; // Ratio at zero distance

  // Calculate ratio based on the distance of deltaX from 0 to maxDistance
  let ratio = maxRatio;
  if (Math.abs(deltaX) < maxDistance) {
    // Interpolation formula to gradually change from maxRatio to minRatio
    const progress = Math.abs(deltaX) / maxDistance;
    ratio = maxRatio - progress * (maxRatio - minRatio);
  } else {
    ratio = minRatio;
  }

  // Calculate time change with interpolated ratio
  return Math.floor(deltaX / ratio);
};

interface ITimeAdjusterProps {
  videoId: string;
  value: number;
  onValueChange: (value: number) => void;
}
export function TimeAdjuster({
  videoId,
  value,
  onValueChange,
}: ITimeAdjusterProps) {
  const videoStatusAtom = videoStatusAtomFamily(videoId || "x");
  const videoStatus = useAtomValue(videoStatusAtom);

  const [time, setTime] = useState(value);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    setTime(value);
  }, [value]);

  const incrementTime = (amount: number): void => {
    setTime((prev: number) => {
      const newValue = Math.max(0, prev + amount);
      onValueChange(newValue);
      return newValue;
    });
  };

  const setTimeToCurrent = (): void => {
    setTime(+videoStatus.progress.toFixed(1));
    onValueChange(+videoStatus.progress.toFixed(1));
  };

  const isDragging = useRef(false);
  const wasDragged = useRef(false);
  const dragStartX = useRef(0);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const dragStartTime = useRef(value);

  useEffect(() => {
    // Clean up timeout when the component unmounts
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, []);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    isDragging.current = true;
    dragStartX.current = event.clientX;
    dragStartTime.current = time;
    wasDragged.current = false;

    event.preventDefault(); // Prevents text selection during drag

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current) return;

      const currentX = moveEvent.clientX;
      const deltaX = currentX - dragStartX.current;
      // const scaleFactor = 0.1;
      const timeChange = calculateTimeChange(deltaX);

      setTime(Math.floor(Math.max(0, dragStartTime.current + timeChange)));
      wasDragged.current = true;
    };

    const handleMouseUp = (event: MouseEvent) => {
      isDragging.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      if (wasDragged.current) {
        const currentX = event.clientX;
        const deltaX = currentX - dragStartX.current;
        const timeChange = calculateTimeChange(deltaX);

        const t = Math.floor(Math.max(0, dragStartTime.current + timeChange));
        setTime(t);
        onValueChange(t);
      }

      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }

      timeoutId.current = setTimeout(() => {
        wasDragged.current = false;
      }, 200); // Delay to prevent click action
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="flex items-center justify-center space-x-4">
      <div className="relative flex flex-col items-center px-2 text-base-8">
        <button
          className="text-sm text-base-8 hover:text-base-10"
          onClick={setTimeToCurrent}
        >
          Set to current time
        </button>
        <div
          className="peer flex cursor-ew-resize items-center justify-center py-1"
          onMouseDown={handleMouseDown}
        >
          <div
            className="i-mdi:chevron-double-left cursor-pointer  hover:text-base-10"
            onClick={() => incrementTime(-5)}
          />
          <div
            className="i-mdi:chevron-left cursor-pointer  hover:text-base-10 "
            onClick={() => incrementTime(-1)}
          />

          {editMode ? (
            <MaskedInput
              mask={[/\d/, /\d/, ":", /\d/, /\d/, ":", /\d/, /\d/]}
              placeholder="00:00:00"
              guide={true}
              autoFocus={true}
              onBlur={() => {
                setEditMode(false);
                onValueChange(time);
              }}
              onFocus={(e) => {
                e.target.value = formatTime(time);
              }}
              onChange={(event) => {
                const t = parseTime(event.target.value);
                // check if t is NaN
                if (!isNaN(t)) {
                  setTime(t);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  setEditMode(false);
                  onValueChange(time);
                }
              }}
              render={(ref, props) => {
                return (
                  <Input
                    ref={ref as unknown as Ref<HTMLInputElement>}
                    {...props}
                    className="h-7 w-28 py-0 text-center font-mono text-lg text-base-12"
                  />
                );
              }}
            />
          ) : (
            <div
              className="relative mx-1 font-mono text-lg text-base-11"
              onClick={() => {
                if (!wasDragged.current) setEditMode(true);
              }}
            >
              <span>{formatTime(time)}</span>
            </div>
          )}
          <div
            className="i-mdi:chevron-right cursor-pointer  hover:text-base-10"
            onClick={() => incrementTime(1)}
          />
          <div
            className="i-mdi:chevron-double-right cursor-pointer  hover:text-base-10"
            onClick={() => incrementTime(5)}
          />
        </div>
        <span
          className={clsx(
            "pointer-events-none absolute top-14 text-center font-sans text-xs text-base-7 opacity-0 transition-opacity",
            {
              "peer-hover:opacity-100": !editMode,
            },
          )}
        >
          Drag or click to edit
        </span>
      </div>
    </div>
  );
}

export function DurationAdjuster({
  value,
  onValueChange,
  max,
}: Omit<ITimeAdjusterProps, "videoId"> & { max: number }) {
  const [time, setTime] = useState(value);
  const [editMode, setEditMode] = useState(false);

  const isDragging = useRef(false);
  const wasDragged = useRef(false);
  const dragStartX = useRef(0);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const dragStartTime = useRef(value);

  useEffect(() => {
    // Clean up timeout when the component unmounts
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, []);

  useEffect(() => {
    setTime(value);
  }, [value]);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    isDragging.current = true;
    dragStartX.current = event.clientX;
    dragStartTime.current = time;
    wasDragged.current = false;

    event.preventDefault(); // Prevents text selection during drag

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current) return;

      const currentX = moveEvent.clientX;
      const deltaX = currentX - dragStartX.current;
      // const scaleFactor = 0.1;
      const timeChange = calculateTimeChange(deltaX);

      setTime(Math.floor(Math.max(0, dragStartTime.current + timeChange)));
      wasDragged.current = true;
    };

    const handleMouseUp = (event: MouseEvent) => {
      isDragging.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      if (wasDragged.current) {
        const currentX = event.clientX;
        const deltaX = currentX - dragStartX.current;
        const timeChange = calculateTimeChange(deltaX);

        const t = Math.floor(Math.max(0, dragStartTime.current + timeChange));
        setTime(Math.min(t, max));
        onValueChange(Math.min(t, max));
      }

      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }

      timeoutId.current = setTimeout(() => {
        wasDragged.current = false;
      }, 200); // Delay to prevent click action
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="flex items-center justify-center gap-x-2">
      <div className="relative flex flex-col items-center pt-5">
        <div
          className="peer flex cursor-ew-resize items-center justify-center gap-1 py-1 text-base-8"
          onMouseDown={handleMouseDown}
        >
          {editMode ? (
            <MaskedInput
              mask={[/\d/, /\d/, ":", /\d/, /\d/, ":", /\d/, /\d/]}
              placeholder="00:00:00"
              guide={true}
              autoFocus={true}
              onBlur={() => {
                setEditMode(false);
                onValueChange(time);
              }}
              onFocus={(e) => {
                e.target.value = formatTime(time);
              }}
              onChange={(event) => {
                const t = parseTime(event.target.value);
                // check if t is NaN
                if (!isNaN(t)) {
                  setTime(t);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  setEditMode(false);
                  onValueChange(time);
                }
              }}
              render={(ref, props) => {
                return (
                  <Input
                    ref={ref as unknown as Ref<HTMLInputElement>}
                    {...props}
                    className="h-7 w-28 py-0 text-center font-mono text-base-12"
                  />
                );
              }}
            />
          ) : (
            <div
              className="relative mx-3 mt-0.5 font-mono text-base-11"
              onClick={() => {
                if (!wasDragged.current) setEditMode(true);
              }}
            >
              <span>{formatTime(time)}</span>
            </div>
          )}
        </div>
        <span
          className={clsx(
            "pointer-events-none absolute top-14 w-40 text-center font-sans text-xs text-base-7 opacity-0 transition-opacity",
            {
              "peer-hover:opacity-100": !editMode,
            },
          )}
        >
          Drag or click to edit
        </span>
      </div>
    </div>
  );
}
