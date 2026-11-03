/**
 * Domain model of the multiview. Everything under src/lib/multiview is free of
 * React and the DOM so the rules can be exercised directly by `node --test`.
 * See docs/multiview.md for how the layers fit together.
 */
import type { ChannelSummary, VideoStatus, WireDate } from "../types.ts"
import type { VideoSource } from "../video-source.ts"

export type CellId = string

/** A position on the square grid, in whole grid units. */
export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

/** Fractional grid coordinates, as produced by a pointer. */
export interface GridPoint {
  x: number
  y: number
}

export type PlayableSource = Exclude<VideoSource, { provider: "external" }>

export type MultiviewChannel = Pick<ChannelSummary, "name"> &
  Partial<Pick<ChannelSummary, "id" | "english_name" | "photo">>

/** The persisted subset of an API video, plus how to actually play it. */
export interface MultiviewVideo {
  /** A YouTube id, `tw:<login>` or `twvod:<id>`. Identifies the stream. */
  id: string
  source: PlayableSource
  channel: MultiviewChannel
  title?: string | null
  status?: VideoStatus
  topic_id?: string | null
  available_at?: WireDate | null
  start_scheduled?: WireDate | null
  start_actual?: WireDate | null
  duration?: number | null
  /** The catalog and oEmbed were both asked; do not look it up again. */
  noData?: boolean
}

/** Which video a chat cell serves. */
export type ChatTarget =
  /** Takes the first video no other chat serves, optionally preferring one. */
  | { kind: "auto"; prefer?: number }
  /** Follows whatever a video cell shows, swapping along with it. */
  | { kind: "cell"; cellId: CellId }
  /** A fixed stream, which does not need to be on the grid at all. */
  | { kind: "video"; video: MultiviewVideo }

/** At least one panel is always shown. */
export interface ChatPanels {
  chat: boolean
  tl: boolean
}

export interface VideoContent {
  type: "video"
  video: MultiviewVideo
  muted?: boolean
}

export interface ChatContent {
  type: "chat"
  target: ChatTarget
  panels: ChatPanels
}

/** The halves of the control panel. At least one is always shown. */
export interface ControlPanels {
  media: boolean
  sync: boolean
}

export type CellContent = VideoContent | ChatContent

export interface Cell {
  /** Owns the player's lifetime; survives every kind of repositioning. */
  id: CellId
  rect: Rect
  /** `null` is an empty cell, waiting to be given something to show. */
  content: CellContent | null
}

export type VideoCell = Cell & { content: VideoContent }
export type ChatCell = Cell & { content: ChatContent }

/** A layout with no identity yet: a preset, or a decoded permalink. */
export interface LayoutSlot {
  rect: Rect
  content: CellContent | null
}

export interface DecodedLayout {
  /** The source string; identifies a preset in the auto-layout table. */
  id: string
  slots: LayoutSlot[]
  /** Slots holding or waiting for a video, i.e. everything but chats. */
  videoCellCount: number
}

export interface NamedLayout extends DecodedLayout {
  name: string
  /** Designed for a tall screen, so previews draw it upright. */
  portrait?: boolean
}
