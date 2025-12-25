import { cn } from "@/lib/utils";
import type { Cell } from "@/store/multiview";
import { EmptyCell } from "./EmptyCell";
import { MultiviewEditOverlay } from "./MultiviewEditOverlay";
import { forwardRef } from "react";

interface MultiviewCellProps {
  cell: Cell;
  index: number;
  editMode: boolean;
}

/**
 * Individual cell in the multiview grid - EDIT CONTROLS ONLY.
 *
 * This component no longer renders video/chat iframes.
 * Iframes are rendered by MultiviewFrames using pure CSS Grid
 * to prevent reloading when the react-grid-layout DOM changes.
 *
 * This component only renders:
 * - EmptyCell (drop target for new videos)
 * - MultiviewEditOverlay (edit mode controls)
 * - Transparent placeholder for video/chat cells (allows drag/resize handles to work)
 */
export const MultiviewCell = forwardRef<HTMLDivElement, MultiviewCellProps>(
  function MultiviewCell({ cell, index, editMode }, ref) {
    // Hidden cells should not be rendered by react-grid-layout at all
    const isHidden = cell.w <= 0 || cell.h <= 0;
    if (isHidden) return null;

    return (
      <div
        ref={ref}
        className={cn("relative overflow-hidden h-full w-full")}
        data-cell-id={cell.id}
        data-cell-index={index}
        data-cell-type={cell.type}
      >
        {/* Only render EmptyCell - videos/chats are in MultiviewFrames */}
        <div className="absolute inset-0">
          {cell.type === "empty" && <EmptyCell cellId={cell.id} />}
        </div>

        {/* Edit mode overlay */}
        {editMode && <MultiviewEditOverlay cell={cell} index={index} />}
      </div>
    );
  },
);
