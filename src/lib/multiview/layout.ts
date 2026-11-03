import {
  activeVideos,
  audibleCells,
  generateCellId,
  instantiateSlots,
  isChatCell,
  isEmptyCell,
  isVideoCell,
  nonChatCellCount,
} from "./cells.ts"
import { pinChats, releaseOrphanedChats } from "./chat.ts"
import { compareRects, findFreeRect, sortCells } from "./grid.ts"
import { withMetadata, type VideoDetails } from "./stream.ts"
import type {
  Cell,
  CellContent,
  CellId,
  DecodedLayout,
  MultiviewVideo,
  Rect,
} from "./types.ts"

/**
 * Every change a layout can undergo, as functions from one list of cells to the
 * next. Reusing an existing cell's id wherever its content survives is the rule
 * that keeps players running: the frame stays mounted and only moves on screen.
 */

const rectSignature = (rects: readonly Rect[]) =>
  [...rects]
    .sort((a, b) => compareRects(a, b) || a.w - b.w || a.h - b.h)
    .map(({ x, y, w, h }) => `${x},${y},${w},${h}`)
    .join(";")

/** Whether the cells form one of these layouts, so may be freely replaced. */
export function matchesPreset(
  cells: readonly Cell[],
  presets: readonly DecodedLayout[]
): boolean {
  const current = rectSignature(cells.map((cell) => cell.rect))
  return presets.some(
    (preset) =>
      preset.slots.length === cells.length &&
      rectSignature(preset.slots.map((slot) => slot.rect)) === current
  )
}

/** The layout for this many videos, or else the smallest one that fits them. */
export function pickAutoPreset(
  presets: readonly DecodedLayout[],
  videoCount: number
): DecodedLayout | undefined {
  return (
    presets.find((preset) => preset.videoCellCount === videoCount) ??
    presets.find((preset) => preset.videoCellCount >= videoCount)
  )
}

/**
 * Replaces the layout. With `merge`, what is currently playing moves into the
 * new layout's free slots in on-screen order. Each moved cell keeps its id, so
 * its player keeps running, and each chat keeps following the same video.
 */
export function applyLayout(
  current: readonly Cell[],
  layout: DecodedLayout,
  { merge = false }: { merge?: boolean } = {}
): Cell[] {
  const incoming = instantiateSlots(layout.slots)
  if (!merge) return releaseOrphanedChats(incoming)

  const pinned = pinChats(current)
  const videos = sortCells(pinned.filter(isVideoCell))
  const chats = sortCells(pinned.filter(isChatCell))

  const merged = incoming.map((cell) => {
    if (isEmptyCell(cell)) {
      const video = videos.shift()
      if (video) return { ...cell, id: video.id, content: video.content }
    } else if (isChatCell(cell)) {
      const chat = chats.shift()
      if (chat) return { ...cell, id: chat.id, content: chat.content }
    }
    return cell
  })
  return releaseOrphanedChats(merged)
}

export function fillFirstEmptyCell(
  cells: readonly Cell[],
  video: MultiviewVideo
): Cell[] | null {
  const empty = sortCells(cells.filter(isEmptyCell))[0]
  return empty
    ? setCellContent(cells, empty.id, { type: "video", video })
    : null
}

export type AddVideoOutcome =
  | { kind: "placed"; cells: Cell[] }
  /** The layout was hand-made; replacing it needs the viewer's approval. */
  | { kind: "needs-confirmation"; proposal: DecodedLayout }
  | { kind: "no-layout" }

export interface AutoLayoutContext {
  /** The ascending choices auto-layout grows and shrinks through. */
  autoPresets: readonly DecodedLayout[]
  /** A layout matching any of these was not hand-made. */
  knownPresets: readonly DecodedLayout[]
}

const canReplaceFreely = (
  cells: readonly Cell[],
  { knownPresets }: AutoLayoutContext
) => cells.length === 0 || matchesPreset(cells, knownPresets)

/**
 * Finds a place for a video: an empty cell if there is one, otherwise the next
 * bigger auto-layout preset.
 */
export function addVideo(
  cells: readonly Cell[],
  video: MultiviewVideo,
  context: AutoLayoutContext
): AddVideoOutcome {
  const filled = fillFirstEmptyCell(cells, video)
  if (filled) return { kind: "placed", cells: filled }

  const preset = pickAutoPreset(
    context.autoPresets,
    activeVideos(cells).length + 1
  )
  if (!preset) return { kind: "no-layout" }
  if (!canReplaceFreely(cells, context)) {
    return { kind: "needs-confirmation", proposal: preset }
  }
  const next = applyLayout(cells, preset, { merge: true })
  return {
    kind: "placed",
    cells: fillFirstEmptyCell(next, video) ?? next,
  }
}

/** The next bigger preset, or a loose cell in the first free spot. */
export function addCell(
  cells: readonly Cell[],
  context: AutoLayoutContext
): Cell[] | null {
  const preset = pickAutoPreset(
    context.autoPresets,
    nonChatCellCount(cells) + 1
  )
  if (preset && canReplaceFreely(cells, context)) {
    return applyLayout(cells, preset, { merge: true })
  }
  const rect = findFreeRect(cells)
  return rect && addCellAt(cells, rect)
}

export function addCellAt(cells: readonly Cell[], rect: Rect): Cell[] {
  return [...cells, { id: generateCellId(), rect, content: null }]
}

