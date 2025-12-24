import { cn } from "@/lib/utils";
import {
  aspectClassAtom,
  cellQueueAtom,
  editModeAtom,
  gridDimensionsAtom,
} from "@/store/multiview";
import { useAtomValue } from "jotai";
import { MultiviewCell } from "./MultiviewCell";

interface MultiviewGridProps {
  className?: string;
}

/**
 * Main grid container for multiview layout.
 * Uses CSS Grid with dynamic rows/cols based on aspect class.
 */
export function MultiviewGrid({ className }: MultiviewGridProps) {
  const cells = useAtomValue(cellQueueAtom);
  const { rows, cols } = useAtomValue(gridDimensionsAtom);
  const editMode = useAtomValue(editModeAtom);
  const aspectClass = useAtomValue(aspectClassAtom);

  return (
    <div
      className={cn(
        "relative grid h-full w-full gap-0 overflow-hidden bg-black",
        className,
      )}
      style={{
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
      }}
      data-aspect-class={aspectClass}
    >
      {/* Background grid layer - always visible behind cells */}
      <div
        className="absolute inset-0 pointer-events-none grid"
        style={{
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
        }}
      >
        {Array.from({ length: rows * cols }).map((_, i) => (
          <div key={i} className="border border-white/7" />
        ))}
      </div>

      {cells.map((cell, index) => (
        <MultiviewCell
          key={cell.id}
          cell={cell}
          index={index}
          editMode={editMode}
        />
      ))}

      {/* Visual grid overlay for edit mode */}
      {editMode && (
        <div
          className="pointer-events-none absolute inset-0 grid"
          style={{
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
          }}
        >
          {Array.from({ length: rows * cols }).map((_, i) => (
            <div key={i} className="border border-white/20" />
          ))}
        </div>
      )}
    </div>
  );
}
