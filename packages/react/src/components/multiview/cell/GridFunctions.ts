import { Cell } from "@/types/multiview";
import { Layout } from "react-grid-layout";

type Direction = "l" | "r" | "u" | "d";

/* Expected behavior:
There are four possible scenarios post dragging items
1) items are swapped
2) items are moved down to make space for the new item, the new item is placed at exactly the x and y where it was dropped
3) Item is inserted between items, the surrounding items are moved accordingly
4) Item is moved to the new space without any collision
5) Item is inserted into an empty space

Scenario 1 is triggered when the top left corner of both items match
Scenario 2 is when the movingItem's new y is at the top 1/3 of the highest colliding item
Scenario 3 is when the movingItem's new drop site is more than 2/3 of the height of the highest colliding item
Scenario 4 is when the movingItem's new drop site is not colliding with any other
*/
export function onDragStop(layout: Layout[], oldItem: Layout, newItem: Layout) {
  // find all of the items that are colliding with the newItem position
  const collidingItems = getCollidingItems(layout, newItem);
  const beforeTheChange = layout.filter((item) => item.i !== newItem.i);
  const maxHeight = Math.max(...layout.map((item) => item.h + item.y), 24);
  const emptyCells = calculateEmptyCells(beforeTheChange, 24, maxHeight).filter(
    (cell) => {
      return cell.h >= 2 && cell.w >= 2; // Only include cells that are larger than 2x2
    },
  );

  const emptyCell = emptyCells.find((cell) => {
    const newItemCorners = {
      topLeft: { x: newItem.x, y: newItem.y },
      topRight: { x: newItem.x + newItem.w, y: newItem.y },
      bottomLeft: { x: newItem.x, y: newItem.y + newItem.h },
      bottomRight: {
        x: newItem.x + newItem.w,
        y: newItem.y + newItem.h,
      },
    };

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

  if (emptyCell) {
    newItem.x = emptyCell.x;
    newItem.y = emptyCell.y;
    newItem.w = emptyCell.w;
    newItem.h = emptyCell.h;
    return;
  }

  // TODO: swap logic needs to be fixed -> the swapped item needs to be fitted into the grid
  if (collidingItems.length) {
    const swapTarget = collidingItems[0];
    // if the newItem is being put into an empty space, we will resize the item and fit it into the empty space
    // check if there is an empty cell that matches the newItem position

    if (
      (swapTarget.x === newItem.x && swapTarget.y === newItem.y) ||
      collidingItems.length === 1
    ) {
      newItem.x = swapTarget.x;
      newItem.y = swapTarget.y;
      newItem.w = swapTarget.w;
      newItem.h = swapTarget.h;
      swapTarget.x = oldItem.x;
      swapTarget.y = oldItem.y;
      swapTarget.w = oldItem.w;
      swapTarget.h = oldItem.h;
      return;
    }
    moveCollidingItems(layout, newItem);
  }
}

export function onResize(
  layout: Layout[],
  oldItem: Layout,
  newItem: Layout,
  minSize: number = 2,
  limit: number = 24,
) {
  const directionImpacted = checkImpactDirection(newItem, oldItem);

  // if the newItem is smaller than the minSize, then we need to adjust it
  // if the resizing brings the item to beyond the edge of the grid, then we need to adjust the x position
  if (newItem.w < minSize) {
    newItem.w = minSize;
    if (newItem.x + newItem.w > limit) {
      newItem.x = limit - newItem.w;
    }
  }
  if (newItem.h < minSize) {
    newItem.h = minSize;
  }

  const itemsColliding = getCollidingItems(layout, newItem);

  for (const collidingItem of itemsColliding) {
    singleDirectionResize(
      directionImpacted[0],
      collidingItem,
      newItem,
      minSize,
      layout,
    );
  }
}

function moveCollidingItems(itemsToCheck: Layout[], movingItem: Layout) {
  const itemsCollidingWithOldSpace = getCollidingItems(
    itemsToCheck,
    movingItem,
  );

  if (itemsCollidingWithOldSpace.length > 0) {
    // check if the moving Item's top left corner is below the half way point of the first colliding item
    const firstItemCollidedWith = itemsCollidingWithOldSpace[0];
    // if the item's new position is more than 1/3 lower than the first colliding item, move the new item down
    if (firstItemCollidedWith.y + firstItemCollidedWith.h / 3 <= movingItem.y) {
      movingItem.y = firstItemCollidedWith.y + firstItemCollidedWith.h;
      moveCollidingItems(itemsToCheck, movingItem);
    } else {
      for (const item of itemsCollidingWithOldSpace) {
        // there is a collision, we need to find the next available place VERTICALLY
        if (areItemsColliding(item, movingItem)) {
          item.y = movingItem.y + movingItem.h;
          moveCollidingItems(itemsToCheck, item);
        }
      }
    }
  }
}

function singleDirectionResize(
  directionImpacted: Direction,
  collidingItem: Layout,
  newItem: Layout,
  minSize: number,
  layout: Layout[],
) {
  let collidingLength: number;
  switch (directionImpacted) {
    case "l":
      collidingLength =
        collidingItem.w - (collidingItem.x + collidingItem.w - newItem.x);
      if (collidingLength < minSize) {
        collidingItem.y = newItem.y + newItem.h;
      } else {
        collidingItem.w -= collidingItem.x + collidingItem.w - newItem.x;
      }
      break;
    case "r":
      collidingLength = newItem.x + newItem.w - collidingItem.x;
      if (collidingItem.w - collidingLength < minSize) {
        collidingItem.y = newItem.y + newItem.h;
      } else {
        collidingItem.w = collidingItem.w - collidingLength;
        collidingItem.x = newItem.x + newItem.w;
      }
      break;
    case "u":
      collidingLength = newItem.y - collidingItem.y;
      if (collidingLength < minSize) {
        collidingItem.y = newItem.y + newItem.h;
      } else {
        collidingItem.h -= collidingItem.y + collidingItem.h - newItem.y;
      }
      break;
    case "d":
      collidingLength =
        collidingItem.h - (newItem.y + newItem.h - collidingItem.y);
      if (collidingLength < minSize) {
        collidingItem.y = newItem.y + newItem.h;
      } else {
        collidingItem.h -= newItem.y + newItem.h - collidingItem.y;
        collidingItem.y = newItem.y + newItem.h;
      }
      break;
  }
  moveCollidingItems(layout, collidingItem);
}

function areItemsColliding(itemA: Layout, itemB: Layout): boolean {
  return (
    itemA.x < itemB.x + itemB.w &&
    itemA.x + itemA.w > itemB.x &&
    itemA.y < itemB.y + itemB.h &&
    itemA.y + itemA.h > itemB.y
  );
}

function checkImpactDirection(newSpace: Layout, oldSpace: Layout): Direction[] {
  const impacts: Direction[] = [];
  const impactDirection = {
    x:
      newSpace.x - oldSpace.x === 0
        ? newSpace.w - oldSpace.w
        : newSpace.x - oldSpace.x,
    y:
      newSpace.y - oldSpace.y === 0
        ? newSpace.h - oldSpace.h
        : newSpace.y - oldSpace.y,
  };

  console.log(newSpace, oldSpace, impactDirection);

  if (impactDirection.x < 0) {
    impacts.push("l");
  } else if (impactDirection.x > 0) {
    impacts.push("r");
  }

  if (impactDirection.y < 0) {
    impacts.push("u");
  } else if (impactDirection.y > 0) {
    impacts.push("d");
  }
  return impacts;
}

function getCollidingItems(layout: Layout[], newItem: Layout): Layout[] {
  const itemsCollidingWithOldSpace = layout
    .filter((item) => {
      return (
        item.i !== newItem.i &&
        item.x < newItem.x + newItem.w &&
        item.x + item.w > newItem.x &&
        item.y < newItem.y + newItem.h &&
        item.y + item.h > newItem.y
      );
    })
    .sort((a, b) => {
      // this sort will ensure that the items colliding will be sorted by the top left first
      if (a.y === b.y) {
        return a.x - b.x; // Sort by x position when y is the same
      }
      return a.y - b.y; // Sort by y position to handle vertical collisions
    });
  return itemsCollidingWithOldSpace;
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
