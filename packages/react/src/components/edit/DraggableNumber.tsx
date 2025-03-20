import React, { useState, useEffect, useCallback } from "react";

interface DraggableNumberProps {
  value: number;
  onChange: (newValue: number) => void;
  formatter?: (n: number) => string;
  precision?: number;
  negativeOk?: boolean;
  scale?: number;
  horizontal?: boolean;
}

const DraggableNumber = ({
  value, // This should be passed as a prop from the parent component
  onChange, // This replaces the emit functionality to communicate changes back to the parent
  formatter = (x) => x.toString(),
  precision = 1,
  negativeOk = false,
  scale = 0.1,
  horizontal = true,
}: DraggableNumberProps) => {
  const [dragStartPos, setDragStartPos] = useState<number | null>(null);
  const [dragInProgressValue, setDragInProgressValue] = useState(value);

  const rendered =
    dragStartPos == null
      ? formatter(value)
      : formatter(+dragInProgressValue.toFixed(precision));

  const start = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      setDragStartPos(0);
      setDragInProgressValue(value);
      if ((e.target as HTMLSpanElement)?.style) {
        (e.target as HTMLSpanElement).style.cursor = "crosshair";
      }
      document.body.requestPointerLock();

      function mouseMoveHandler(moveEvent: MouseEvent) {
        const movement = horizontal
          ? moveEvent.movementX
          : -moveEvent.movementY;
        setDragStartPos((prevPos) => (prevPos ?? 0) + movement);
        const newValue = value + (dragStartPos ?? 0) * scale;
        setDragInProgressValue(negativeOk ? newValue : Math.max(0, newValue));
      }

      const mouseUpHandler = () => {
        document.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", mouseUpHandler);
        onChange(+dragInProgressValue.toFixed(precision));
        setDragStartPos(null);
        if ((e.target as HTMLSpanElement)?.style) {
          (e.target as HTMLSpanElement).style.cursor = horizontal
            ? "col-resize"
            : "row-resize";
        }
        document.exitPointerLock();
      };

      document.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("mouseup", mouseUpHandler);
    },
    [
      value,
      horizontal,
      precision,
      scale,
      negativeOk,
      onChange,
      dragStartPos,
      dragInProgressValue,
    ],
  );

  useEffect(() => {
    setDragInProgressValue(value);
  }, [value]);

  const className = horizontal ? "cursor-col-resize" : "cursor-row-resize";

  return (
    <span className={className} onMouseDown={start}>
      {rendered}
    </span>
  );
};

export default DraggableNumber;
