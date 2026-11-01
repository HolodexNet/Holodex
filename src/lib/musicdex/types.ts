import type { Video } from "@/lib/types"

export interface Song {
  id: string
  video_id: string
  channel_id: string
  name: string
  start: number
  end: number
  is_mv?: boolean | null
  channel?: {
    name: string
    english_name?: string | null
    photo?: string | null
  }
  art?: string | null
  original_artist?: string | null
  available_at?: string | null
  itunesid?: string | number | null
  amUrl?: string | null
  creator_id?: string | number
  approver_id?: string | number
  status?: string | null
  liked?: boolean
  channel_org?: string
  channel_suborg?: string
}

export interface PlaylistStub {
  id: string
  title: string
  type: string
  owner?: string | number
  listed: boolean
  created_at?: string
  updated_at: string
  art_context?: { channels?: string[]; videos?: string[] }
}
export interface Playlist extends PlaylistStub {
  description?: string | null
  content?: Song[]
}
export type PlaylistFull = Playlist
export interface PlaylistSavedRow extends Omit<Playlist, "content"> {
  content: string[]
}
export interface WritablePlaylist {
  id?: string
  updated_at?: string
  title: string
  description?: string
  type: string
  owner: string | number
  listed: boolean
  content?: string[]
}
export interface PaginatedSongs {
  content: Song[]
  page_count: number
}
export interface MusicDiscovery {
  version: number
  recommended?: { playlists: Playlist[] }
  recentSingingStreams?: { video: Video; playlist?: Playlist }[]
  channels?: {
    id: string
    name: string
    english_name?: string
    song_count: number
  }[]
}
export interface MusicSearchParams {
  q: string
  song?: string
  artist?: string
  channelId?: string
  org?: string
  suborg?: string
  type?: string
  sort?: string
  from?: string
  to?: string
  blockedIds?: string[]
  page: number
  per_page: number
}
export interface MusicSearchResult {
  found: number
  page: number
  orgs?: { name: string; count: number }[]
  suborgs?: string[]
  hits?: { document: Song }[]
}
