import { Layout } from "react-grid-layout";

export type Direction = "l" | "r" | "u" | "d";

export function singleDirectionResize(
  directionImpacted: Direction,
  collidingItem: Layout,
  newItem: Layout,
  minSize: number,
  layout: Layout[],
  updateCellInStorage: (cellId: string, updates: Partial<Layout>) => void,
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
      updateCellInStorage(collidingItem.i, {
        x: collidingItem.x,
        y: collidingItem.y,
        w: collidingItem.w,
        h: collidingItem.h,
      });
      break;
    case "r":
      collidingLength = newItem.x + newItem.w - collidingItem.x;
      if (collidingItem.w - collidingLength < minSize) {
        collidingItem.y = newItem.y + newItem.h;
      } else {
        collidingItem.w = collidingItem.w - collidingLength;
        collidingItem.x = newItem.x + newItem.w;
      }
      updateCellInStorage(collidingItem.i, {
        x: collidingItem.x,
        y: collidingItem.y,
        w: collidingItem.w,
        h: collidingItem.h,
      });
      break;
    case "u":
      collidingLength = newItem.y - collidingItem.y;
      if (collidingLength < minSize) {
        collidingItem.y = newItem.y + newItem.h;
      } else {
        collidingItem.h -= collidingItem.y + collidingItem.h - newItem.y;
      }
      updateCellInStorage(collidingItem.i, {
        x: collidingItem.x,
        y: collidingItem.y,
        w: collidingItem.w,
        h: collidingItem.h,
      });
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
      updateCellInStorage(collidingItem.i, {
        x: collidingItem.x,
        y: collidingItem.y,
        w: collidingItem.w,
        h: collidingItem.h,
      });
      break;
  }
  moveCollidingItems(layout, collidingItem, updateCellInStorage);
}

function areItemsColliding(itemA: Layout, itemB: Layout): boolean {
  return (
    itemA.x < itemB.x + itemB.w &&
    itemA.x + itemA.w > itemB.x &&
    itemA.y < itemB.y + itemB.h &&
    itemA.y + itemA.h > itemB.y
  );
}

export function moveCollidingItems(
  itemsToCheck: Layout[],
  movingItem: Layout,
  updateCellInStorage: (cellId: string, updates: Partial<Layout>) => void,
) {
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
      updateCellInStorage(movingItem.i, {
        x: movingItem.x,
        y: movingItem.y,
        w: movingItem.w,
        h: movingItem.h,
      });
      moveCollidingItems(itemsToCheck, movingItem, updateCellInStorage);
    } else {
      for (const item of itemsCollidingWithOldSpace) {
        // there is a collision, we need to find the next available place VERTICALLY
        if (areItemsColliding(item, movingItem)) {
          item.y = movingItem.y + movingItem.h;
          updateCellInStorage(item.i, {
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h,
          });
          moveCollidingItems(itemsToCheck, item, updateCellInStorage);
        }
      }
    }
  }
}

export function getCollidingItems(layout: Layout[], newItem: Layout): Layout[] {
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

export function checkImpactDirection(
  newSpace: Layout,
  oldSpace: Layout,
): Direction[] {
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

export function registerMovedcell(
  movedCell: Layout,
  spaceMovedTo: Layout,
  updateCellInStorage: (cellId: string, updates: Partial<Layout>) => void,
) {
  movedCell.x = spaceMovedTo.x;
  movedCell.y = spaceMovedTo.y;
  movedCell.w = spaceMovedTo.w;
  movedCell.h = spaceMovedTo.h;
  updateCellInStorage(movedCell.i, {
    x: movedCell.x,
    y: movedCell.y,
    w: movedCell.w,
    h: movedCell.h,
  });
}
