import { Layout } from "react-grid-layout";
import { getCollidingItems, registerMovedcell } from "./common";
import { Cell } from "@/types/multiview";

/* Expected behavior:
There are three possible scenarios post dragging items
1) items are swapped
2) Item is moved to the new space without any collision
3) Item is grows into empty space - only when at least one corner matches a respective corner of the empty space
*/
export function onDragStop(
  layout: Layout[],
  oldItem: Layout,
  newItem: Layout,
  updateCellInStorage: (cellId: string, updates: Partial<Layout>) => void,
  turnOffAutoLayout: () => void,
) {
  // find all of the items that are colliding with the newItem position
  const collidingItems = getCollidingItems(layout, newItem);

  if (collidingItems.length === 0) {
    const itemsNotMoved = layout.filter((item) => item.i !== newItem.i);
    const maxHOccupied = Math.max(...layout.map((item) => item.h + item.y), 24);

    const emptyCell = findEmptyCellToFill(itemsNotMoved, maxHOccupied, newItem);

    if (emptyCell) {
      registerMovedcell(newItem, emptyCell, updateCellInStorage);
      turnOffAutoLayout();
      return;
    }
  } else if (collidingItems.length === 1) {
    const swapTarget = collidingItems[0];
    if (
      (swapTarget.x === newItem.x && swapTarget.y === newItem.y) ||
      collidingItems.length === 1
    ) {
      registerMovedcell(newItem, swapTarget, updateCellInStorage);
      registerMovedcell(swapTarget, oldItem, updateCellInStorage);
      turnOffAutoLayout();
      return;
    }
  } else {
    newItem.x = oldItem.x;
    newItem.y = oldItem.y;
    newItem.w = oldItem.w;
    newItem.h = oldItem.h;
  }
}

// recalculates the layout of the cells based on the current cell positions
function findEmptyCellToFill(
  placedCellsPositions: Layout[],
  maxHeight: number,
  newItem: Layout,
  matchingCorner: boolean = true,
) {
  const emptyCells = calculateEmptyCells(
    placedCellsPositions,
    24,
    maxHeight,
  ).filter((cell) => {
    return cell.h >= 2 && cell.w >= 2; // Only include cells that are larger than 2x2
  });

  const newItemCorners = {
    topLeft: { x: newItem.x, y: newItem.y },
    topRight: { x: newItem.x + newItem.w, y: newItem.y },
    bottomLeft: { x: newItem.x, y: newItem.y + newItem.h },
    bottomRight: {
      x: newItem.x + newItem.w,
      y: newItem.y + newItem.h,
    },
  };

  if (matchingCorner) {
    return emptyCells.find((cell) => {
      const emptyCellCorners = {
        topLeft: { x: cell.x, y: cell.y },
        topRight: { x: cell.x + cell.w, y: cell.y },
        bottomLeft: { x: cell.x, y: cell.y + cell.h },
        bottomRight: { x: cell.x + cell.w, y: cell.y + cell.h },
      };

      return (
        // Top-left corner match
        (newItemCorners.topLeft.x === emptyCellCorners.topLeft.x &&
          newItemCorners.topLeft.y === emptyCellCorners.topLeft.y) ||
        // Top-right corner match
        (newItemCorners.topRight.x === emptyCellCorners.topRight.x &&
          newItemCorners.topRight.y === emptyCellCorners.topRight.y) ||
        // Bottom-left corner match
        (newItemCorners.bottomLeft.x === emptyCellCorners.bottomLeft.x &&
          newItemCorners.bottomLeft.y === emptyCellCorners.bottomLeft.y) ||
        // Bottom-right corner match
        (newItemCorners.bottomRight.x === emptyCellCorners.bottomRight.x &&
          newItemCorners.bottomRight.y === emptyCellCorners.bottomRight.y)
      );
    });
  }
  return emptyCells.find((cell) => {
    return (
      newItem.x >= cell.x &&
      newItem.x + newItem.w <= cell.x + cell.w &&
      newItem.y >= cell.y &&
      newItem.y + newItem.h <= cell.y + cell.h
    );
  });
}

