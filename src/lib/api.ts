import { ALL_VTUBERS } from "@/lib/consts"
import type {
  AutocompleteResult,
  FavoriteChannel,
  Org,
  StaticChannel,
  User,
  V3VideoList,
  Video,
} from "@/lib/types"
import { getJwt, useAuth } from "@/stores/auth"

/**
 * Holodex API client. v3 routes are used wherever they exist (live, video
 * lists, search, autocomplete); account-scoped routes are v2 only.
 * Contracts: dev-docs-handoff/.
 */

const API = "/api"

export class ApiError extends Error {
  status: number
  /** Seconds to wait before retrying, when the server said so (429). */
  retryAfter?: number

  constructor(status: number, message: string, retryAfter?: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.retryAfter = retryAfter
  }
}

type Query = Record<string, string | number | boolean | undefined | null>

function toQuery(query?: Query): string {
  if (!query) return ""
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue
    params.set(key, String(value))
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ""
}

interface RequestOptions {
  method?: string
  query?: Query
  body?: unknown
  /** Attach the login token. "required" rejects locally when logged out. */
  auth?: boolean | "required"
  signal?: AbortSignal
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", query, body, auth, signal } = options
  const headers: Record<string, string> = {}
  if (body !== undefined) headers["Content-Type"] = "application/json"

  if (auth) {
    const jwt = getJwt()
    if (jwt) headers.Authorization = `Bearer ${jwt}`
    else if (auth === "required") throw new ApiError(401, "Not logged in")
  }

