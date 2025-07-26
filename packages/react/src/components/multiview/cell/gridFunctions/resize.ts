import { Layout } from "react-grid-layout";
import {
  checkImpactDirection,
  getCollidingItems,
  singleDirectionResize,
} from "./common";

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
