import { cn } from "@/lib/utils";
import { cellQueueAtom, contentMapAtom, type Cell } from "@/store/multiview";
import { forwardRef, useCallback } from "react";
import { hideCell } from "@/lib/multiview-utils";
import { useSetAtom } from "jotai";

interface MultiviewCellProps {
  cell: Cell;
  id: string;
}

/**
 * Individual cell in the multiview grid - EDIT CONTROLS ONLY.
 *
 * This component no longer renders video/chat iframes.
 * Iframes are rendered by MultiviewFrames using pure CSS Grid
 * to prevent reloading when the react-grid-layout DOM changes.
 *
 * This component only renders:
 * - MultiviewEditOverlay (edit mode controls)
 * - Transparent placeholder for cells (allows drag/resize handles to work)
 */
export const MultiviewCell = forwardRef<HTMLDivElement, MultiviewCellProps>(
  function MultiviewCell({ cell, id }, ref) {
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
      <div
        ref={ref}
        className={cn("relative overflow-hidden h-full w-full")}
        data-cell-id={id}
        data-cell-type={cell.type}
      >
        <div className="absolute inset-6 pointer-events-auto">
          {/* This overlay blocks iframe mouse events to allow react-grid-layout drag/resize */}

          {/* Cell info */}
          <div className="text-sm mb-2 text-white/70">
            {cell.type === "video" && cell.videoId && `Video: ${cell.videoId}`}
            {cell.type === "chat" && `Chat (Tab ${cell.chatTab})`}
            {cell.type === "empty" && "Empty Cell"}
          </div>

          {/* Control buttons - explicitly clickable */}
          <div className="flex gap-2">
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

          {/* Drag handle indicator in center */}
          <div className="absolute flex items-center inset-0 justify-center z-10">
            <div className="py-1 rounded text-sm text-white/50 bg-black/30 px-3 cursor-move drag-handle">
              Drag to move
            </div>
          </div>
        </div>
      </div>
    );
  },
);
