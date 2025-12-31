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
        className={cn("relative h-full w-full overflow-hidden")}
        data-cell-id={id}
        data-cell-type={cell.type}
      >
        <div className="pointer-events-auto absolute inset-6 size-full">
          {/* This overlay blocks iframe mouse events to allow react-grid-layout drag/resize */}

          {/* Cell info */}
          <div className="mb-2 text-sm text-white/70">
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
                className="rounded bg-yellow-600 px-2 py-1 text-xs text-white hover:bg-yellow-500"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={handleDeleteCell}
              className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-500"
            >
              Delete
            </button>
          </div>

          {/* Drag handle indicator in center */}
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="drag-handle cursor-move rounded bg-black/30 px-3 py-1 text-sm text-white/50">
              Drag to move
            </div>
          </div>
        </div>
      </div>
    );
  },
);
