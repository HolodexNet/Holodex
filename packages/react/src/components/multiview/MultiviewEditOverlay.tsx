import { cn } from "@/lib/utils";
import type { Cell } from "@/store/multiview";
import { cellQueueAtom, contentMapAtom } from "@/store/multiview";
import { hideCell } from "@/lib/multiview-utils";
import { useSetAtom } from "jotai";
import { useCallback } from "react";

interface MultiviewEditOverlayProps {
  cell: Cell;
  index: number;
}

type ResizeDirection = "nw" | "n" | "ne" | "w" | "e" | "sw" | "s" | "se";

/**
 * Semi-transparent edit overlay with resize handles and controls.
 * Rendered over cell content when edit mode is active.
 */
export function MultiviewEditOverlay({
  cell,
  index,
}: MultiviewEditOverlayProps) {
  const setCells = useSetAtom(cellQueueAtom);
  const setContentMap = useSetAtom(contentMapAtom);

  const handleClearContent = useCallback(() => {
    setCells((cells) =>
      cells.map((c, i) =>
        i === index
          ? {
              ...c,
              type: "empty" as const,
              videoId: undefined,
              chatTab: undefined,
            }
          : c,
      ),
    );
    // Remove from content map if video
    if (cell.videoId) {
      setContentMap((map) => {
        const newMap = { ...map };
        delete newMap[cell.videoId!];
        return newMap;
      });
    }
  }, [index, cell.videoId, setCells, setContentMap]);

  const handleDeleteCell = useCallback(() => {
    setCells((cells) => cells.map((c, i) => (i === index ? hideCell(c) : c)));
    // Remove from content map if video
    if (cell.videoId) {
      setContentMap((map) => {
        const newMap = { ...map };
        delete newMap[cell.videoId!];
        return newMap;
      });
    }
  }, [index, cell.videoId, setCells, setContentMap]);

  const handleResizeStart = useCallback(
    (direction: ResizeDirection) => (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const startCell = { ...cell };

      // Get grid element for calculating grid unit size
      const gridEl = (e.target as HTMLElement).closest("[data-aspect-class]");
      if (!gridEl) return;

      const gridRect = gridEl.getBoundingClientRect();
      const gridStyles = window.getComputedStyle(gridEl);
      const cols = parseInt(
        gridStyles.gridTemplateColumns.split(" ").length.toString(),
      );
      const rows = parseInt(
        gridStyles.gridTemplateRows.split(" ").length.toString(),
      );
      const unitW = gridRect.width / cols;
      const unitH = gridRect.height / rows;

      // Debug logging
      console.log("Resize start:", {
        direction,
        gridRect: {
          left: gridRect.left,
          top: gridRect.top,
          width: gridRect.width,
          height: gridRect.height,
        },
        cols,
        rows,
        unitW,
        unitH,
        devicePixelRatio: window.devicePixelRatio,
        startCell: {
          x: startCell.x,
          y: startCell.y,
          w: startCell.w,
          h: startCell.h,
        },
      });

      const onMove = (moveE: PointerEvent) => {
        // Calculate mouse position relative to grid in grid units
        const mouseGridX = (moveE.clientX - gridRect.left) / unitW;
        const mouseGridY = (moveE.clientY - gridRect.top) / unitH;

        console.log("Resize move:", {
          clientX: moveE.clientX,
          clientY: moveE.clientY,
          relativeX: moveE.clientX - gridRect.left,
          relativeY: moveE.clientY - gridRect.top,
          mouseGridX,
          mouseGridY,
          roundedX: Math.round(mouseGridX),
          roundedY: Math.round(mouseGridY),
        });

        let newX = startCell.x;
        let newY = startCell.y;
        let newW = startCell.w;
        let newH = startCell.h;

        // Apply resize based on direction - snap edges to mouse position
        if (direction.includes("w")) {
          // Left edge follows mouse X
          const snappedX = Math.max(0, Math.round(mouseGridX));
          const maxX = startCell.x + startCell.w - 1; // Can't shrink past right edge minus 1
          newX = Math.min(snappedX, maxX);
          newW = startCell.x + startCell.w - newX;
        }
        if (direction.includes("e")) {
          // Right edge follows mouse X
          const snappedRight = Math.min(cols, Math.round(mouseGridX));
          const minRight = startCell.x + 1; // At least 1 unit wide
          newW = Math.max(minRight, snappedRight) - startCell.x;
        }
        if (direction.includes("n")) {
          // Top edge follows mouse Y
          const snappedY = Math.max(0, Math.round(mouseGridY));
          const maxY = startCell.y + startCell.h - 1; // Can't shrink past bottom edge minus 1
          newY = Math.min(snappedY, maxY);
          newH = startCell.y + startCell.h - newY;
        }
        if (direction.includes("s")) {
          // Bottom edge follows mouse Y
          const snappedBottom = Math.min(rows, Math.round(mouseGridY));
          const minBottom = startCell.y + 1; // At least 1 unit tall
          newH = Math.max(minBottom, snappedBottom) - startCell.y;
        }

        setCells((cells) =>
          cells.map((c, i) =>
            i === index ? { ...c, x: newX, y: newY, w: newW, h: newH } : c,
          ),
        );
      };

      const onUp = () => {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
      };

      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    },
    [cell, index, setCells],
  );

  return (
    <div className="absolute inset-0 bg-black/40">
      {/* Corner resize handles */}
      <ResizeHandle direction="nw" onPointerDown={handleResizeStart("nw")} />
      <ResizeHandle direction="ne" onPointerDown={handleResizeStart("ne")} />
      <ResizeHandle direction="sw" onPointerDown={handleResizeStart("sw")} />
      <ResizeHandle direction="se" onPointerDown={handleResizeStart("se")} />

      {/* Edge resize handles */}
      <ResizeHandle direction="n" onPointerDown={handleResizeStart("n")} />
      <ResizeHandle direction="s" onPointerDown={handleResizeStart("s")} />
      <ResizeHandle direction="w" onPointerDown={handleResizeStart("w")} />
      <ResizeHandle direction="e" onPointerDown={handleResizeStart("e")} />

      {/* Control buttons */}
      <div className="absolute flex gap-2 bottom-2 right-2">
        {cell.type !== "empty" && (
          <button
            onClick={handleClearContent}
            className="rounded bg-yellow-600 px-2 py-1 text-xs text-white hover:bg-yellow-500"
          >
            Clear
          </button>
        )}
        <button
          onClick={handleDeleteCell}
          className="rounded px-2 py-1 text-xs text-white bg-red-600 hover:bg-red-500"
        >
          Delete
        </button>
      </div>

      {/* Cell info */}
      <div className="absolute text-xs left-2 top-2 text-white/70">
        {cell.type === "video" && cell.videoId && `Video: ${cell.videoId}`}
        {cell.type === "chat" && `Chat (Tab ${cell.chatTab})`}
        {cell.type === "empty" && "Empty Cell"}
      </div>
    </div>
  );
}

