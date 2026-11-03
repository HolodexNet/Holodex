import {
  cellAt,
  clampRect,
  GRID_SIZE,
  isRectFree,
  MIN_CELL_SIZE,
  nearestFreeRect,
  rectsCollide,
} from "./grid.ts"
import type { Cell, CellId, GridPoint, Rect } from "./types.ts"

/**
 * What a pointer gesture over the grid would do, worked out from nothing but
 * the current layout and the pointer's position. The edit layer renders these
 * plans and commits the last one on release.
 */

export type ResizeHandle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw"

export const RESIZE_HANDLES: readonly ResizeHandle[] = [
  "n",
  "s",
  "e",
  "w",
  "ne",
  "nw",
  "se",
  "sw",
]

export interface MovePlan {
  /** Where the dragged cell would end up. */
  rect: Rect
  /** The cell it would trade places with instead of moving into free space. */
  swapWith: CellId | null
}

/**
 * Over another cell a drag becomes a swap. Over free space the cell settles in
 * the nearest position it fits, so it never overlaps what it is dragged past.
 */
export function planMove(
  cells: readonly Cell[],
  id: CellId,
  origin: Rect,
  grab: GridPoint,
  pointer: GridPoint
): MovePlan {
  const over = cellAt(cells, pointer, id)
  if (over) return { rect: over.rect, swapWith: over.id }
  const wanted = clampRect({
    x: pointer.x - grab.x,
    y: pointer.y - grab.y,
    w: origin.w,
    h: origin.h,
  })
  return {
    rect: nearestFreeRect(cells, wanted, id) ?? origin,
    swapWith: null,
  }
}

/** Cells that already overlap `rect` cannot block it, or it could not move. */
function blockers(cells: readonly Cell[], id: CellId, rect: Rect) {
  return cells.filter(
    (cell) => cell.id !== id && !rectsCollide(cell.rect, rect)
  )
}

/** Walks one edge from `from` to `to`, stopping at the first refused step. */
function walk(
  from: number,
  to: number,
  accept: (edge: number) => boolean
): number {
  const step = Math.sign(to - from)
  let edge = from
  while (edge !== to && accept(edge + step)) edge += step
  return edge
}

export interface ResizePlan {
  rect: Rect
  /** Neighbours giving up room, at the size they would shrink to. */
  pushed: ReadonlyMap<CellId, Rect>
}

/**
 * The neighbour after giving way to `rect`, if it adjoined the edge being dragged
 * and has room to spare. `null` when it has to stop the resize instead.
 */
function pushNeighbour(
  neighbour: Rect,
  origin: Rect,
  rect: Rect,
  handle: ResizeHandle
): Rect | null {
  let { x, y, w, h } = neighbour
  const right = x + w
  const bottom = y + h
  if (handle.includes("e") && x === origin.x + origin.w) {
    x = Math.max(x, rect.x + rect.w)
    w = right - x
  }
  if (handle.includes("w") && right === origin.x) {
    w = Math.min(w, rect.x - x)
  }
  if (handle.includes("s") && y === origin.y + origin.h) {
    y = Math.max(y, rect.y + rect.h)
    h = bottom - y
  }
  if (handle.includes("n") && bottom === origin.y) {
    h = Math.min(h, rect.y - y)
  }
  const next = { x, y, w, h }
  return w >= MIN_CELL_SIZE && h >= MIN_CELL_SIZE && !rectsCollide(next, rect)
    ? next
    : null
}

/**
 * Moves one edge or corner. Growing into a cell that touches that edge pushes it
 * back, so the layouts people mostly use, which are tiled with no gaps, can be
 * adjusted in one drag. Shrinking only ever frees up space. A resize stops at the
 * grid's bounds, at the minimum size, at a neighbour with no room left to give,
 * and at any cell that was not already touching.
 */
