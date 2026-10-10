export type WireDate = string | number
export interface Channel {
  id: string
  name: string
  english_name?: string | null
  photo?: string | null
  org?: string | null
  type?: string
}
export interface Video {
  id: string
  title?: string | null
  channel: Channel
  type: 'stream' | 'clip' | 'placeholder' | 'legacy-placeholder'
  status: 'new' | 'live' | 'upcoming' | 'past' | 'missing'
  platform?: string
  topic_id?: string | null
  lang?: string | null
  duration?: number | null
  live_viewers?: number | string | null
  start_scheduled?: WireDate | null
  start_actual?: WireDate | null
  available_at?: WireDate | null
  published_at?: WireDate | null
  link?: string | null
  thumbnail?: string | null
  mentions?: Channel[] | null
  description?: string | null
}
export interface VideoPage { items: Video[]; approximateTotal?: number; nextPage?: string }
export interface SearchResponse {
  took?: number
  timed_out?: boolean
  hits: { total?: number | { value: number; relation: string }; hits: { _source: Video; _id?: string; sort?: unknown[] }[] }
}
export interface SearchPage { items: Video[]; total: number; approximate: boolean; cursor?: unknown[]; took?: number }
export interface Organization { name: string; name_jp?: string | null; icon?: string | null }
export interface Autocomplete { vtuber?: Channel[]; topic?: { id: string }[] }
