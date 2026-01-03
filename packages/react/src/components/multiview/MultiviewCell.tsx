import { cn } from "@/lib/utils";
import {
  clearCellAtom,
  convertToChatAtom,
  hideCellAtom,
  refreshCellAtom,
  type Cell,
} from "@/store/multiview";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shadcn/ui/tooltip";
import { forwardRef, useCallback } from "react";
import { useSetAtom } from "jotai";

interface MultiviewCellProps {
  cell: Cell;
  id: string;
}

/**
 * Individual cell in the multiview grid - EDIT CONTROLS ONLY.
 */
export const MultiviewCell = forwardRef<HTMLDivElement, MultiviewCellProps>(
  function MultiviewCell({ cell, id }, ref) {
    const clearCell = useSetAtom(clearCellAtom);
    const hideCell = useSetAtom(hideCellAtom);
    const refreshCell = useSetAtom(refreshCellAtom);
    const convertToChat = useSetAtom(convertToChatAtom);

    const handleClearContent = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        console.log(`Clearing content for cell ${id}`);
        clearCell(id);
      },
      [id, clearCell],
    );

    const handleDeleteCell = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        hideCell(id);
      },
      [id, hideCell],
    );

    const handleRefreshCell = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        console.log(`Refreshing cell ${id}`);
        refreshCell(id);
      },
      [id, refreshCell],
    );

    const handleConvertToChat = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        console.log(`Converting cell ${id} to chat`);
        convertToChat(id);
      },
      [id, convertToChat],
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
            {cell.type === "video" &&
              (cell.videoId ? `Video: ${cell.videoId}` : "Empty Cell")}
            {cell.type === "chat" &&
              (cell.videoId ? `Chat: ${cell.videoId}` : "Chat (empty)")}
          </div>

          {/* Control buttons - explicitly clickable */}
          <div className="flex flex-wrap gap-2">
            {/* Refresh button - reloads the video/chat iframe */}
            {cell.videoId && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={handleRefreshCell}
                    className="flex items-center gap-1 rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-500"
                  >
                    <span className="i-heroicons:arrow-path size-3.5" />
                    Refresh
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Reload this cell's content</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Convert to Chat button - only for video cells */}
            {cell.type === "video" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={handleConvertToChat}
                    className="flex items-center gap-1 rounded bg-purple-600 px-2 py-1 text-xs text-white hover:bg-purple-500"
                  >
                    <span className="i-heroicons:chat-bubble-left-right size-3.5" />
                    To Chat
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Replace this cell with a chat panel</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Clear button - removes content but keeps the cell */}
            {cell.videoId && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={handleClearContent}
                    className="flex items-center gap-1 rounded bg-yellow-600 px-2 py-1 text-xs text-white hover:bg-yellow-500"
                  >
                    <span className="i-heroicons:x-circle size-3.5" />
                    Clear
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Remove content but keep the cell (becomes empty)</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Delete button - removes the cell entirely */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={handleDeleteCell}
                  className="flex items-center gap-1 rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-500"
                >
                  <span className="i-heroicons:trash size-3.5" />
                  Delete
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Remove this cell from the grid</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Drag handle indicator in center */}
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <div className="drag-handle pointer-events-auto cursor-move rounded bg-black/30 px-3 py-1 text-sm text-white/50">
              Drag to move
            </div>
          </div>
        </div>
      </div>
    );
  },
);
