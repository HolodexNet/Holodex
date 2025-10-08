import { useComputedDimensions } from "@/hooks/useComputedDimensions";
import {
  isAutoLayoutAtom,
  readMultiviewCellsAtom,
  swapCells,
  updateCellPositionAtom,
} from "@/store/multiview";
import { useAtomValue, useSetAtom } from "jotai";
import GridLayout from "react-grid-layout";
import { VideoCell } from "./video/VideoCell";
import { Cell } from "@/types/multiview";
import { useMemo } from "react";
import { onResize } from "./gridFunctions/resize";
import { onDragStop } from "./gridFunctions/drag";
// import { useMultiview } from "@/hooks/useMultiview";

interface LayoutProps {
  isFullScreen?: boolean;
}

const renderCellContent = (cell: Cell) => {
  switch (cell.type) {
    case "video":
      return <VideoCell id={cell.video.id} />;
    case "chat":
      return <p>Chat cell not implemented yet</p>;
    case "placeholder":
      return <p>Placeholder cell not implemented yet</p>;
    default:
      return <p>Unknown cell type</p>;
  }
};

export function Layout({ isFullScreen = false }: LayoutProps) {
  const { cells } = useAtomValue(readMultiviewCellsAtom);
  const { cellDimensions, dimensions } = useComputedDimensions(isFullScreen);
  const updateCell = useSetAtom(updateCellPositionAtom);
  const isAutoLayout = useAtomValue(isAutoLayoutAtom);
  const setIsAutoLayout = useSetAtom(isAutoLayoutAtom);
  const turnOffAutoLayout = () => setIsAutoLayout(false);
  const swapCellsFn = useSetAtom(swapCells);

  // Pure calculation of layout - no side effects
  const arrangedCell = useMemo(() => {
    return isAutoLayout ? cells : calculateLayout(cells, updateCell);
  }, [cells, isAutoLayout]);

  const renderedCells = useMemo(
    () =>
      arrangedCell.map((cell) => (
        <div
          key={cell.i}
          className="h-full w-full flex flex-col border-2 border-blue-6 rounded-lg box-border bg-slate-5"
        >
          {renderCellContent(cell)}
        </div>
      )),
    [arrangedCell],
  );

  return (
    <GridLayout
      className="layout"
      layout={arrangedCell}
      cols={24}
      rowHeight={Math.max(cellDimensions.rowHeight - 26.0 / 24.0, 1)}
      width={dimensions.width}
      isDraggable={true}
      isResizable={true}
      allowOverlap
      margin={[1, 1]}
      containerPadding={[0, 0]}
      compactType={null}
      resizeHandles={["se", "sw", "ne", "nw", "n", "s", "e", "w"]}
      onDragStop={(
        layout: GridLayout.Layout[],
        oldItem: GridLayout.Layout,
        newItem: GridLayout.Layout,
      ) =>
        onDragStop(
          layout,
          oldItem,
          newItem,
          updateCell,
          turnOffAutoLayout,
          swapCellsFn,
        )
      }
      onResizeStop={(
        layout: GridLayout.Layout[],
        oldItem: GridLayout.Layout,
        newItem: GridLayout.Layout,
      ) => onResize(layout, oldItem, newItem, updateCell, turnOffAutoLayout, 2)}
    >
      {renderedCells}
    </GridLayout>
  );
}

function calculateLayout(
  cells: Cell[],
  updateCell: (id: string, updates: Partial<Cell>) => void,
) {
  const numberOfCells = cells.length;
  const rows = Math.floor(Math.sqrt(numberOfCells));
  const cols = Math.ceil(numberOfCells / rows);

  // Calculate grid units (each cell should span equal portions of the 24x24 grid)
  const cellWidth = Math.floor(24 / cols);
  const cellHeight = Math.floor(24 / rows);

  const sortedCells = cells.toSorted((a, b) => {
    if (a.y < b.y) return -1;
    if (a.y > b.y) return 1;

    if (a.x < b.x) return -1;
    if (a.x > b.x) return 1;
    return 0;
  });

  // recalculate their positions, but update them as normal

  const newPositions: GridLayout.Layout[] = [];

  for (let i = 0; i < numberOfCells; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);

    const newPosition = {
      x: col * cellWidth,
      y: row * cellHeight,
      w: cellWidth,
      h: cellHeight,
    };

    newPositions.push({
      i: sortedCells[i].i,
      ...newPosition,
    });
  }

  const arrangedCells: Cell[] = [];

  for (let i = 0; i < numberOfCells; i++) {
    const matchingEntry = newPositions.filter((pos) => pos.i === cells[i].i)[0];
    arrangedCells.push({
      ...cells[i],
      ...matchingEntry,
    });

    const currentCell = cells[i];
    const hasChanges =
      currentCell.x !== matchingEntry.x ||
      currentCell.y !== matchingEntry.y ||
      currentCell.w !== matchingEntry.w ||
      currentCell.h !== matchingEntry.h;

    if (hasChanges) {
      updateCell(cells[i].i, matchingEntry);
    }
  }

  return arrangedCells;
}
