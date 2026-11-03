import type {
  Cell,
  CellId,
  ChatCell,
  LayoutSlot,
  MultiviewVideo,
  VideoCell,
} from "./types.ts"

const ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"

/** Random, so two cells created at once can still never trade DOM positions. */
export function generateCellId(): CellId {
  return Array.from(
    { length: 8 },
    () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  ).join("")
}

export const isVideoCell = (cell: Cell): cell is VideoCell =>
  cell.content?.type === "video"

export const isChatCell = (cell: Cell): cell is ChatCell =>
  cell.content?.type === "chat"

export const isEmptyCell = (cell: Cell) => cell.content === null

/**
 * Cells with a video, in layout order. This order is what `chat2` in a shared
 * link counts through, and repositioning cells deliberately leaves it alone.
 */
export const videoCells = (cells: readonly Cell[]): VideoCell[] =>
  cells.filter(isVideoCell)

export const activeVideos = (cells: readonly Cell[]): MultiviewVideo[] =>
  videoCells(cells).map((cell) => cell.content.video)

/** Videos that are not muted. */
export const audibleCells = (cells: readonly Cell[]): VideoCell[] =>
  videoCells(cells).filter((cell) => !cell.content.muted)

/** The stream Audio Focus is letting through, once exactly one has sound. */
export function soleAudibleCell(cells: readonly Cell[]): CellId | null {
  const audible = audibleCells(cells)
  return audible.length === 1 ? audible[0].id : null
}

/** Cells showing or waiting for a video, which is what presets are sized by. */
export const nonChatCellCount = (cells: readonly Cell[]): number =>
  cells.filter((cell) => !isChatCell(cell)).length

export const instantiateSlots = (slots: readonly LayoutSlot[]): Cell[] =>
  slots.map((slot) => ({
    id: generateCellId(),
    rect: { ...slot.rect },
    content: slot.content,
  }))

/**
 * Sorted by id, which is the DOM order of the player frames. Any two ids always
 * compare the same way, so no update can ever reorder two existing frames, and
 * moving an iframe in the DOM is what would make it reload.
 */
export function frameOrder<T extends { id: CellId }>(cells: readonly T[]): T[] {
  return [...cells].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
}
