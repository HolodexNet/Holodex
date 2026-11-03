import { isChatCell, isControlCell, isEmptyCell, videoCells } from "./cells.ts"
import { GRID_SIZE, MIN_CELL_SIZE, sortCells } from "./grid.ts"
import { muteAllExcept, setRects, swapCells } from "./layout.ts"
import type { Cell, CellId, Rect, VideoCell } from "./types.ts"

/**
 * Directing: one big screen, and keys that put any other video on it. Which cell
 * is the big screen is worked out from the rects rather than stored, and swapping
 * only trades rects, so the same place on screen stays the big screen and every
 * player keeps running.
 */

/** How much bigger than the rest a video must be to count as the big screen. */
const CENTER_RATIO = 1.5
/** The row stays low enough to leave the big screen big, and tall enough to see. */
const MIN_ROW_HEIGHT = 3
const MAX_ROW_HEIGHT = 6
const CHAT_COLUMN_WIDTH = 6

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

/** Divides a length as evenly as whole units allow, the spare ones going first. */
function divide(length: number, parts: number): number[] {
  const size = Math.floor(length / parts)
  const spare = length % parts
  return Array.from({ length: parts }, (_, i) => size + (i < spare ? 1 : 0))
}

export interface DirectorRects {
  center: Rect
  row: Rect[]
  chats: Rect[]
}

/**
 * A big screen with a row of cells under it, and any chats in a column down the
 * side. On a 16:9 stage a square of grid units is itself 16:9, so the row keeps its
 * cells about square wherever it has room to. `null` means they cannot all fit.
 */
export function directorRects(
  rowCount: number,
  chatCount = 0
): DirectorRects | null {
  const width = chatCount ? GRID_SIZE - CHAT_COLUMN_WIDTH : GRID_SIZE
  if (rowCount && width / rowCount < MIN_CELL_SIZE) return null
  if (chatCount && GRID_SIZE / chatCount < MIN_CELL_SIZE) return null

  const rowHeight = rowCount
    ? Math.min(
        Math.max(Math.round(width / rowCount), MIN_ROW_HEIGHT),
        MAX_ROW_HEIGHT
      )
    : 0
  let x = 0
  const row = divide(width, rowCount || 1)
    .slice(0, rowCount)
    .map((w) => {
      const rect = { x, y: GRID_SIZE - rowHeight, w, h: rowHeight }
      x += w
      return rect
    })
  let y = 0
  const chats = divide(GRID_SIZE, chatCount || 1)
    .slice(0, chatCount)
    .map((h) => {
      const rect = { x: width, y, w: CHAT_COLUMN_WIDTH, h }
      y += h
      return rect
    })
  return {
    center: { x: 0, y: 0, w: width, h: GRID_SIZE - rowHeight },
    row,
    chats,
  }
}

/**
 * Rearranges what is already on screen into a director layout. Only rects change,
 * so no player or chat is touched. The current big screen stays the big screen,
 * and controls and empty cells go to the end of the row, out of the numbering's way.
 */
export function arrangeDirector(cells: readonly Cell[]): Cell[] | null {
  const center = findCenterCell(cells, { force: true })
  if (!center) return null
  const chats = sortCells(cells.filter(isChatCell))
  const row = [
    ...screenPositions(cells, center),
    ...sortCells(cells.filter(isEmptyCell)),
    ...sortCells(cells.filter(isControlCell)),
  ]
  const rects = directorRects(row.length, chats.length)
  if (!rects) return null
  return setRects(
    cells,
    new Map([
      [center.id, rects.center],
      ...row.map((cell, i) => [cell.id, rects.row[i]] as const),
      ...chats.map((cell, i) => [cell.id, rects.chats[i]] as const),
    ])
  )
}
