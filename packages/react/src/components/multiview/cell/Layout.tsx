import { useComputedDimensions } from "@/hooks/useComputedDimensions";
import { readMultiviewCellsAtom } from "@/store/multiview";
import { useAtomValue } from "jotai";
import GridLayout from "react-grid-layout";
import { VideoCell } from "./video/VideoCell";
import { Cell } from "@/types/multiview";
import { cn } from "@/lib/utils";
import { isSidebarOpenAtom } from "@/hooks/useFrame";

interface LayoutProps {
  isFullScreen?: boolean;
  collapseToolbar: boolean;
}

export function Layout({
  isFullScreen = false,
  collapseToolbar = false,
}: LayoutProps) {
  const isSidebarOpen = useAtomValue(isSidebarOpenAtom);
  const { cells } = useAtomValue(readMultiviewCellsAtom);
  const { cellDimensions, dimensions } = useComputedDimensions(isFullScreen);

  const arrangedCell = calculateLayout(cells);

  return (
    <div
      className={cn(
        "layout z-30 absolute p-0 overflow-hidden",
        isSidebarOpen ? "w-[calc(100%-var(--sidebar-width))]" : "w-full",
        isFullScreen
          ? collapseToolbar
            ? "h-full"
            : "h-[calc(100%-var(--toolbar-height))]"
          : collapseToolbar
            ? "h-[calc(100%-var(--header-height))]"
            : "h-[calc(100%-var(--toolbar-height)-var(--header-height))]",
      )}
    >
      <GridLayout
        className="layout"
        layout={arrangedCell}
        cols={24}
        rowHeight={Math.max(cellDimensions.rowHeight - 26.0 / 24.0, 1)}
        width={dimensions.width}
        isDraggable={true}
        isResizable={true}
        margin={[1, 1]}
        containerPadding={[0, 0]}
        compactType={"horizontal"}
        isBounded={true}
        resizeHandles={["se", "sw", "ne", "nw", "n", "s", "e", "w"]}
        // onLayoutChange={handleLayoutChange}
      >
        {arrangedCell.map((cell) => {
          const renderCellContent = () => {
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

          return (
            <div
              key={cell.i}
              className="flex flex-col h-full w-full border-2 border-blue-6 rounded-lg box-border bg-slate-5 overflow-hidden"
            >
              {renderCellContent()}
            </div>
          );
        })}
      </GridLayout>
    </div>
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
