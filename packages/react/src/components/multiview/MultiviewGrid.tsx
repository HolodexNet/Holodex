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
import { gridBounds } from "react-grid-layout/core";
// import "react-grid-layout/css/styles.css";
// import "react-resizable/css/styles.css";
import { Ref, useCallback, useMemo } from "react";
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
    return containerHeight / rows - 1; // -1 for margin
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
          margin={[1, 1]}
          containerPadding={[1, 1]}
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
            margin: [1, 1],
            containerPadding: [1, 1],
            maxRows: rows,
          }}
          dragConfig={{
            enabled: editMode,
            bounded: true,
          }}
          resizeConfig={{
            handleComponent: (axis, ref) => {
              // Base styles for all handles
              const baseStyles = `absolute transition-all duration-150 z-50 react-resizable-handle `;

              // Direction-specific styling
              const handleStyles: Record<string, string> = {
                // Edge handles - bar style
                n: `${baseStyles} top-0 left-1/2 -translate-x-1/2 h-2 w-12 cursor-ns-resize rounded-b-full bg-white/20 hover:bg-white/50 hover:h-2`,
                s: `${baseStyles} bottom-0 left-1/2 -translate-x-1/2 h-2 w-12 cursor-ns-resize rounded-t-full bg-white/20 hover:bg-white/50 hover:h-2`,
                e: `${baseStyles} right-0 top-1/2 -translate-y-1/2 w-2 h-12 cursor-ew-resize rounded-l-full bg-white/20 hover:bg-white/50 hover:w-2`,
                w: `${baseStyles} left-0 top-1/2 -translate-y-1/2 w-2 h-12 cursor-ew-resize rounded-r-full bg-white/20 hover:bg-white/50 hover:w-2`,
                // Corner handles - dot/corner style
                ne: `${baseStyles} top-0 right-0 size-4 cursor-nesw-resize rounded-bl-full bg-white/30 hover:bg-white/60`,
                nw: `${baseStyles} top-0 left-0 size-4 cursor-nwse-resize rounded-br-full bg-white/30 hover:bg-white/60`,
                se: `${baseStyles} bottom-0 right-0 size-4 cursor-nwse-resize rounded-tl-full bg-white/30 hover:bg-white/60`,
                sw: `${baseStyles} bottom-0 left-0 size-4 cursor-nesw-resize rounded-tr-full bg-white/30 hover:bg-white/60`,
              };

              return (
                <div
                  ref={ref as unknown as Ref<HTMLDivElement>}
                  className={handleStyles[axis] || baseStyles}
                />
              );
            },
            enabled: editMode,
            handles: ["se", "sw", "ne", "nw", "s", "n", "e", "w"],
          }}
          constraints={[gridBounds]}
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
          containerPadding={[1, 1]}
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
