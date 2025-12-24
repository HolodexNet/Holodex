interface EmptyCellProps {
  cellId: string;
}

/**
 * Empty cell placeholder with "Add Video" UI.
 */
export function EmptyCell({ cellId }: EmptyCellProps) {
  return (
    <div
      className="flex h-full w-full cursor-pointer items-center justify-center bg-base-2 transition-colors hover:bg-base-3"
      data-empty-cell={cellId}
    >
      <div className="flex items-center text-base-11 flex-col gap-2">
        <div className="opacity-50 h-12 w-12 i-lucide:plus-circle" />
        <span className="text-sm">Click to add video</span>
      </div>
    </div>
  );
}
