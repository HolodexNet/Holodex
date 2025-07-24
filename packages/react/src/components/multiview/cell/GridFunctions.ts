import { Layout } from "react-grid-layout";

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

  // when moving across the grid, priority should be to move the item to its new position
  // and then move everything around it
  if (collidingItems.length === 1) {
    const swapTarget = collidingItems[0];
    newItem.x = swapTarget.x;
    newItem.y = swapTarget.y;

    swapTarget.x = oldItem.x;
    swapTarget.y = oldItem.y;

    // if there is only item being covered by the movedItem, swap the two places
    // because we know that the first item is only covering with one item, we know that the space will fit the item
    // if the colliding item is smaller than the movedItem, it will fit no problem into the new space
    // check if there is any space between the colliding items

    // 1) put the swapped item in the top left corner and check if there is any collision (besides old item)
    // 2) if there is no collision, then we can move the item to the top left corner (or maybe even higher)
    // 3) if there is a collision, then we need to move everything down
    // 4) this includes detecting everything that is colliding with the moved items from step (3)
    // 5) if the item is moved beyond the grid limit, if so, resize

    if (swapTarget.x + swapTarget.w > limit) {
      swapTarget.w = limit - swapTarget.x;
    }

    moveCollidingItems(layout, newItem);
    moveCollidingItems(layout, swapTarget);
  } else {
    moveCollidingItems(layout, newItem);
  }
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
    if (
      itemsCollidingWithOldSpace[0].y + itemsCollidingWithOldSpace[0].h / 3 <=
      movingItem.y
    ) {
      // move the moving item down
      const moveDistance =
        movingItem.y -
        (itemsCollidingWithOldSpace[0].y + itemsCollidingWithOldSpace[0].h);
      movingItem.y += Math.abs(moveDistance);
      moveCollidingItems(itemsToCheck, movingItem);
    } else {
      const moveDistance =
        movingItem.y + movingItem.h - itemsCollidingWithOldSpace[0].y;
      // there is a collision, we need to find the next available place VERTICALLY
      for (const item of itemsCollidingWithOldSpace) {
        // try to find empty space above
        if (areItemsColliding(item, movingItem)) {
          item.y += moveDistance;
          moveCollidingItems(itemsToCheck, item);
        }
      }
    }
  }
}

// if there is one item that you are swapping with, swap the two items
// check if the second item will collide with anything
// move them accordingly

// if there is more than one item that collides with the swapped item, decide if the item is above or below the new space that it is supposed to occupy
// if it is above, then don't move that item, but move the MOVED item down
// if it is below, move the next item down by however much space is needed to no longer collide

// if there is no item colliding with the newItem, then we can just move it to the new position

function areItemsColliding(itemA: Layout, itemB: Layout): boolean {
  return (
    itemA.x < itemB.x + itemB.w &&
    itemA.x + itemA.w > itemB.x &&
    itemA.y < itemB.y + itemB.h &&
    itemA.y + itemA.h > itemB.y
  );
}
