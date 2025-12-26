import type { Cell } from "@/store/multiview";
import { cellQueueAtom, contentMapAtom } from "@/store/multiview";
import { hideCell } from "@/lib/multiview-utils";
import { useSetAtom } from "jotai";
import { useCallback } from "react";

interface MultiviewEditOverlayProps {
  cell: Cell;
  id: string;
}

/**
 * Semi-transparent edit overlay with controls.
 * Rendered over cell content when edit mode is active.
 * This overlay blocks iframe mouse events to allow react-grid-layout drag/resize to work.
 */
export function MultiviewEditOverlay({ cell, id }: MultiviewEditOverlayProps) {
  const setCells = useSetAtom(cellQueueAtom);
  const setContentMap = useSetAtom(contentMapAtom);

  const handleClearContent = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      console.log(`Clearing content for cell ${id}`);
      setCells((cells) =>
        cells.map((c) =>
          c.id === id
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
    [id, cell.videoId, setCells, setContentMap],
  );

  const handleDeleteCell = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCells((cells) => cells.map((c) => (c.id === id ? hideCell(c) : c)));
      // Remove from content map if video
      if (cell.videoId) {
        setContentMap((map) => {
          const newMap = { ...map };
          delete newMap[cell.videoId!];
          return newMap;
        });
      }
    },
    [id, cell.videoId, setCells, setContentMap],
  );

  return (
    <div className="absolute inset-0 bg-black/40 pointer-events-auto">
      {/* This overlay blocks iframe mouse events to allow react-grid-layout drag/resize */}

      {/* Control buttons - explicitly clickable */}
      <div className="absolute flex pointer-events-auto z-50 gap-2 bottom-2 right-2">
        {cell.type !== "empty" && (
          <button
            type="button"
            onClick={handleClearContent}
            className="rounded px-2 py-1 text-xs bg-yellow-600 text-white hover:bg-yellow-500"
          >
            Clear
          </button>
        )}
        <button
          type="button"
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
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="py-1 rounded text-sm text-white/50 bg-black/30 px-3 cursor-move drag-handle">
          Drag to move
        </div>
      </div>
    </div>
  );
}
