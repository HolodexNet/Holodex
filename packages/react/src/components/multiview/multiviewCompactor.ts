/**
 * Multiview Compactor - A bounds-respecting collision resolver for react-grid-layout.
 *
 * Unlike standard compactors that nudge items recursively (potentially pushing
 * them out of bounds), this compactor:
 * 1. Does NOT compact/move items to fill gaps
 * 2. Resolves collisions by finding valid positions within bounds
 * 3. Rejects moves that would cause unresolvable collisions
 */

import {
  Compactor,
  Layout,
  LayoutItem,
  collides,
  getAllCollisions,
} from "react-grid-layout";

// ============================================================================
// Helper Types
// ============================================================================

interface GridBounds {
  cols: number;
  maxRows: number;
}

interface Position {
  x: number;
  y: number;
}

/**
 * Check if an item is within grid bounds.
 */
function isWithinBounds(
  item: LayoutItem,
  cols: number,
  maxRows: number,
): boolean {
  return (
    item.x >= 0 &&
    item.y >= 0 &&
    item.x + item.w <= cols &&
    item.y + item.h <= maxRows
  );
}

/**
 * Check if a position would be valid for an item (within bounds and no collisions).
 */
function isPositionValid(
  item: LayoutItem,
  x: number,
  y: number,
  layout: Layout,
  cols: number,
  maxRows: number,
  excludeIds: Set<string> = new Set(),
): boolean {
  const testItem = { ...item, x, y };

  // Check bounds
  if (!isWithinBounds(testItem, cols, maxRows)) {
    return false;
  }

  // Check collisions (excluding specified items)
  for (const other of layout) {
    if (excludeIds.has(other.i)) continue;
    if (collides(testItem, other)) {
      return false;
    }
  }

  return true;
}

// ============================================================================
// Position Finding Strategies
// ============================================================================

/**
 * Try to find a valid position for a displaced item.
 * Searches in a spiral pattern from the item's original position.
 */
function findValidPosition(
  item: LayoutItem,
  layout: Layout,
  bounds: GridBounds,
  excludeIds: Set<string>,
): Position | null {
  const { cols, maxRows } = bounds;

  // First, try the item's current position
  if (
    isPositionValid(item, item.x, item.y, layout, cols, maxRows, excludeIds)
  ) {
    return { x: item.x, y: item.y };
  }

  // Search in expanding rings around the original position
  const maxRadius = Math.max(cols, maxRows);

  for (let radius = 1; radius <= maxRadius; radius++) {
    // Try positions at this radius, prioritizing positions closer to original
    const candidates: Position[] = [];

    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        // Only check positions on the ring perimeter or positions we haven't checked
        if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;

        const x = item.x + dx;
        const y = item.y + dy;

        if (x >= 0 && y >= 0 && x + item.w <= cols && y + item.h <= maxRows) {
          candidates.push({ x, y });
        }
      }
    }

    // Sort candidates by distance to original position
    candidates.sort((a, b) => {
      const distA = Math.abs(a.x - item.x) + Math.abs(a.y - item.y);
      const distB = Math.abs(b.x - item.x) + Math.abs(b.y - item.y);
      return distA - distB;
    });

    for (const pos of candidates) {
      if (
        isPositionValid(item, pos.x, pos.y, layout, cols, maxRows, excludeIds)
      ) {
        return pos;
      }
    }
  }

  return null;
}

/**
 * Try to swap positions between the moved item and a single colliding item.
 * This is the simplest resolution for a 1:1 collision.
 */
function trySwap(
  movedItem: LayoutItem,
  collidingItem: LayoutItem,
  originalPosition: Position,
  layout: Layout,
  bounds: GridBounds,
): Layout | null {
  const { cols, maxRows } = bounds;

  // Check if the colliding item can fit in the original position of the moved item
  const canSwap = isPositionValid(
    collidingItem,
    originalPosition.x,
    originalPosition.y,
    layout,
    cols,
    maxRows,
    new Set([movedItem.i, collidingItem.i]),
  );

  if (!canSwap) {
    return null;
  }

  // Perform the swap
  return layout.map((item) => {
    if (item.i === collidingItem.i) {
      return { ...item, x: originalPosition.x, y: originalPosition.y };
    }
    return item;
  });
}

