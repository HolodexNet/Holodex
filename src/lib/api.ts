import type { Autocomplete, Organization, SearchPage, SearchResponse, Video, VideoPage } from './types'

const root = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(public status: number, message: string, public retryAfter?: number) { super(message); this.name = 'ApiError' }
}
export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.body) headers.set('Content-Type', 'application/json')
  if (import.meta.env.VITE_API_KEY) headers.set('X-APIKEY', import.meta.env.VITE_API_KEY)
  const response = await fetch(`${root}${path}`, { ...options, headers })
  const raw = await response.text()
  let body: unknown = raw
  if (raw && response.headers.get('content-type')?.includes('json')) {
    try { body = JSON.parse(raw) } catch { throw new ApiError(response.status, 'The server returned an unreadable response.') }
  }
  if (!response.ok) {
    const message = typeof body === 'object' && body ? (body as { message?: string; error?: string }).message || (body as { error?: string }).error : typeof body === 'string' && !body.includes('<') ? body : undefined
    throw new ApiError(response.status, message || 'The server could not complete this request.', Number(response.headers.get('retry-after')) || undefined)
  }
  return body as T
}
export function normalizeVideo(video: Video, fallbackId?: string): Video {
  return { ...video, id: video.id || fallbackId || '', channel: video.channel || { id: '', name: 'Unknown channel' } }
}
export function normalizeSearch(response: SearchResponse): SearchPage {
  const hits = response.hits?.hits || []
  const total = response.hits?.total
  return {
    items: hits.map((hit) => normalizeVideo(hit._source, hit._id)),
    total: typeof total === 'number' ? total : total?.value || 0,
    approximate: typeof total === 'object' && total.relation !== 'eq',
    cursor: hits.at(-1)?.sort,
    took: response.took,
  }
}
export function queryString(values: Record<string, string | number | undefined>) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(values)) if (value !== undefined && value !== '') query.set(key, String(value))
  return query.toString()
}
export const api = {
  organizations: (signal?: AbortSignal) => request<Organization[]>('/statics/orgsV2.json', { signal }),
  live: async (org: string, cursor?: string, signal?: AbortSignal) => {
    const data = await request<VideoPage>(`/v3/live?${queryString({ org: org === 'All Vtubers' ? undefined : org, type: 'stream,placeholder', include: 'mentions,live_info', limit: 100, nextPage: cursor })}`, { signal })
    return { ...data, items: (data.items || []).map((v) => normalizeVideo(v)) }
  },
  videos: async (org: string, type: string, lang: string, cursor?: string, signal?: AbortSignal) => {
    const data = await request<VideoPage>(`/v3/videos?${queryString({ org: org === 'All Vtubers' ? undefined : org, type, lang, status: 'past', limit: 24, nextPage: cursor })}`, { signal })
    return { ...data, items: (data.items || []).map((v) => normalizeVideo(v)) }
  },
  search: async (q: Record<string, unknown>, sort: string, cursor?: unknown[], signal?: AbortSignal) => {
    const data = await request<SearchResponse>('/v3/search/videoSearch', { method: 'POST', body: JSON.stringify({ q, sort, offset: 0, limit: 24, ...(cursor ? { search_after: cursor } : {}) }), signal })
    if (data.timed_out) throw new ApiError(504, 'Search took too long. Try narrowing your filters.')
    return normalizeSearch(data)
  },
  autocomplete: (q: string, signal?: AbortSignal) => request<Autocomplete>(`/v3/search/autocomplete?${queryString({ q, n: 5 })}`, { signal }),
  video: async (id: string, signal?: AbortSignal) => normalizeVideo(await request<Video>(`/v3/videos/${encodeURIComponent(id)}`, { signal })),
}
export const media = {
  avatar: (id: string) => `${root}/statics/channelImg/${encodeURIComponent(id)}/100.png`,
  thumbnail: (video: Video) => video.thumbnail || (isYouTubeVideo(video) ? `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg` : undefined),
  calendar: (org: string) => `${root}/live.ics?${queryString({ org: org === 'All Vtubers' ? undefined : org, preferEnglishName: 1 })}`,
}
export function isYouTubeVideo(video: Video) {
  return video.type !== 'placeholder' && video.type !== 'legacy-placeholder' && (!video.platform || video.platform === 'youtube') && /^[\w-]{11}$/.test(video.id)
}
export function videoLink(video: Video): string | undefined {
  if (isYouTubeVideo(video)) return `https://www.youtube.com/watch?v=${video.id}`
  if (video.link) { try { const url = new URL(video.link); if (url.protocol === 'https:' || url.protocol === 'http:') return url.href } catch { /* No usable external URL. */ } }
}
