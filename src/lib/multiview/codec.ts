import { isChatCell, isControlCell } from "./cells.ts"
import { DEFAULT_PANELS } from "./chat.ts"
import { ALL_CONTROL_PANELS } from "./control.ts"
import { clampRect } from "./grid.ts"
import {
  isTwitchLogin,
  isYoutubeId,
  twitchChannelStub,
  twitchVodStub,
  youtubeStub,
} from "./stream.ts"
import type {
  Cell,
  ChatTarget,
  ControlPanels,
  DecodedLayout,
  LayoutSlot,
  MultiviewVideo,
  Rect,
} from "./types.ts"

/**
 * The compact layout format shared by permalinks, saved presets and the
 * server-rendered layout images:
 *
 *     <x><y><w><h>[content],...
 *
 * Coordinates are one character each from the alphabet below. Content is empty,
 * an 11-character YouTube id (optionally followed by a channel label),
 * `twitch<login>`, or `chat`.
 *
 * Chats may carry a number, counting through the layout's videos in decoded
 * order. A fixed chat for a stream that is not in the layout is written
 * `chat-<stream>`; older clients read that as an unbound chat.
 *
 * Controls are written `control`, with `m` or `s` when only the media or sync
 * half is showing. Anything shorter than a video id that is not a chat reads as an
 * empty cell to older clients and the server.
 */
const ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_."

const MAX_COORDINATE = ALPHABET.length - 1
/** Far beyond any usable layout; a crafted link must not spawn endless players. */
const MAX_CELLS = 64
const TWITCH = "twitch"
const TWITCH_VOD = "twitch:v"

const encodeRect = ({ x, y, w, h }: Rect) =>
  [x, y, w, h].map((value) => ALPHABET[value]).join("")

const isEncodable = ({ x, y, w, h }: Rect) =>
  [x, y, w, h].every((value) => value >= 0 && value <= MAX_COORDINATE)

/** Inner content for a video cell or a fixed chat. */
function encodeStream(video: MultiviewVideo): string {
  const { source } = video
  if (source.provider === "youtube") return source.videoId
  return source.channel
    ? `${TWITCH}${source.channel}`
    : `${TWITCH_VOD}${source.videoId}`
}

function decodeStream(content: string): MultiviewVideo | null {
  if (content.startsWith(TWITCH_VOD)) {
    const id = content.slice(TWITCH_VOD.length)
    return /^\d+$/.test(id) ? twitchVodStub(id) : null
  }
  if (content.startsWith(TWITCH)) {
    const login = content.slice(TWITCH.length)
    return isTwitchLogin(login) ? twitchChannelStub(login) : null
  }
  const id = content.slice(0, 11)
  // Anything after the id is the label some links carry for image rendering.
  return isYoutubeId(id) ? youtubeStub(id, content.slice(11)) : null
}

function decodeChat(content: string): ChatTarget | null {
  const numbered = /^chat(\d{0,3})$/.exec(content)
  if (numbered) {
    return numbered[1]
      ? { kind: "auto", prefer: Number(numbered[1]) }
      : { kind: "auto" }
  }
  if (content.startsWith("chat-")) {
    const video = decodeStream(content.slice("chat-".length))
    return video && { kind: "video", video }
  }
  return null
}

const CONTROL = "control"

function decodeControl(content: string): ControlPanels | null {
  if (content === CONTROL) return ALL_CONTROL_PANELS
  if (content === `${CONTROL}m`) return { media: true, sync: false }
  if (content === `${CONTROL}s`) return { media: false, sync: true }
  return null
}

function encodeControl({ media, sync }: ControlPanels): string {
  if (media && sync) return CONTROL
  return `${CONTROL}${media ? "m" : "s"}`
}

function decodeSlot(part: string): LayoutSlot | null {
  if (part.length < 4) return null
  const [x, y, w, h] = [...part.slice(0, 4)].map((c) => ALPHABET.indexOf(c))
  if (x < 0 || y < 0 || w < 0 || h < 0) return null
  const rect = clampRect({ x, y, w, h })
  const content = part.slice(4)
  if (!content) return { rect, content: null }

  const target = decodeChat(content)
  if (target) {
    return { rect, content: { type: "chat", target, panels: DEFAULT_PANELS } }
  }
  const panels = decodeControl(content)
  if (panels) return { rect, content: { type: "control", panels } }
  const video = decodeStream(content)
  return { rect, content: video && { type: "video", video } }
}

export function decodeLayout(encoded: string): DecodedLayout | null {
  // Sorting is part of the format: the numbers in `chat2` count through videos
  // in this order, and every link in the wild depends on it.
  const parts = encoded.split(",").filter(Boolean).sort().slice(0, MAX_CELLS)
  if (!parts.length) return null
  const slots: LayoutSlot[] = []
  for (const part of parts) {
    const slot = decodeSlot(part)
    if (!slot) return null
    slots.push(slot)
  }
  return {
    id: encoded,
    slots,
    videoCellCount: slots.filter(
      ({ content }) => content?.type !== "chat" && content?.type !== "control"
    ).length,
  }
}

export interface EncodeOptions {
  /** Permalinks carry the videos; saved presets are only the shape. */
  includeVideo?: boolean
}

export function encodeLayout(
  cells: readonly Cell[],
  { includeVideo = false }: EncodeOptions = {}
): string {
  const encoded = cells
    .filter((cell) => isEncodable(cell.rect))
    .map((cell) => ({ cell, prefix: encodeRect(cell.rect) }))
    .sort((a, b) => (a.prefix < b.prefix ? -1 : a.prefix > b.prefix ? 1 : 0))

  // Numbered the way decodeLayout will count them, not how the array is ordered.
  const videos = encoded.filter(({ cell }) => cell.content?.type === "video")
  const chatNumber = (cellId: string) => {
    const index = videos.findIndex(({ cell }) => cell.id === cellId)
    return index >= 0 ? String(index) : ""
  }
  const numberOfStream = (id: string) => {
    const index = videos.findIndex(
      ({ cell }) =>
        cell.content?.type === "video" && cell.content.video.id === id
    )
    return index >= 0 ? String(index) : null
  }

  const encodeChat = (target: ChatTarget) => {
    switch (target.kind) {
      case "auto":
        return `chat${target.prefer ?? ""}`
      case "cell":
        return `chat${chatNumber(target.cellId)}`
      case "video": {
        const number = numberOfStream(target.video.id)
        if (number !== null) return `chat${number}`
        return includeVideo ? `chat-${encodeStream(target.video)}` : "chat"
      }
    }
  }

  return encoded
    .map(({ cell, prefix }) => {
      if (isChatCell(cell)) return prefix + encodeChat(cell.content.target)
      if (isControlCell(cell)) return prefix + encodeControl(cell.content.panels)
      if (cell.content?.type === "video" && includeVideo) {
        return prefix + encodeStream(cell.content.video)
      }
      return prefix
    })
    .join(",")
}

export function permalinkPath(cells: readonly Cell[]): string {
  const layout = encodeLayout(cells, { includeVideo: true })
  return `/multiview/${encodeURIComponent(layout)}`
}

/** One big video with its chat beside it, for "open in multiview" links. */
export function singleVideoPath(video: MultiviewVideo): string {
  return `/multiview/${encodeURIComponent(`AAUY${encodeStream(video)},UAEYchat`)}`
}
