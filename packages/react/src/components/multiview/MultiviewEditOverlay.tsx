import type { Cell } from "@/store/multiview";
import { cellQueueAtom, contentMapAtom } from "@/store/multiview";
import { hideCell } from "@/lib/multiview-utils";
import { useSetAtom } from "jotai";
import { useCallback } from "react";

interface MultiviewEditOverlayProps {
  cell: Cell;
  index: number;
}

/**
 * Semi-transparent edit overlay with controls.
 * Rendered over cell content when edit mode is active.
 * This overlay blocks iframe mouse events to allow react-grid-layout drag/resize to work.
 */
export function MultiviewEditOverlay({
  cell,
  index,
}: MultiviewEditOverlayProps) {
  const setCells = useSetAtom(cellQueueAtom);
  const setContentMap = useSetAtom(contentMapAtom);

  const handleClearContent = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
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
    },
    [index, cell.videoId, setCells, setContentMap],
  );

  const handleDeleteCell = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCells((cells) => cells.map((c, i) => (i === index ? hideCell(c) : c)));
      // Remove from content map if video
      if (cell.videoId) {
        setContentMap((map) => {
          const newMap = { ...map };
          delete newMap[cell.videoId!];
          return newMap;
        });
      }
    },
    [index, cell.videoId, setCells, setContentMap],
  );

  return (
    <div className="absolute inset-0 bg-black/40">
      {/* This overlay is intentionally pointer-events-auto to block iframe mouse events 
          and allow react-grid-layout to handle drag/resize */}

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

      {/* Drag handle indicator in center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="py-1 rounded text-white/50 text-sm bg-black/30 px-3">
          Drag to move
        </div>
      </div>
    </div>
  );
}