export function removeCell(cells: readonly Cell[], id: CellId): Cell[] {
  return releaseOrphanedChats(cells.filter((cell) => cell.id !== id))
}

/**
 * Removes a cell. If the layout came from a preset the rest flows into the next
 * smaller one, instead of leaving a hole in it.
 */
export function removeCellAuto(
  cells: readonly Cell[],
  id: CellId,
  context: AutoLayoutContext
): Cell[] {
  const target = cells.find((cell) => cell.id === id)
  if (!target) return [...cells]
  if (isChatCell(target) || !matchesPreset(cells, context.knownPresets)) {
    return removeCell(cells, id)
  }
  const count = nonChatCellCount(cells)
  if (count <= 1) return []
  const smaller = context.autoPresets.find(
    (preset) => preset.videoCellCount === count - 1
  )
  if (!smaller) return removeCell(cells, id)
  return applyLayout(
    cells.filter((cell) => cell.id !== id),
    smaller,
    { merge: true }
  )
}

export function setCellContent(
  cells: readonly Cell[],
  id: CellId,
  content: CellContent | null
): Cell[] {
  return releaseOrphanedChats(
    cells.map((cell) => (cell.id === id ? { ...cell, content } : cell))
  )
}

/**
 * Goes back to an earlier layout while keeping what has been learned since. Fresh
 * stream details and who is muted were never part of the edit being undone.
 */
export function restoreLayout(
  snapshot: readonly Cell[],
  current: readonly Cell[]
): Cell[] {
  const latest = new Map(
    current
      .filter(isVideoCell)
      .map((cell) => [cell.content.video.id, cell.content])
  )
  return snapshot.map((cell) => {
    if (!isVideoCell(cell)) return cell
    const content = latest.get(cell.content.video.id)
    return content ? { ...cell, content } : cell
  })
}

export function setRects(
  cells: readonly Cell[],
  rects: ReadonlyMap<CellId, Rect>
): Cell[] {
  return cells.map((cell) => {
    const rect = rects.get(cell.id)
    return rect ? { ...cell, rect } : cell
  })
}

/** Two cells trade positions; content and players never move between them. */
export function swapCells(
  cells: readonly Cell[],
  a: CellId,
  b: CellId
): Cell[] {
  const first = cells.find((cell) => cell.id === a)
  const second = cells.find((cell) => cell.id === b)
  if (!first || !second) return [...cells]
  return setRects(
    cells,
    new Map([
      [a, second.rect],
      [b, first.rect],
    ])
  )
}

export function setMuted(
  cells: readonly Cell[],
  id: CellId,
  muted: boolean
): Cell[] {
  return cells.map((cell) =>
    cell.id === id && isVideoCell(cell)
      ? { ...cell, content: { ...cell.content, muted } }
      : cell
  )
}

export function setAllMuted(cells: readonly Cell[], muted: boolean): Cell[] {
  return cells.map((cell) =>
    isVideoCell(cell) ? { ...cell, content: { ...cell.content, muted } } : cell
  )
}

/** Silences every video but one, which is what Audio Focus keeps true. */
export function muteAllExcept(cells: readonly Cell[], keep: CellId): Cell[] {
  return cells.map((cell) =>
    isVideoCell(cell)
      ? { ...cell, content: { ...cell.content, muted: cell.id !== keep } }
      : cell
  )
}

/**
 * Turning Audio Focus on should not change what is being heard if it can help it:
 * the stream asked for, then the first one with sound, then simply the first.
 */
export function focusAudio(cells: readonly Cell[], prefer?: CellId): Cell[] {
  const videos = cells.filter(isVideoCell)
  const keep =
    videos.find((cell) => cell.id === prefer) ??
    audibleCells(cells)[0] ??
    videos[0]
  return keep ? muteAllExcept(cells, keep.id) : [...cells]
}

/** Applies fresh details to every cell and fixed chat showing these streams. */
export function mergeVideoData(
  cells: readonly Cell[],
  fresh: ReadonlyMap<string, VideoDetails>,
  failed: ReadonlySet<string> = new Set()
): Cell[] {
  const update = (video: MultiviewVideo): MultiviewVideo => {
    const data = fresh.get(video.id)
    if (data) return withMetadata(video, data)
    return failed.has(video.id) ? { ...video, noData: true } : video
  }
  return cells.map((cell) => {
    if (isVideoCell(cell)) {
      return {
        ...cell,
        content: { ...cell.content, video: update(cell.content.video) },
      }
    }
    if (isChatCell(cell) && cell.content.target.kind === "video") {
      return {
        ...cell,
        content: {
          ...cell.content,
          target: { kind: "video", video: update(cell.content.target.video) },
        },
      }
    }
    return cell
  })
}

/** Stream ids whose details should be fetched. */
export function videosToLookUp(
  cells: readonly Cell[],
  shouldLookUp: (video: MultiviewVideo) => boolean
): string[] {
  const ids = new Set<string>()
  for (const cell of cells) {
    if (isVideoCell(cell) && shouldLookUp(cell.content.video)) {
      ids.add(cell.content.video.id)
    } else if (
      isChatCell(cell) &&
      cell.content.target.kind === "video" &&
      shouldLookUp(cell.content.target.video)
    ) {
      ids.add(cell.content.target.video.id)
    }
  }
  return [...ids]
}
