import { useComputedDimensions } from "@/hooks/useComputedDimensions";
import {
  isAutoLayoutAtom,
  readMultiviewCellsAtom,
  updateCellPositionAtom,
} from "@/store/multiview";
import { useAtomValue, useSetAtom } from "jotai";
import GridLayout from "react-grid-layout";
import { VideoCell } from "./video/VideoCell";
import { Cell } from "@/types/multiview";
import { useMemo } from "react";
import { onResize } from "./gridFunctions/resize";
import { onDragStop } from "./gridFunctions/drag";

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

  // Pure calculation of layout - no side effects
  const arrangedCell = useMemo(() => {
    return isAutoLayout ? cells : calculateLayout(cells, updateCell);
  }, [cells, isAutoLayout, updateCell]);

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
      ) => onDragStop(layout, oldItem, newItem, updateCell, turnOffAutoLayout)}
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
  if (cells.length === 0) return [];

  const numberOfCells = cells.length;
  const rows = Math.floor(Math.sqrt(numberOfCells));
  const cols = Math.ceil(numberOfCells / rows);

  // Calculate grid units (each cell should span equal portions of the 24x24 grid)
  const cellWidth = Math.floor(24 / cols);
  const cellHeight = Math.floor(24 / rows);

  const sortedCells = cells.toSorted((a, b) =>
    a.y !== b.y ? a.y - b.y : a.x - b.x,
  );

  const newPositions: GridLayout.Layout[] = sortedCells.map((cell, i) => ({
    i: cell.i,
    x: (i % cols) * cellWidth,
    y: Math.floor(i / cols) * cellHeight,
    w: cellWidth,
    h: cellHeight,
  }));

  return cells.map((cell) => {
    const matchingEntry = newPositions.find((pos) => pos.i === cell.i)!;

    if (
      cell.x !== matchingEntry.x ||
      cell.y !== matchingEntry.y ||
      cell.w !== matchingEntry.w ||
      cell.h !== matchingEntry.h
    ) {
      updateCell(cell.i, matchingEntry);
    }

    return { ...cell, ...matchingEntry };
  });
}
