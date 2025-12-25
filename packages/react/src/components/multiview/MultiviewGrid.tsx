import { cn } from "@/lib/utils";
import {
  aspectClassAtom,
  cellQueueAtom,
  editModeAtom,
  gridDimensionsAtom,
  type Cell,
} from "@/store/multiview";
import { useAtom, useAtomValue } from "jotai";
import { MultiviewCell } from "./MultiviewCell";
import ReactGridLayout, {
  type LayoutItem,
  type Layout,
  verticalCompactor,
} from "react-grid-layout";
import { GridBackground } from "react-grid-layout/extras";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useCallback, useMemo } from "react";
import useMeasure from "react-use-measure";

interface MultiviewGridProps {
  className?: string;
}

/**
 * Convert internal Cell format to react-grid-layout LayoutItem format.
 */
function cellToLayoutItem(cell: Cell): LayoutItem {
  return {
    i: cell.id,
    x: cell.x,
    y: cell.y,
    w: cell.w,
    h: cell.h,
    static: !cell.w || !cell.h, // Hidden cells are static
  };
}

/**
 * Main grid container for multiview layout.
 * Uses react-grid-layout for drag and resize functionality.
 */
export function MultiviewGrid({ className }: MultiviewGridProps) {
  const [cells, setCells] = useAtom(cellQueueAtom);
  const { rows, cols } = useAtomValue(gridDimensionsAtom);
  const editMode = useAtomValue(editModeAtom);
  const aspectClass = useAtomValue(aspectClassAtom);

  const [containerRef, bounds] = useMeasure();

  // Convert cells to react-grid-layout format
  const layout: Layout = useMemo(() => {
    return cells
      .filter((cell) => cell.w > 0 && cell.h > 0) // Only visible cells
      .map(cellToLayoutItem);
  }, [cells]);

  // Handle layout changes from react-grid-layout
  const handleLayoutChange = useCallback(
    (newLayout: Layout) => {
      setCells((prevCells) => {
        // Create a map of new positions by ID
        const layoutMap = new Map(newLayout.map((item) => [item.i, item]));

        return prevCells.map((cell) => {
          const layoutItem = layoutMap.get(cell.id);
          if (layoutItem && (cell.w > 0 || cell.h > 0)) {
            // Only update visible cells
            return {
              ...cell,
              x: layoutItem.x,
              y: layoutItem.y,
              w: layoutItem.w,
              h: layoutItem.h,
            };
          }
          return cell;
        });
      });
    },
    [setCells],
  );

  // Calculate row height based on container height
  // We want the grid to fill the container exactly
  const rowHeight = useMemo(() => {
    if (!bounds?.height) return 30;
    const containerHeight = bounds.height;
    return containerHeight / rows;
  }, [bounds?.height, rows]);

  // Calculate container height for GridBackground
  const containerHeight = useMemo(() => {
    if (!bounds?.height) return 0;
    return bounds.height;
  }, [bounds?.height]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-full w-full overflow-hidden bg-black",
        className,
      )}
      data-aspect-class={aspectClass}
    >
      {/* Grid background using react-grid-layout's GridBackground */}
      {bounds?.height && (
        <GridBackground
          width={bounds.width}
          cols={cols}
          rowHeight={rowHeight}
          margin={[0, 0]}
          containerPadding={[0, 0]}
          rows={rows}
          height={containerHeight}
          color="rgba(255, 255, 255, 0.03)"
          borderRadius={0}
          className="absolute inset-0 pointer-events-none z-0"
        />
      )}

      {bounds?.height && (
        <ReactGridLayout
          layout={layout}
          width={bounds.width}
          gridConfig={{
            cols: cols,
            rowHeight: rowHeight,
            margin: [0, 0],
            containerPadding: [0, 0],
            maxRows: rows,
          }}
          dragConfig={{
            enabled: editMode,
            bounded: true,
          }}
          resizeConfig={{
            enabled: editMode,
            handles: ["se", "sw", "ne", "nw", "s", "n", "e", "w"],
          }}
          compactor={verticalCompactor}
          onLayoutChange={handleLayoutChange}
          autoSize={true}
          className="h-full z-5"
          style={{ height: "100%" }}
        >
          {cells
            .filter((cell) => cell.w > 0 && cell.h > 0)
            .map((cell) => (
              <div key={cell.id} data-cell-id={cell.id}>
                <MultiviewCell
                  cell={cell}
                  index={cells.indexOf(cell)}
                  editMode={editMode}
                />
              </div>
            ))}
        </ReactGridLayout>
      )}

      {/* Hidden cells - still render iframes but not visible */}
      {cells
        .filter((cell) => cell.w <= 0 || cell.h <= 0)
        .map((cell) => (
          <div
            key={cell.id}
            className="absolute h-0 w-0 overflow-hidden"
            data-cell-id={cell.id}
          >
            <MultiviewCell
              cell={cell}
              index={cells.indexOf(cell)}
              editMode={false}
            />
          </div>
        ))}

      {/* Visual grid overlay for edit mode - enhanced visibility */}
      {editMode && bounds?.height && (
        <GridBackground
          width={bounds.width}
          cols={cols}
          rowHeight={rowHeight}
          margin={[1, 1]}
          containerPadding={[0, 0]}
          rows={rows}
          height={containerHeight}
          color="rgba(125,125,125,0.15)"
          borderRadius={4}
          className="absolute inset-0 pointer-events-none z-10"
        />
      )}
    </div>
  );
}
