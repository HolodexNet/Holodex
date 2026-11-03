import { videoCells } from "./cells.ts"
import { muteAllExcept, swapCells } from "./layout.ts"
import type { Cell, CellId, Rect, VideoCell } from "./types.ts"

/**
 * Directing: one big screen, and keys that put any other video on it. Which cell
 * is the big screen is worked out from the rects rather than stored, and swapping
 * only trades rects, so the same place on screen stays the big screen and every
 * player keeps running.
 */

/** How much bigger than the rest a video must be to count as the big screen. */
const CENTER_RATIO = 1.5

const area = ({ w, h }: Rect) => w * h

/** Top to bottom and left to right, which is how anyone reads the numbers. */
const readingOrder = (a: Rect, b: Rect) => a.y - b.y || a.x - b.x

/**
 * The video that is clearly the main one, if the layout has one. With `force`, as
 * in director mode, the biggest will do even in a layout of equals.
 */
export function findCenterCell(
  cells: readonly Cell[],
  { force = false }: { force?: boolean } = {}
): VideoCell | null {
  const [largest, next] = [...videoCells(cells)].sort(
    (a, b) => area(b.rect) - area(a.rect) || readingOrder(a.rect, b.rect)
  )
  if (!largest || !next) return null
  return force || area(largest.rect) >= area(next.rect) * CENTER_RATIO
    ? largest
    : null
}

/**
 * The other videos, numbered by where they are. A swap puts the old big screen
 * where the new one was, so a number always means the same place on screen, and
 * pressing it twice swaps back.
 */
export const screenPositions = (
  cells: readonly Cell[],
  center: Cell
): VideoCell[] =>
  videoCells(cells)
    .filter((cell) => cell.id !== center.id)
    .sort((a, b) => readingOrder(a.rect, b.rect))

/**
 * The next video to put on the big screen. Goes by layout order, which swaps leave
 * alone, so that stepping visits every stream instead of trading the same two.
 */
export function neighbourOfCenter(
  cells: readonly Cell[],
  center: Cell,
  direction: -1 | 1
): VideoCell | null {
  const videos = videoCells(cells)
  const index = videos.findIndex((cell) => cell.id === center.id)
  if (index < 0 || videos.length < 2) return null
  return videos[(index + direction + videos.length) % videos.length]
}

/**
 * Puts a video on the big screen. Audio Focus means the sound goes with it, which
 * is the one thing a swap changes other than where things are.
 */
export function swapIntoCenter(
  cells: readonly Cell[],
  id: CellId,
  { director, audioFocus }: { director: boolean; audioFocus: boolean }
): Cell[] {
  const center = findCenterCell(cells, { force: director })
  const isVideo = videoCells(cells).some((cell) => cell.id === id)
  if (!center || center.id === id || !isVideo) return cells as Cell[]
  const swapped = swapCells(cells, center.id, id)
  return audioFocus ? muteAllExcept(swapped, id) : swapped
}
