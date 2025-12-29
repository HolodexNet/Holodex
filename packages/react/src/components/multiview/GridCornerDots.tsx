import { useMemo } from "react";

interface GridCornerDotsProps {
  width: number;
  height: number;
  cols: number;
  rows: number;
  markSize?: number;
  className?: string;
}

/**
 * Renders plus marks (+) at each grid intersection point.
 * Creates a corner-mark pattern for visual grid guidance.
 */
export function GridCornerDots({
  width,
  height,
  cols,
  rows,
  markSize = 6,
  className,
}: GridCornerDotsProps) {
  const marks = useMemo(() => {
    const cellWidth = width / cols;
    const cellHeight = height / rows;
    const points: { x: number; y: number; key: string }[] = [];

    // Generate intersection points (including edges)
    for (let row = 0; row <= rows; row++) {
      for (let col = 0; col <= cols; col++) {
        points.push({
          x: col * cellWidth,
          y: row * cellHeight,
          key: `${col}-${row}`,
        });
      }
    }
    return points;
  }, [width, height, cols, rows]);

  const halfSize = markSize / 2;

  return (
    <svg
      width={width}
      height={height}
      className={className}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      {marks.map((mark) => (
        <g key={mark.key} className="mv-grid-corner-mark">
          {/* Horizontal line */}
          <line
            x1={mark.x - halfSize}
            y1={mark.y}
            x2={mark.x + halfSize}
            y2={mark.y}
          />
          {/* Vertical line */}
          <line
            x1={mark.x}
            y1={mark.y - halfSize}
            x2={mark.x}
            y2={mark.y + halfSize}
          />
        </g>
      ))}
    </svg>
  );
}
