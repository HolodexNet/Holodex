import { videoCells } from "./cells.ts"
import { replayTimedContinuation } from "./chat-continuation.ts"
import type {
  Cell,
  CellId,
  ChatPanels,
  ChatTarget,
  MultiviewVideo,
} from "./types.ts"

export const DEFAULT_PANELS: ChatPanels = { chat: true, tl: false }
export const TL_PANELS: ChatPanels = { chat: false, tl: true }

/** Flips one panel, turning the other on rather than leaving the cell blank. */
export function togglePanel(
  panels: ChatPanels,
  panel: keyof ChatPanels
): ChatPanels {
  const next = { ...panels, [panel]: !panels[panel] }
  if (next.chat || next.tl) return next
  return panel === "chat" ? TL_PANELS : DEFAULT_PANELS
}

export interface ResolvedChat {
  video: MultiviewVideo | null
  /** The video cell being served, when the stream is on the grid. */
  sourceCellId: CellId | null
  target: ChatTarget
}

/**
 * Decides what every chat cell shows. Explicit choices are honoured first; an
 * automatic chat then takes the video it prefers, or else the first one nothing
 * else is serving, so that new chats add coverage instead of duplicating it.
 */
export function resolveChats(
  cells: readonly Cell[]
): ReadonlyMap<CellId, ResolvedChat> {
  const videos = videoCells(cells)
  const served = new Set<CellId>()
  const resolved = new Map<CellId, ResolvedChat>()

  const autos: (Cell & { target: ChatTarget & { kind: "auto" } })[] = []
  for (const cell of cells) {
    if (cell.content?.type !== "chat") continue
    const { target } = cell.content
    if (target.kind === "auto") {
      autos.push({ ...cell, target })
    } else if (target.kind === "cell") {
      const source = videos.find((v) => v.id === target.cellId)
      if (source) served.add(source.id)
      resolved.set(cell.id, {
        video: source?.content.video ?? null,
        sourceCellId: source?.id ?? null,
        target,
      })
    } else {
      // A fixed stream may still happen to be on the grid; link them if so.
      const source = videos.find((v) => v.content.video.id === target.video.id)
      if (source) served.add(source.id)
      resolved.set(cell.id, {
        video: target.video,
        sourceCellId: source?.id ?? null,
        target,
      })
    }
  }

  for (const cell of autos) {
    const preferred =
      cell.target.prefer === undefined ? undefined : videos[cell.target.prefer]
    const source =
      (preferred && !served.has(preferred.id) ? preferred : undefined) ??
      videos.find((v) => !served.has(v.id)) ??
      preferred ??
      videos[0]
    if (source) served.add(source.id)
    resolved.set(cell.id, {
      video: source?.content.video ?? null,
      sourceCellId: source?.id ?? null,
      target: cell.target,
    })
  }
  return resolved
}

/** Automatic chats whose choice must survive the layout being rearranged. */
export function pinChats(cells: readonly Cell[]): Cell[] {
  const resolved = resolveChats(cells)
  return cells.map((cell) => {
    if (cell.content?.type !== "chat") return cell
    if (cell.content.target.kind !== "auto") return cell
    const sourceCellId = resolved.get(cell.id)?.sourceCellId
    if (!sourceCellId) return cell
    return {
      ...cell,
      content: {
        ...cell.content,
        target: { kind: "cell", cellId: sourceCellId },
      },
    }
  })
}

/**
 * Chats that followed a cell which no longer shows a video go back to choosing
 * for themselves, rather than sitting empty next to videos they could serve.
 */
export function releaseOrphanedChats(cells: readonly Cell[]): Cell[] {
  const videoIds = new Set(videoCells(cells).map((cell) => cell.id))
  let changed = false
  const next = cells.map((cell) => {
    if (cell.content?.type !== "chat") return cell
    const { target } = cell.content
    if (target.kind !== "cell" || videoIds.has(target.cellId)) return cell
    changed = true
    return {
      ...cell,
      content: { ...cell.content, target: { kind: "auto" as const } },
    }
  })
  return changed ? next : (cells as Cell[])
}

/** Steps a chat through the videos on the grid, for its previous/next arrows. */
export function neighbourTarget(
  cells: readonly Cell[],
  currentCellId: CellId | null,
  direction: -1 | 1
): ChatTarget | null {
  const videos = videoCells(cells)
  const index = videos.findIndex((cell) => cell.id === currentCellId)
  const next = videos[index + direction]
  return next ? { kind: "cell", cellId: next.id } : null
}

/** Twitch has no embeddable replay chat, so VODs have nothing to show. */
export function hasEmbeddedChat(video: MultiviewVideo): boolean {
  return video.source.provider !== "twitch" || !!video.source.channel
}

export function twitchChatUrl(
  channel: string,
  hostname: string,
  dark: boolean
): string {
  const params = new URLSearchParams({ parent: hostname })
  if (dark) params.set("darkpopout", "")
  return `https://www.twitch.tv/embed/${encodeURIComponent(channel)}/chat?${params}`
}

export interface YoutubeChatOptions {
  hostname: string
  dark: boolean
  /** The Holodex+ extension can serve replay chat from its original route. */
  extensionV3?: boolean
}

export function youtubeChatUrl(
  video: MultiviewVideo,
  { hostname, dark, extensionV3 = false }: YoutubeChatOptions
): string {
  const params = new URLSearchParams({
    v: video.id,
    embed_domain: hostname,
    dark_theme: dark ? "1" : "0",
  })
  if (video.status !== "past") {
    return `https://www.youtube.com/live_chat?${params}`
  }

  const channelId = video.channel.id
  if (channelId) {
    params.set("c", channelId)
    params.set(
      "continuation",
      replayTimedContinuation({ videoId: video.id, channelId })
    )
  }
  const route = extensionV3 ? "live_chat_replay" : "redirect_replay_chat"
  return `https://www.youtube.com/${route}?${params}`
}

/** Shrinks chat to stay legible in a narrow cell, stepping as the old UI did. */
export function chatScaleForWidth(width: number): number {
  const steps: [number, number][] = [
    [150, 0.5],
    [200, 0.6],
    [250, 0.75],
    [300, 0.85],
    [350, 1],
  ]
  return steps.find(([limit]) => width < limit)?.[1] ?? 1
}

/**
 * A colour for each video, shared with the chats serving it so that which chat
 * belongs to which video can be read at a glance. The golden angle keeps
 * neighbours distinct however many videos there are.
 */
export function accentHues(
  cells: readonly Cell[]
): ReadonlyMap<CellId, number> {
  return new Map(
    videoCells(cells).map((cell, index) => [
      cell.id,
      (205 + index * 137.5) % 360,
    ])
  )
}
