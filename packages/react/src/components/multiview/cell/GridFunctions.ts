import { Layout } from "react-grid-layout";

export function onDragStop(layout: Layout[], oldItem: Layout, newItem: Layout) {
  // check the top left corner of the item being moved to see if it overlaps with another item
  // item's x and y are the top left corner of the item

  const swapTarget = layout
    .filter((item) => item.i != oldItem.i)
    .find((item) => {
      return (
        item.x <= newItem.x &&
        item.x + item.w > newItem.x &&
        item.y <= newItem.y &&
        item.y + item.h > newItem.y
      );
    });

  if (swapTarget) {
    swapTarget.x = oldItem.x;
    swapTarget.y = oldItem.y;
  }
}
