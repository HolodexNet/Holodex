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
import { GridCornerDots } from "./GridCornerDots";
import ReactGridLayout, {
  type LayoutItem,
  type Layout,
} from "react-grid-layout";
import { GridBackground } from "react-grid-layout/extras";
import { gridBounds, minMaxSize } from "react-grid-layout/core";
import { createMultiviewCompactor } from "./multiviewCompactor";
import "./multiview.css";
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
    return containerHeight / rows;
  }, [bounds?.height, rows]);

  // Create the compactor with actual grid bounds
  const compactor = useMemo(
    () => createMultiviewCompactor(cols, rows),
    [cols, rows],
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-full w-full overflow-hidden",
        !editMode ? "hidden" : "",
        className,
      )}
      data-aspect-class={aspectClass}
    >
      {/* Corner plus signs at grid intersections */}
      {bounds?.height && (
        <GridCornerDots
          width={bounds.width}
          height={bounds.height}
          cols={cols}
          rows={rows}
          markSize={6}
          className="absolute inset-0 pointer-events-none z-6"
        />
      )}
      {/* Visual grid overlay */}
      {bounds?.height && (
        <GridBackground
          width={bounds.width}
          cols={cols}
          rowHeight={rowHeight}
          margin={[0, 0]}
          containerPadding={[0, 0]}
          rows={rows}
          height={bounds.height}
          color="color-mix(in srgb, var(--muted-foreground) 15%, transparent)"
          borderRadius={0}
          className="absolute inset-0 pointer-events-none z-5 mv-grid mv-grid-background"
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
            handle: ".drag-handle",
          }}
          resizeConfig={{
            handleComponent: (axis, ref) => {
              // Corner handles - L-shaped with two perpendicular bars
              const cornerHandles: Record<string, React.ReactNode> = {
                nw: (
                  <div
                    ref={ref as unknown as Ref<HTMLDivElement>}
                    className="absolute w-4 h-4 z-50 transition-all top-1 left-1 cursor-nwse-resize react-resizable-handle hover:brightness-150"
                    style={{ display: editMode ? "block" : "none" }}
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                    <div className="absolute top-0 left-0 bg-primary h-full w-1"></div>
                  </div>
                ),
                ne: (
                  <div
                    ref={ref as unknown as Ref<HTMLDivElement>}
                    className="absolute top-1 w-4 h-4 z-50 hover:brightness-150 transition-all react-resizable-handle right-1 cursor-nesw-resize"
                    style={{ display: editMode ? "block" : "none" }}
                  >
                    <div className="absolute top-0 w-full h-1 bg-primary right-0"></div>
                    <div className="absolute top-0 right-0 h-full w-1 bg-primary"></div>
                  </div>
                ),
                sw: (
                  <div
                    ref={ref as unknown as Ref<HTMLDivElement>}
                    className="absolute left-1 w-4 h-4 cursor-nesw-resize z-50 hover:brightness-150 transition-all react-resizable-handle bottom-1"
                    style={{ display: editMode ? "block" : "none" }}
                  >
                    <div className="absolute left-0 w-full h-1 bg-primary bottom-0"></div>
                    <div className="absolute bottom-0 left-0 h-full w-1 bg-primary"></div>
                  </div>
                ),
                se: (
                  <div
                    ref={ref as unknown as Ref<HTMLDivElement>}
                    className="absolute bottom-1 right-1 w-4 h-4 cursor-nwse-resize z-50 hover:brightness-150 transition-all react-resizable-handle"
                    style={{ display: editMode ? "block" : "none" }}
                  >
                    <div className="absolute bottom-0 right-0 w-full h-1 bg-primary"></div>
                    <div className="absolute bottom-0 right-0 h-full w-1 bg-primary"></div>
                  </div>
                ),
              };

              // Edge handles - bar style, visible on hover with group-hover
              const edgeHandles: Record<string, React.ReactNode> = {
                n: (
                  <div
                    ref={ref as unknown as Ref<HTMLDivElement>}
                    className="h-1 absolute top-1 z-50 react-resizable-handle w-12 left-1/2 opacity-0 transition-opacity bg-primary/50 cursor-ns-resize -translate-x-1/2 hover:bg-primary group-hover/cell:opacity-100"
                    style={{ display: editMode ? "block" : "none" }}
                  />
                ),
                s: (
                  <div
                    ref={ref as unknown as Ref<HTMLDivElement>}
                    className="w-12 h-1 absolute bottom-1 left-1/2 -translate-x-1/2 bg-primary/50 cursor-ns-resize z-50 hover:bg-primary opacity-0 group-hover/cell:opacity-100 transition-opacity react-resizable-handle"
                    style={{ display: editMode ? "block" : "none" }}
                  />
                ),
                w: (
                  <div
                    ref={ref as unknown as Ref<HTMLDivElement>}
                    className="w-1 absolute left-1 bg-primary/50 z-50 hover:bg-primary opacity-0 group-hover/cell:opacity-100 transition-opacity react-resizable-handle h-12 cursor-ew-resize top-1/2 -translate-y-1/2"
                    style={{ display: editMode ? "block" : "none" }}
                  />
                ),
                e: (
                  <div
                    ref={ref as unknown as Ref<HTMLDivElement>}
                    className="w-1 h-12 absolute top-1/2 -translate-y-1/2 right-1 bg-primary/50 cursor-ew-resize z-50 hover:bg-primary opacity-0 group-hover/cell:opacity-100 transition-opacity react-resizable-handle"
                    style={{ display: editMode ? "block" : "none" }}
                  />
                ),
              };

              // Return appropriate handle
              if (cornerHandles[axis]) return cornerHandles[axis];
              if (edgeHandles[axis]) return edgeHandles[axis];

              // Fallback
              return (
                <div
                  ref={ref as unknown as Ref<HTMLDivElement>}
                  className="absolute z-50 react-resizable-handle"
                  style={{ display: editMode ? "block" : "none" }}
                />
              );
            },
            enabled: editMode,
            handles: ["se", "sw", "ne", "nw", "s", "n", "e", "w"],
          }}
          constraints={[gridBounds, minMaxSize]}
          compactor={compactor}
          onLayoutChange={handleLayoutChange}
          autoSize={true}
          className="h-full z-10"
          style={{ height: "100%", display: !editMode ? "none" : "block" }}
        >
          {cells
            .filter((cell) => cell.w > 0 && cell.h > 0)
            .map((cell) => (
              <div key={cell.id} data-cell-id={cell.id} className="group/cell">
                <MultiviewCell cell={cell} id={cell.id} editMode={editMode} />
              </div>
            ))}
        </ReactGridLayout>
      )}
    </div>
  );
}
