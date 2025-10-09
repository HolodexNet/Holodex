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

  const renderedCells = useMemo(
    () =>
      cells.map((cell) => (
        <div
          key={cell.i}
          className="h-full w-full flex flex-col border-2 border-blue-6 rounded-lg box-border bg-slate-5"
        >
          {renderCellContent(cell)}
        </div>
      )),
    [cells],
  );

  return (
    <GridLayout
      className="layout"
      layout={cells}
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