interface ResizeHandleProps {
  direction: ResizeDirection;
  onPointerDown: (e: React.PointerEvent) => void;
}

function ResizeHandle({ direction, onPointerDown }: ResizeHandleProps) {
  const isCorner = ["nw", "ne", "sw", "se"].includes(direction);
  const isVertical = ["n", "s"].includes(direction);
  const isHorizontal = ["w", "e"].includes(direction);

  const positionClasses = {
    nw: "left-0 top-0",
    n: "left-1/2 top-0 -translate-x-1/2",
    ne: "right-0 top-0",
    w: "left-0 top-1/2 -translate-y-1/2",
    e: "right-0 top-1/2 -translate-y-1/2",
    sw: "left-0 bottom-0",
    s: "left-1/2 bottom-0 -translate-x-1/2",
    se: "right-0 bottom-0",
  }[direction];

  const cursorClasses = {
    nw: "cursor-nwse-resize",
    ne: "cursor-nesw-resize",
    sw: "cursor-nesw-resize",
    se: "cursor-nwse-resize",
    n: "cursor-ns-resize",
    s: "cursor-ns-resize",
    w: "cursor-ew-resize",
    e: "cursor-ew-resize",
  }[direction];

  return (
    <div
      className={cn(
        "absolute z-10",
        positionClasses,
        cursorClasses,
        isCorner && "h-4 w-4 rounded bg-white/80 hover:bg-white",
        isVertical && "h-2 w-12 rounded-full bg-white/60 hover:bg-white/80",
        isHorizontal && "h-12 w-2 rounded-full bg-white/60 hover:bg-white/80",
      )}
      onPointerDown={onPointerDown}
    />
  );
}
