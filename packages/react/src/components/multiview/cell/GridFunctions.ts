import { Layout } from "react-grid-layout";

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
  const collidingItems = layout.filter((item) => {
    return (
      item.i !== oldItem.i &&
      item.x < newItem.x + newItem.w && // checks if the the movedItem's x is greater than the item's x
      item.x + item.w > newItem.x &&
      item.y < newItem.y + newItem.h &&
      item.y + item.h > newItem.y
    );
  });

  if (collidingItems.length) {
    const swapTarget = collidingItems[0];
    if (swapTarget.x === newItem.x && swapTarget.y === newItem.y) {
      newItem.x = swapTarget.x;
      newItem.y = swapTarget.y;

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
) {
  // resize items that are impacted on the right of the resizedItem
  //   const itemsCollidingWithOldSpace = layout
  //     .filter((item) => {
  //       return (
  //         item.i !== newItem.i &&
  //         item.x < newItem.x + newItem.w &&
  //         item.x + item.w > newItem.x &&
  //         item.y < newItem.y + newItem.h &&
  //         item.y + item.h > newItem.y
  //       );
  //     })
  //     .sort((a, b) => {
  //       // this sort will ensure that the items colliding will be sorted by the top left first
  //       if (a.y === b.y) {
  //         return a.x - b.x; // Sort by x position when y is the same
  //       }
  //       return a.y - b.y; // Sort by y position to handle vertical collisions
  //     });

  //     for (const item of itemsCollidingWithOldSpace) {
  //         // for each item, change their size
  //         // if the resizing leads to the item having a width or height that is less than 1, then move it down
  //     }
  moveCollidingItems(layout, newItem);
}

function moveCollidingItems(itemsToCheck: Layout[], movingItem: Layout) {
  const itemsCollidingWithOldSpace = itemsToCheck
    .filter((item) => {
      return (
        item.i !== movingItem.i &&
        item.x < movingItem.x + movingItem.w &&
        item.x + item.w > movingItem.x &&
        item.y < movingItem.y + movingItem.h &&
        item.y + item.h > movingItem.y
      );
    })
    .sort((a, b) => {
      // this sort will ensure that the items colliding will be sorted by the top left first
      if (a.y === b.y) {
        return a.x - b.x; // Sort by x position when y is the same
      }
      return a.y - b.y; // Sort by y position to handle vertical collisions
    });

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

function areItemsColliding(itemA: Layout, itemB: Layout): boolean {
  return (
    itemA.x < itemB.x + itemB.w &&
    itemA.x + itemA.w > itemB.x &&
    itemA.y < itemB.y + itemB.h &&
    itemA.y + itemA.h > itemB.y
  );
}