export function calculateEmptyCells(
  occupiedCells: Layout[],
  gridWidth: number,
  gridHeight: number,
): Cell[] {
  const occupancyGrid: boolean[][] = Array(gridHeight)
    .fill(null)
    .map(() => Array(gridWidth).fill(false));

  occupiedCells.forEach((cell) => {
    for (let y = cell.y; y < cell.y + cell.h; y++) {
      for (let x = cell.x; x < cell.x + cell.w; x++) {
        if (y < gridHeight && x < gridWidth) {
          occupancyGrid[y][x] = true;
        }
      }
    }
  });

  // Find empty rectangular regions
  const emptyCells: Cell[] = [];
  const processedGrid: boolean[][] = Array(gridHeight)
    .fill(null)
    .map(() => Array(gridWidth).fill(false));

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      if (!occupancyGrid[y][x] && !processedGrid[y][x]) {
        const emptyRegion = findLargestEmptyRegion(
          occupancyGrid,
          processedGrid,
          x,
          y,
          gridWidth,
          gridHeight,
        );

        if (emptyRegion) {
          emptyCells.push({
            i: `empty-${x}-${y}`,
            type: "placeholder",
            x: emptyRegion.x,
            y: emptyRegion.y,
            w: emptyRegion.w,
            h: emptyRegion.h,
          });
        }
      }
    }
  }

  return emptyCells;
}

// always looks for the largest empty rectangle possible from the empty cells
function findLargestEmptyRegion(
  occupancyGrid: boolean[][],
  processedGrid: boolean[][],
  startX: number,
  startY: number,
  gridWidth: number,
  gridHeight: number,
): { x: number; y: number; w: number; h: number } | null {
  let maxArea = 0;
  let bestRegion: { x: number; y: number; w: number; h: number } | null = null;

  // Create height array for histogram approach
  const heights: number[] = new Array(gridWidth - startX).fill(0);

  for (let y = startY; y < gridHeight; y++) {
    // Update heights array
    for (let x = startX; x < gridWidth; x++) {
      const idx = x - startX;
      if (occupancyGrid[y][x] || processedGrid[y][x]) {
        heights[idx] = 0;
      } else {
        heights[idx]++;
      }
    }

    const result = largestRectangleInHistogram(heights, startX, y);
    if (result && result.area > maxArea) {
      maxArea = result.area;
      bestRegion = {
        x: result.x,
        y: result.y,
        w: result.w,
        h: result.h,
      };
    }
  }

  if (!bestRegion) return null;

  // Mark the best region as processed
  for (let y = bestRegion.y; y < bestRegion.y + bestRegion.h; y++) {
    for (let x = bestRegion.x; x < bestRegion.x + bestRegion.w; x++) {
      processedGrid[y][x] = true;
    }
  }

  return bestRegion;
}

function largestRectangleInHistogram(
  heights: number[],
  baseX: number,
  currentY: number,
): { x: number; y: number; w: number; h: number; area: number } | null {
  const stack: number[] = [];
  let maxArea = 0;
  let bestRect: {
    x: number;
    y: number;
    w: number;
    h: number;
    area: number;
  } | null = null;

  for (let i = 0; i <= heights.length; i++) {
    const currentHeight = i === heights.length ? 0 : heights[i];

    while (
      stack.length > 0 &&
      heights[stack[stack.length - 1]] > currentHeight
    ) {
      const height = heights[stack.pop()!];
      const width = stack.length === 0 ? i : i - stack[stack.length - 1] - 1;
      const area = height * width;

      if (area > maxArea) {
        maxArea = area;
        const startX = stack.length === 0 ? 0 : stack[stack.length - 1] + 1;
        bestRect = {
          x: baseX + startX,
          y: currentY - height + 1,
          w: width,
          h: height,
          area: area,
        };
      }
    }

    stack.push(i);
  }

  return bestRect;
}
