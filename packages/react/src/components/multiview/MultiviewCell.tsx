import { cn } from "@/lib/utils";
import type { Cell } from "@/store/multiview";
import { VideoCell } from "./VideoCell";
import { ChatCell } from "./ChatCell";
import { EmptyCell } from "./EmptyCell";
import { MultiviewEditOverlay } from "./MultiviewEditOverlay";
import { forwardRef } from "react";

interface MultiviewCellProps {
  cell: Cell;
  index: number;
  editMode: boolean;
}

/**
 * Individual cell in the multiview grid.
 * Renders appropriate content (video/chat/empty) and edit overlay.
 * Position and size is handled by react-grid-layout.
 */
export const MultiviewCell = forwardRef<HTMLDivElement, MultiviewCellProps>(
  function MultiviewCell({ cell, index, editMode }, ref) {
    // Hidden cells (w=0 or h=0) are rendered but not visible
    const isHidden = cell.w <= 0 || cell.h <= 0;

    if (isHidden) {
      // Still render the iframe wrapper to preserve DOM order
      return (
        <div
          ref={ref}
          className="absolute h-0 w-0 overflow-hidden"
          data-cell-id={cell.id}
          data-cell-index={index}
        >
          {cell.type === "video" && cell.videoId && (
            <VideoCell videoId={cell.videoId} hidden />
          )}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn("relative overflow-hidden h-full w-full")}
        data-cell-id={cell.id}
        data-cell-index={index}
        data-cell-type={cell.type}
      >
        {/* Cell content */}
        <div className="absolute inset-0">
          {cell.type === "video" && cell.videoId && (
            <VideoCell videoId={cell.videoId} />
          )}
          {cell.type === "chat" && <ChatCell chatTab={cell.chatTab ?? 0} />}
          {cell.type === "empty" && <EmptyCell cellId={cell.id} />}
        </div>

        {/* Edit mode overlay */}
        {editMode && <MultiviewEditOverlay cell={cell} index={index} />}
      </div>
    );
  },
);