export function planResize(
  cells: readonly Cell[],
  id: CellId,
  origin: Rect,
  handle: ResizeHandle,
  pointer: GridPoint
): ResizePlan {
  const others = blockers(cells, id, origin)
  const fits = (rect: Rect) =>
    others.every(
      (cell) =>
        !rectsCollide(cell.rect, rect) ||
        pushNeighbour(cell.rect, origin, rect, handle) !== null
    )

  let left = origin.x
  let right = origin.x + origin.w
  let top = origin.y
  let bottom = origin.y + origin.h
  const current = (): Rect => ({
    x: left,
    y: top,
    w: right - left,
    h: bottom - top,
  })
  const px = Math.round(pointer.x)
  const py = Math.round(pointer.y)

  if (handle.includes("e")) {
    const to = Math.min(Math.max(px, left + MIN_CELL_SIZE), GRID_SIZE)
    right = walk(right, to, (e) => fits({ ...current(), w: e - left }))
  } else if (handle.includes("w")) {
    const to = Math.max(Math.min(px, right - MIN_CELL_SIZE), 0)
    left = walk(left, to, (e) => fits({ ...current(), x: e, w: right - e }))
  }
  if (handle.includes("s")) {
    const to = Math.min(Math.max(py, top + MIN_CELL_SIZE), GRID_SIZE)
    bottom = walk(bottom, to, (e) => fits({ ...current(), h: e - top }))
  } else if (handle.includes("n")) {
    const to = Math.max(Math.min(py, bottom - MIN_CELL_SIZE), 0)
    top = walk(top, to, (e) => fits({ ...current(), y: e, h: bottom - e }))
  }

  const rect = current()
  const pushed = new Map<CellId, Rect>()
  for (const cell of others) {
    if (!rectsCollide(cell.rect, rect)) continue
    const next = pushNeighbour(cell.rect, origin, rect, handle)
    if (next) pushed.set(cell.id, next)
  }
  return { rect, pushed }
}

/** The new layout for a plan, in the form the store takes. */
export const resizeChanges = (
  id: CellId,
  plan: ResizePlan
): ReadonlyMap<CellId, Rect> => new Map([[id, plan.rect], ...plan.pushed])

/**
 * A new cell rubber-banded out from `anchor`. The result stops short of any
 * cell in the way and is `null` until it is big enough to be usable.
 */
export function planDraw(
  cells: readonly Cell[],
  anchor: GridPoint,
  pointer: GridPoint
): Rect | null {
  const x0 = Math.floor(anchor.x)
  const y0 = Math.floor(anchor.y)
  const fits = (rect: Rect) => isRectFree(cells, rect)
  if (!fits({ x: x0, y: y0, w: 1, h: 1 })) return null

  // Grow along x first, then push the whole row along y.
  const toRight = pointer.x >= x0
  const toX = toRight
    ? Math.min(Math.ceil(pointer.x), GRID_SIZE)
    : Math.max(Math.floor(pointer.x), 0)
  const xEdge = walk(toRight ? x0 + 1 : x0, toX, (e) =>
    fits(
      toRight
        ? { x: x0, y: y0, w: e - x0, h: 1 }
        : { x: e, y: y0, w: x0 + 1 - e, h: 1 }
    )
  )
  const x = toRight ? x0 : xEdge
  const w = toRight ? xEdge - x0 : x0 + 1 - xEdge

  const toBottom = pointer.y >= y0
  const toY = toBottom
    ? Math.min(Math.ceil(pointer.y), GRID_SIZE)
    : Math.max(Math.floor(pointer.y), 0)
  const yEdge = walk(toBottom ? y0 + 1 : y0, toY, (e) =>
    fits(toBottom ? { x, y: y0, w, h: e - y0 } : { x, y: e, w, h: y0 + 1 - e })
  )
  const y = toBottom ? y0 : yEdge
  const h = toBottom ? yEdge - y0 : y0 + 1 - yEdge

  return w >= MIN_CELL_SIZE && h >= MIN_CELL_SIZE ? { x, y, w, h } : null
}

/** One keyboard step. Refused when it would leave the grid or hit a cell. */
export function planNudge(
  cells: readonly Cell[],
  id: CellId,
  rect: Rect,
  delta: GridPoint
): Rect {
  const next = { ...rect, x: rect.x + delta.x, y: rect.y + delta.y }
  const inBounds =
    next.x >= 0 &&
    next.y >= 0 &&
    next.x + next.w <= GRID_SIZE &&
    next.y + next.h <= GRID_SIZE
  if (!inBounds) return rect
  const free = blockers(cells, id, rect).every(
    (cell) => !rectsCollide(cell.rect, next)
  )
  return free ? next : rect
}

/** One keyboard step of resizing, by the right and bottom edges. */
export function planKeyResize(
  cells: readonly Cell[],
  id: CellId,
  rect: Rect,
  delta: GridPoint
): ResizePlan {
  const handle: ResizeHandle = delta.x ? "e" : "s"
  return planResize(cells, id, rect, handle, {
    x: rect.x + rect.w + delta.x,
    y: rect.y + rect.h + delta.y,
  })
}

/** Grid units for a pointer at the given offset inside the stage. */
export function toGridPoint(
  offsetX: number,
  offsetY: number,
  stageWidth: number,
  stageHeight: number
): GridPoint {
  return {
    x: Math.min(Math.max((offsetX / stageWidth) * GRID_SIZE, 0), GRID_SIZE),
    y: Math.min(Math.max((offsetY / stageHeight) * GRID_SIZE, 0), GRID_SIZE),
  }
}