  const res = await fetch(`${path}${toQuery(query)}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  })

  // Responses are not uniformly JSON (plain-text errors, HTML fallbacks).
  const text = await res.text()
  let data: unknown = text
  if (res.headers.get("content-type")?.includes("json")) {
    try {
      data = JSON.parse(text)
    } catch {
      // keep the raw text
    }
  }

  if (!res.ok) {
    // An expired or revoked token: drop the session so the UI can react.
    if (res.status === 401 && auth && getJwt()) useAuth.getState().logout()
    const detail =
      data && typeof data === "object"
        ? ((data as { message?: string; error?: string }).message ??
          (data as { error?: string }).error)
        : typeof data === "string" && data.length < 200
          ? data
          : undefined
    const retryAfter = Number(res.headers.get("Retry-After")) || undefined
    throw new ApiError(res.status, detail || res.statusText, retryAfter)
  }

  return data as T
}

/**
 * A stream that never started stays "upcoming"/"live" in the index. Hide
 * those once they are two hours past their scheduled start.
 */
function isStale(video: Video): boolean {
  if (video.start_actual || !video.start_scheduled) return false
  return (
    Date.now() - new Date(video.start_scheduled).getTime() > 2 * 60 * 60 * 1000
  )
}

function byStartTime(a: Video, b: Video): number {
  const diff =
    new Date(a.available_at ?? 0).getTime() -
    new Date(b.available_at ?? 0).getTime()
  return diff || a.id.localeCompare(b.id)
}

function normalizeLive(videos: Video[]): Video[] {
  return videos.filter((v) => !isStale(v)).sort(byStartTime)
}

/** v3 has no "All Vtubers" pseudo-org; the filter is simply omitted. */
const orgParam = (org: string) => (org === ALL_VTUBERS ? undefined : org)

export interface VideoListQuery {
  org?: string
  type: string
  status: string
  include?: string
  lang?: string
  /** ISO date; only videos available before it. */
  to?: string
  /** Drops videos scheduled further ahead than this many hours. */
  max_upcoming_hours?: number
  limit: number
}

export type SearchSort =
  "latest" | "oldest" | "score" | "longest" | "shortest" | "views"

export interface VideoSearchQuery {
  search?: string
  org?: string[]
  vtuber?: string[]
  topic?: string[]
  type?: string[]
  lang?: string[]
  from?: string
  to?: string
  has_song?: "none" | "one" | "many"
}

interface EsHit {
  _source: Video
  sort?: unknown[]
}

interface EsResponse {
  hits: { total?: { value: number; relation?: string }; hits: EsHit[] }
}

export interface SearchPage {
  total: number
  /** False when the total is a lower bound. */
  totalExact: boolean
  items: Video[]
}

export interface CommentSearchPage {
  total: number
  items: Video[]
}

export const api = {
  // -- Public metadata (static routes, not rate limited) --------------------
  orgs: (signal?: AbortSignal) =>
    request<Org[]>("/statics/orgsV2.json", { signal }),

  topics: (signal?: AbortSignal) =>
    request<{ id: string }[]>("/statics/topics.json", { signal }),

  channelInfo: (id: string, signal?: AbortSignal) =>
    request<StaticChannel>(`/statics/channel/${encodeURIComponent(id)}.json`, {
      signal,
    }),

  // -- Schedules and lists ---------------------------------------------------
  async live(org: string, signal?: AbortSignal): Promise<Video[]> {
    const res = await request<V3VideoList>(`${API}/v3/live`, {
      query: {
        org: orgParam(org),
        type: "placeholder,stream",
        include: "mentions",
      },
      signal,
    })
    return normalizeLive(res.items ?? [])
  },

  videos: (query: VideoListQuery, cursor?: string, signal?: AbortSignal) =>
    request<V3VideoList>(`${API}/v3/videos`, {
      query: {
        ...query,
        org: query.org ? orgParam(query.org) : undefined,
        nextPage: cursor,
      },
      signal,
    }),

  // -- Search ----------------------------------------------------------------
  autocomplete: (q: string, signal?: AbortSignal) =>
    request<AutocompleteResult>(`${API}/v3/search/autocomplete`, {
      query: { q, n: 6 },
      signal,
    }),

  autocompleteChannels: async (q: string, signal?: AbortSignal) => {
    const res = await request<AutocompleteResult>(
      `${API}/v3/search/autocomplete`,
      { query: { q, n: 8, t: "any_channel" }, signal }
    )
    return res.any_channel ?? []
  },

  async searchVideos(
    q: VideoSearchQuery,
    sort: SearchSort,
    offset: number,
    limit: number,
    signal?: AbortSignal
  ): Promise<SearchPage> {
    const res = await request<EsResponse>(`${API}/v3/search/videoSearch`, {
      method: "POST",
      body: { q: { search: "", ...q }, sort, offset, limit },
      signal,
    })
    return {
      total: res.hits?.total?.value ?? 0,
      totalExact: res.hits?.total?.relation !== "gte",
      items: (res.hits?.hits ?? []).map((hit) => hit._source),
    }
  },

  /** Timestamp-comment search has no v3 equivalent yet. */
  async searchComments(
    params: {
      comment: string
      sort: "newest" | "oldest" | "longest"
      lang: string[]
      target: string[]
      vch: string[]
      org: string[]
      topic: string[]
    },
    offset: number,
    limit: number,
    signal?: AbortSignal
  ): Promise<CommentSearchPage> {
    const res = await request<{ total: number | string; items: Video[] }>(
      `${API}/v2/search/commentSearch`,
      {
        method: "POST",
        body: {
          ...params,
          comment: [params.comment],
          conditions: [],
          paginated: true,
          offset,
          limit,
        },
        auth: true,
        signal,
      }
    )
    return { total: Number(res.total) || 0, items: res.items ?? [] }
  },

  // -- Account ---------------------------------------------------------------
  login: (service: "google" | "discord" | "twitter", token: string) =>
    request<{ user: User; jwt: string }>(`${API}/v2/user/login`, {
      method: "POST",
      body: { service, token },
      auth: true,
    }),

  refreshSession: (signal?: AbortSignal) =>
    request<{ user: User; jwt: string }>(`${API}/v2/user/refresh`, {
      auth: "required",
      signal,
    }),

  favorites: (signal?: AbortSignal) =>
    request<FavoriteChannel[]>(`${API}/v2/users/favorites`, {
      auth: "required",
      signal,
    }),

  async favoritesLive(signal?: AbortSignal): Promise<Video[]> {
    const res = await request<Video[]>(`${API}/v2/users/live`, {
      query: { includePlaceholder: true },
      auth: "required",
      signal,
    })
    return normalizeLive(Array.isArray(res) ? res : [])
  },

  /** Offset-paginated: the favorites feed only exists on v2. */
  async favoritesVideos(
    query: VideoListQuery,
    offset: number,
    signal?: AbortSignal
  ): Promise<Video[]> {
    const res = await request<Video[] | { items: Video[] }>(
      `${API}/v2/users/videos`,
      { query: { ...query, offset }, auth: "required", signal }
    )
    return Array.isArray(res) ? res : (res.items ?? [])
  },
}