/**
 * Try to resolve collisions by finding new positions for all colliding items.
 * Returns null if any collision cannot be resolved within bounds.
 */
function resolveCollisions(
  layout: Layout,
  movedItem: LayoutItem,
  originalPosition: Position,
  bounds: GridBounds,
): Layout | null {
  const collisions = getAllCollisions(layout, movedItem);

  if (collisions.length === 0) {
    return layout; // No collisions, nothing to resolve
  }

  // For single collision, try swap first (most natural for multiview)
  if (collisions.length === 1) {
    const swapped = trySwap(
      movedItem,
      collisions[0],
      originalPosition,
      layout,
      bounds,
    );
    if (swapped) {
      return swapped;
    }
  }

  // Try to find valid positions for all colliding items
  let resolvedLayout = [...layout];
  const processedIds = new Set([movedItem.i]);

  // Sort collisions by size (larger items are harder to place, process first)
  const sortedCollisions = [...collisions].toSorted(
    (a, b) => b.w * b.h - a.w * a.h,
  );

  for (const collision of sortedCollisions) {
    const newPosition = findValidPosition(
      collision,
      resolvedLayout,
      bounds,
      processedIds,
    );

    if (newPosition === null) {
      // Cannot find a valid position within bounds - reject the move
      return null;
    }

    // Update the layout with the new position
    resolvedLayout = resolvedLayout.map((item) => {
      if (item.i === collision.i) {
        return { ...item, x: newPosition.x, y: newPosition.y, moved: true };
      }
      return item;
    });

    processedIds.add(collision.i);
  }

  return resolvedLayout;
}

// ============================================================================
// Clone Helpers
// ============================================================================

function cloneLayout(layout: Layout): Layout {
  return layout.map((item) => ({ ...item }));
}

// ============================================================================
// Multiview Compactor Factory
// ============================================================================

/**
 * Create a multiview compactor with explicit bounds.
 *
 * Key behaviors:
 * - Does NOT compact items (no gap filling)
 * - Resolves collisions by swapping or finding valid positions within bounds
 * - Rejects moves that would push items out of bounds
 *
 * This is ideal for multiview layouts where:
 * - Each panel should stay where the user placed it
 * - Dragging one panel shouldn't cause others to be pushed off-grid
 * - Simple swaps are preferred when panels collide
 *
 * @param cols - Number of columns in the grid
 * @param maxRows - Maximum number of rows in the grid
 * @returns A configured Compactor instance
 *
 * @example
 * ```tsx
 * const compactor = useMemo(
 *   () => createMultiviewCompactor(cols, rows),
 *   [cols, rows]
 * );
 * ```
 */
export function createMultiviewCompactor(
  cols: number,
  maxRows: number,
): Compactor {
  const bounds: GridBounds = { cols, maxRows };

  return {
    type: null, // No automatic compaction
    allowOverlap: false,
    preventCollision: true, // We handle collisions ourselves

    compact(layout: Layout, _cols: number): Layout {
      // No compaction - just clone to maintain immutability
      // Items stay exactly where they are
      return cloneLayout(layout);
    },

    onMove(
      layout: Layout,
      item: LayoutItem,
      x: number,
      y: number,
      _cols: number,
    ): Layout {
      // Clone the layout for immutability
      const newLayout = cloneLayout(layout);

      // Find the item being moved
      const movedItemIndex = newLayout.findIndex((l) => l.i === item.i);
      if (movedItemIndex === -1) {
        return newLayout;
      }

      // Store original position for potential swap
      const movedItem = newLayout[movedItemIndex];
      const originalPosition: Position = { x: movedItem.x, y: movedItem.y };

      // Update to new position
      movedItem.x = x;
      movedItem.y = y;
      movedItem.moved = true;

      // Try to resolve collisions using the factory-provided bounds
      const resolvedLayout = resolveCollisions(
        newLayout,
        movedItem,
        originalPosition,
        bounds,
      );

      if (resolvedLayout === null) {
        // Collision could not be resolved within bounds - revert the move
        movedItem.x = originalPosition.x;
        movedItem.y = originalPosition.y;
        movedItem.moved = false;
        return newLayout;
      }

      return resolvedLayout;
    },
  };
}

export default createMultiviewCompactor;
