import type { Cell, CellId, GridPoint, Rect } from "./types.ts"

/** Both axes are divided into this many units, whatever the screen's shape. */
export const GRID_SIZE = 24
/** Below this a cell has no room for the player's own controls. */
export const MIN_CELL_SIZE = 2
/** New cells start at this size, as in the previous UI. */
export const DEFAULT_CELL = { w: 4, h: 6 } as const

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

export const rectsEqual = (a: Rect, b: Rect) =>
  a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h

export const rectsCollide = (a: Rect, b: Rect) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h

export const rectContains = (rect: Rect, point: GridPoint) =>
  point.x >= rect.x &&
  point.x < rect.x + rect.w &&
  point.y >= rect.y &&
  point.y < rect.y + rect.h

/** Column first, the order the previous UI filled cells and numbered videos. */
export const compareRects = (a: Rect, b: Rect) => a.x - b.x || a.y - b.y

export const sortCells = <T extends Pick<Cell, "rect">>(cells: readonly T[]) =>
  [...cells].sort((a, b) => compareRects(a.rect, b.rect))

/** Whole, on the grid, and at least a unit in each direction. */
export function clampRect(rect: Rect): Rect {
  const w = clamp(Math.round(rect.w) || 1, 1, GRID_SIZE)
  const h = clamp(Math.round(rect.h) || 1, 1, GRID_SIZE)
  return {
    x: clamp(Math.round(rect.x) || 0, 0, GRID_SIZE - w),
    y: clamp(Math.round(rect.y) || 0, 0, GRID_SIZE - h),
    w,
    h,
  }
}

export function cellAt(
  cells: readonly Cell[],
  point: GridPoint,
  ignore?: CellId
): Cell | undefined {
  // Later cells paint on top of earlier ones if a shared layout overlaps.
  for (let i = cells.length - 1; i >= 0; i--) {
    const cell = cells[i]
    if (cell.id !== ignore && rectContains(cell.rect, point)) return cell
  }
  return undefined
}

export function isRectFree(
  cells: readonly Cell[],
  rect: Rect,
  ignore?: CellId
): boolean {
  return !cells.some(
    (cell) => cell.id !== ignore && rectsCollide(cell.rect, rect)
  )
}

/**
 * The first free position for a new cell, shrinking it when the grid is too
 * full for the default size. `null` once there is no room even at the minimum.
 */
export function findFreeRect(cells: readonly Cell[]): Rect | null {
  const sizes = [
    DEFAULT_CELL,
    { w: 3, h: 4 },
    { w: MIN_CELL_SIZE, h: MIN_CELL_SIZE },
  ]
  for (const { w, h } of sizes) {
    for (let y = 0; y + h <= GRID_SIZE; y++) {
      for (let x = 0; x + w <= GRID_SIZE; x++) {
        const rect = { x, y, w, h }
        if (isRectFree(cells, rect)) return rect
      }
    }
  }
  return null
}

/** The free position nearest to `rect`, for a dragged cell to rest in. */
export function nearestFreeRect(
  cells: readonly Cell[],
  rect: Rect,
  ignore: CellId
): Rect | null {
  let best: Rect | null = null
  let bestDistance = Infinity
  for (let y = 0; y + rect.h <= GRID_SIZE; y++) {
    for (let x = 0; x + rect.w <= GRID_SIZE; x++) {
      const distance = Math.abs(x - rect.x) + Math.abs(y - rect.y)
      if (distance >= bestDistance) continue
      const candidate = { x, y, w: rect.w, h: rect.h }
      if (isRectFree(cells, candidate, ignore)) {
        best = candidate
        bestDistance = distance
      }
    }
  }
  return best
}
