import { Layout } from "react-grid-layout";

type Direction = "l" | "r" | "u" | "d";

/* Expected behavior:
There are four possible scenarios post dragging items
1) items are swapped
2) items are moved down to make space for the new item, the new item is placed at exactly the x and y where it was dropped
3) Item is inserted between the two items, the new item is placed tightly
4) Item is moved to the new space without any collision

Scenario 1 is triggered when the top left corner of both items match
Scenario 2 is when the movingItem's new y is at the top 1/3 of the highest colliding item
Scenario 3 is when the movingItem's new drop site is more than 2/3 of the height of the highest colliding item
Scenario 4 is when the movingItem's new drop site is not colliding with any other
*/
export function onDragStop(
  layout: Layout[],
  oldItem: Layout,
  newItem: Layout,
  limit: number,
) {
  // find all of the items that are colliding with the newItem position
  const collidingItems = getCollidingItems(layout, newItem);

  // TODO: swap logic needs to be fixed -> the swapped item needs to be fitted into the grid
  if (collidingItems.length) {
    const swapTarget = collidingItems[0];
    if (
      (swapTarget.x === newItem.x && swapTarget.y === newItem.y) ||
      collidingItems.length === 1
    ) {
      //   newItem.x = swapTarget.x;
      //   newItem.y = swapTarget.y;

      swapTarget.x = oldItem.x;
      swapTarget.y = oldItem.y;

      // TODO: add logic to resize item if there is an item to the right of the new item
      if (swapTarget.x + swapTarget.w > limit) {
        swapTarget.w = limit - swapTarget.x;
      }

      moveCollidingItems(layout, newItem);
      moveCollidingItems(layout, swapTarget);
      return;
    }
    moveCollidingItems(layout, newItem);
  }
}

export function onResizeStop(
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

  if (directionImpacted.length === 1) {
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
        moveCollidingItems(layout, collidingItem);
      } else {
        collidingItem.w -= collidingItem.x + collidingItem.w - newItem.x;
      }
      break;
    case "r":
      collidingLength = newItem.x + newItem.w - collidingItem.x;
      if (collidingItem.w - collidingLength < minSize) {
        collidingItem.y = newItem.y + newItem.h;
        moveCollidingItems(layout, collidingItem);
      } else {
        collidingItem.w = collidingItem.w - collidingLength;
        collidingItem.x = newItem.x + newItem.w;
      }
      break;
    case "u":
      collidingLength = newItem.y - collidingItem.y;
      if (collidingLength < minSize) {
        collidingItem.y = newItem.y + newItem.h;
        moveCollidingItems(layout, collidingItem);
      } else {
        collidingItem.h -= collidingItem.y + collidingItem.h - newItem.y;
      }
      break;
    case "d":
      collidingLength =
        collidingItem.h - (newItem.y + newItem.h - collidingItem.y);
      if (collidingLength < minSize) {
        collidingItem.y = newItem.y + newItem.h;
        moveCollidingItems(layout, collidingItem);
      } else {
        collidingItem.h -= newItem.y + newItem.h - collidingItem.y;
        collidingItem.y = newItem.y + newItem.h;
      }
      break;
  }
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
