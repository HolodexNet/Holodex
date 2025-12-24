import { decodeLayout } from "@/lib/multiview-utils";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface PresetPreviewProps {
  layout: string;
  className?: string;
  /** Grid dimensions - defaults to 24x24 for visualization */
  gridSize?: number;
}

/**
 * Mini grid preview visualizing a preset layout.
 */
export function PresetPreview({
  layout,
  className,
  gridSize = 24,
}: PresetPreviewProps) {
  const cells = useMemo(() => {
    try {
      const decoded = decodeLayout(layout);
      return decoded.cells.filter((c) => c.w > 0 && c.h > 0);
    } catch {
      return [];
    }
  }, [layout]);

  // Calculate scale factor - assume original grid is 24x24
  const scale = gridSize / 24;

  return (
    <div
      className={cn("relative bg-base-3 rounded overflow-hidden", className)}
      style={{
        width: `${gridSize}px`,
        height: `${gridSize}px`,
      }}
    >
      {cells.map((cell, i) => {
        const isChat = cell.type === "chat";
        const isVideo = cell.type === "video" || cell.type === "empty";

        return (
          <div
            key={i}
            className={cn(
              "absolute border border-base-6",
              isVideo && "bg-primary/60",
              isChat && "bg-secondary/60",
            )}
            style={{
              left: `${cell.x * scale}px`,
              top: `${cell.y * scale}px`,
              width: `${cell.w * scale}px`,
              height: `${cell.h * scale}px`,
            }}
          />
        );
      })}
    </div>
  );
}
