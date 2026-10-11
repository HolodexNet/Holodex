/**
 * Wire types for the Holodex API. The backend is permissive about what it
 * omits, so almost everything beyond the identifiers is optional.
 * See dev-docs-handoff/conventions.md.
 */

export type WireDate = string | number

export type ChannelType = "vtuber" | "subber" | "external"
export type VideoType = "stream" | "clip" | "placeholder" | "legacy-placeholder"
export type VideoStatus = "new" | "live" | "upcoming" | "past" | "missing"

export interface ChannelSummary {
  id: string
  name: string
  english_name?: string | null
  type?: ChannelType
  org?: string | null
  suborg?: string | null
  group?: string | null
  photo?: string | null
}

export interface FavoriteChannel extends ChannelSummary {
  twitter?: string | null
  inactive?: boolean | null
  subscriber_count?: number | string | null
  video_count?: number | string | null
  clip_count?: number | string | null
}

export interface VideoRef {
  id: string
  title?: string
  type?: VideoType
  status?: VideoStatus
  lang?: string | null
  available_at?: WireDate
  channel?: Partial<ChannelSummary>
}

export interface VideoComment {
  comment_key: string
  message: string
}

export interface Video {
  id: string
  title?: string | null
  type: VideoType
  status: VideoStatus
  channel: ChannelSummary
  channel_id?: string
  topic_id?: string | null
  lang?: string | null
  available_at?: WireDate | null
  published_at?: WireDate | null
  duration?: number | null
  songcount?: number | null
  start_scheduled?: WireDate | null
  start_actual?: WireDate | null
  end_actual?: WireDate | null
  live_viewers?: number | null
  recent_live_tls?: string[] | null
  live_tl_count?: Record<string, number> | null
  mentions?: ChannelSummary[] | null
  clips?: VideoRef[] | number | null
  sources?: VideoRef[] | null
  description?: string | null
  comments?: VideoComment[] | null

  // Placeholder-only fields
  jp_name?: string | null
  link?: string | null
  thumbnail?: string | null
  certainty?: "certain" | "likely" | null
  placeholderType?: "scheduled-yt-stream" | "external-stream" | "event" | null
}

export interface Org {
  name: string
  short?: string | null
  name_jp?: string | null
  /** Channel id whose avatar stands in for the organization. */
  icon?: string | null
}

export interface User {
  id: string | number
  username: string
  role: "user" | "editor" | "admin"
  api_key?: string | null
  contribution_count?: number | string
  google_id?: string | null
  discord_id?: string | null
  twitter_id?: string | null
}

export interface V3VideoList {
  approximateTotal?: number
  items: Video[]
  nextPage?: string
}

export interface AutocompleteChannel {
  id: string
  name: string
  english_name?: string | null
  org?: string | null
  type?: ChannelType
  inactive?: boolean
}

export interface AutocompleteResult {
  vtuber?: AutocompleteChannel[]
  any_channel?: AutocompleteChannel[]
  topic?: { id: string }[]
}

export interface StaticChannel {
  id: string
  name: string
  english_name?: string | null
  org?: string | null
  suborg?: string | null
  twitter?: string | null
  twitch?: string | null
}
