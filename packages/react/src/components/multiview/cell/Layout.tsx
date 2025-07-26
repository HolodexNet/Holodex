import { useComputedDimensions } from "@/hooks/useComputedDimensions";
import { readMultiviewCellsAtom } from "@/store/multiview";
import { useAtomValue } from "jotai";
import GridLayout from "react-grid-layout";
import { VideoCell } from "./video/VideoCell";
import { Cell } from "@/types/multiview";
import { onDragStop, onResize } from "./GridFunctions";
import { useMemo } from "react";

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

  const arrangedCell = useMemo(() => calculateLayout(cells), [cells]);

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
      onDragStop={onDragStop}
      onResizeStop={(
        layout: GridLayout.Layout[],
        oldItem: GridLayout.Layout,
        newItem: GridLayout.Layout,
      ) => onResize(layout, oldItem, newItem, 2)}
    >
      {renderedCells}
    </GridLayout>
  );
}

function calculateLayout(cells: Cell[]) {
  const numberOfCells = cells.length;
  const rows = Math.floor(Math.sqrt(numberOfCells));
  const cols = Math.ceil(numberOfCells / rows);

  // Calculate grid units (each cell should span equal portions of the 24x24 grid)
  const cellWidth = Math.floor(24 / cols);
  const cellHeight = Math.floor(24 / rows);

  const arrangedCells: Cell[] = [];

  for (let i = 0; i < numberOfCells; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);

    arrangedCells.push({
      ...cells[i],
      x: col * cellWidth,
      y: row * cellHeight,
      w: cellWidth,
      h: cellHeight,
    });
  }

  return arrangedCells;
}
