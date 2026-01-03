import { cn } from "@/lib/utils";
import {
  aspectClassAtom,
  editModeAtom,
  gridDimensionsAtom,
  visibleCellsAtom,
  updateLayoutAtom,
  type Cell,
} from "@/store/multiview";
import { useAtomValue, useSetAtom } from "jotai";
import { MultiviewCell } from "./MultiviewCell";
import { GridCornerDots } from "./GridCornerDots";
import ReactGridLayout, {
  type LayoutItem,
  type Layout,
} from "react-grid-layout";
import { GridBackground } from "react-grid-layout/extras";
import { gridBounds, minMaxSize } from "react-grid-layout/core";
import { createMultiviewCompactor } from "./multiviewCompactor";
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
    static: cell.visibility !== "visible",
  };
}

/**
 * Main grid container for multiview layout.
 * Uses react-grid-layout for drag and resize functionality.
 */
export function MultiviewGrid({ className }: MultiviewGridProps) {
  const visibleCells = useAtomValue(visibleCellsAtom);
  const updateLayout = useSetAtom(updateLayoutAtom);
  const { rows, cols } = useAtomValue(gridDimensionsAtom);
  const editMode = useAtomValue(editModeAtom);
  const aspectClass = useAtomValue(aspectClassAtom);

  const [containerRef, bounds] = useMeasure();

  // Convert cells to react-grid-layout format
  const layout: Layout = useMemo(() => {
    return visibleCells.map(cellToLayoutItem);
  }, [visibleCells]);

  // Handle layout changes from react-grid-layout
  const handleLayoutChange = useCallback(
    (newLayout: Layout) => {
      updateLayout(newLayout);
    },
    [updateLayout],
  );

  // Calculate row height based on container height
  const rowHeight = useMemo(() => {
    if (!bounds?.height) return 30;
    return bounds.height / rows;
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
      {bounds?.height && editMode && (
        <GridCornerDots
          width={bounds.width}
          height={bounds.height}
          cols={cols}
          rows={rows}
          markSize={6}
          className="pointer-events-none absolute inset-0 z-6"
        />
      )}
      {/* Visual grid overlay */}
      {bounds?.height && editMode && (
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
          className="mv-grid mv-grid-background pointer-events-none absolute inset-0 z-5"
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
                    className="react-resizable-handle absolute top-1 left-1 z-50 h-4 w-4 cursor-nwse-resize transition-all hover:brightness-150"
                    style={{ display: editMode ? "block" : "none" }}
                  >
                    <div className="absolute top-0 left-0 h-1 w-full bg-primary"></div>
                    <div className="absolute top-0 left-0 h-full w-1 bg-primary"></div>
                  </div>
                ),
                ne: (
                  <div
                    ref={ref as unknown as Ref<HTMLDivElement>}
                    className="react-resizable-handle absolute top-1 right-1 z-50 h-4 w-4 cursor-nesw-resize transition-all hover:brightness-150"
                    style={{ display: editMode ? "block" : "none" }}
                  >
                    <div className="absolute top-0 right-0 h-1 w-full bg-primary"></div>
                    <div className="absolute top-0 right-0 h-full w-1 bg-primary"></div>
                  </div>
                ),
                sw: (
                  <div
                    ref={ref as unknown as Ref<HTMLDivElement>}
                    className="react-resizable-handle absolute bottom-1 left-1 z-50 h-4 w-4 cursor-nesw-resize transition-all hover:brightness-150"
                    style={{ display: editMode ? "block" : "none" }}
                  >
                    <div className="absolute bottom-0 left-0 h-1 w-full bg-primary"></div>
                    <div className="absolute bottom-0 left-0 h-full w-1 bg-primary"></div>
                  </div>
                ),
                se: (
                  <div
                    ref={ref as unknown as Ref<HTMLDivElement>}
                    className="react-resizable-handle absolute right-1 bottom-1 z-50 h-4 w-4 cursor-nwse-resize transition-all hover:brightness-150"
                    style={{ display: editMode ? "block" : "none" }}
                  >
                    <div className="absolute right-0 bottom-0 h-1 w-full bg-primary"></div>
                    <div className="absolute right-0 bottom-0 h-full w-1 bg-primary"></div>
                  </div>
                ),
              };

              // Edge handles - bar style, visible on hover with group-hover
              const edgeHandles: Record<string, React.ReactNode> = {
                n: (
                  <div
                    ref={ref as unknown as Ref<HTMLDivElement>}
                    className="react-resizable-handle absolute top-1 left-1/2 z-50 h-1 w-12 -translate-x-1/2 cursor-ns-resize bg-primary/50 opacity-0 transition-opacity group-hover/cell:opacity-100 hover:bg-primary"
                    style={{ display: editMode ? "block" : "none" }}
                  />
                ),
                s: (
                  <div
                    ref={ref as unknown as Ref<HTMLDivElement>}
                    className="react-resizable-handle absolute bottom-1 left-1/2 z-50 h-1 w-12 -translate-x-1/2 cursor-ns-resize bg-primary/50 opacity-0 transition-opacity group-hover/cell:opacity-100 hover:bg-primary"
                    style={{ display: editMode ? "block" : "none" }}
                  />
                ),
                w: (
                  <div
                    ref={ref as unknown as Ref<HTMLDivElement>}
                    className="react-resizable-handle absolute top-1/2 left-1 z-50 h-12 w-1 -translate-y-1/2 cursor-ew-resize bg-primary/50 opacity-0 transition-opacity group-hover/cell:opacity-100 hover:bg-primary"
                    style={{ display: editMode ? "block" : "none" }}
                  />
                ),
                e: (
                  <div
                    ref={ref as unknown as Ref<HTMLDivElement>}
                    className="react-resizable-handle absolute top-1/2 right-1 z-50 h-12 w-1 -translate-y-1/2 cursor-ew-resize bg-primary/50 opacity-0 transition-opacity group-hover/cell:opacity-100 hover:bg-primary"
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
                  className="react-resizable-handle absolute z-50"
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
          className="z-10 h-full"
          style={{ height: "100%" }}
        >
          {visibleCells.map((cell) => (
            <div key={cell.id} data-cell-id={cell.id} className="group/cell">
              <MultiviewCell cell={cell} id={cell.id} />
            </div>
          ))}
        </ReactGridLayout>
      )}
    </div>
  );
}
