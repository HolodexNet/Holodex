import { ApiError } from "@/lib/api"
import { apiRequestBudget } from "@/lib/api-rate-limit"
import { getJwt } from "@/stores/auth"
import type { SongPayload } from "@/lib/video-edit/songs"
import type {
  MusicDiscovery,
  MusicSearchParams,
  MusicSearchResult,
  PaginatedSongs,
  Playlist,
  PlaylistSavedRow,
  PlaylistStub,
  Song,
  WritablePlaylist,
} from "./types"

type Query = Record<string, string | number | boolean | undefined>
async function request<T>(
  path: string,
  options: {
    method?: string
    body?: unknown
    ndjson?: string
    query?: Query
    auth?: boolean | "required"
    signal?: AbortSignal
  } = {}
): Promise<T> {
  const { method = "GET", body, ndjson, query, auth, signal } = options
  const jwt = auth ? getJwt() : null
  if (auth === "required" && !jwt) throw new ApiError(401, "Not logged in")
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query ?? {}))
    if (value !== undefined) params.set(key, String(value))
  await apiRequestBudget.acquire(signal)
  const response = await fetch(
    `/api/v2${path}${params.size ? `?${params}` : ""}`,
    {
      method,
      signal,
      headers: {
        ...(ndjson !== undefined
          ? { "Content-Type": "application/x-ndjson" }
          : body !== undefined
            ? { "Content-Type": "application/json" }
            : {}),
        ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      },
      body: ndjson ?? (body === undefined ? undefined : JSON.stringify(body)),
    }
  )
  apiRequestBudget.observe(response.headers, response.status)
  const text = await response.text()
  let data: unknown = text
  if (
    ndjson !== undefined ||
    response.headers.get("content-type")?.includes("json")
  ) {
    try {
      data = JSON.parse(text)
    } catch {
      /* preserve response for errors */
    }
  }
  if (!response.ok) {
    const message =
      data && typeof data === "object"
        ? ((data as { message?: string; error?: string }).message ??
          (data as { error?: string }).error)
        : typeof data === "string" && data.length < 200
          ? data
          : undefined
    throw new ApiError(
      response.status,
      message || response.statusText,
      Number(response.headers.get("Retry-After")) || undefined
    )
  }
  return data as T
}
const id = encodeURIComponent
export const musicApi = {
  song: (songId: string, signal?: AbortSignal) =>
    request<Song>(`/songs/${id(songId)}`, { signal }),
  trending: (
    params: { org?: string; channel_id?: string } = {},
    signal?: AbortSignal
  ) => request<Song[]>("/songs/hot", { query: params, signal }),
  latest: (
    params: {
      org?: string
      channel_id?: string
      video_id?: string
      offset?: number
      limit?: number
      paginated?: boolean
    },
    signal?: AbortSignal
  ) =>
    request<{ total: number; items: Song[] }>("/songs/latest", {
      method: "POST",
      body: params,
      signal,
    }),
  /** Every song of one video. A POST, so nothing between here and the database caches it. */
  videoSongs: async (
    channelId: string,
    videoId: string,
    signal?: AbortSignal
  ) =>
    (
      await request<{ total: number | string; items: Song[] }>(
        "/songs/latest",
        {
          method: "POST",
          body: {
            channel_id: channelId,
            video_id: videoId,
            limit: 200,
            paginated: true,
          },
          signal,
        }
      )
    ).items ?? [],
  /** Resolves to how many rows changed: 0 means the song isn't the caller's to change. */
  saveSong: (song: SongPayload, signal?: AbortSignal) =>
    request<number>("/songs", {
      method: "PUT",
      body: song,
      auth: "required",
      signal,
    }),
  deleteSong: (
    target: { id: string; video_id: string },
    signal?: AbortSignal
  ) =>
    request<number>("/songs", {
      method: "DELETE",
      body: target,
      auth: "required",
      signal,
    }),
  /** Songs like a free-text query, for finding the track someone means. */
  findSongs: async (query: string, signal?: AbortSignal) => {
    const body = {
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query,
                fields: [
                  "general^3",
                  "general.romaji^0.5",
                  "original_artist^2",
                  "original_artist.romaji^0.5",
                ],
                type: "most_fields",
              },
            },
            {
              multi_match: {
                query,
                fields: ["name.ngram", "name"],
                type: "most_fields",
              },
            },
          ],
        },
      },
      size: 12,
      from: 0,
      sort: [{ _score: { order: "desc" } }],
    }
    const response = await request<{
      responses?: { hits?: { hits?: { _source: Song }[] } }[]
    }>("/musicdex/elasticsearch/search", {
      method: "POST",
      ndjson: `{}\n${JSON.stringify(body)}\n`,
      signal,
    })
    return response.responses?.[0]?.hits?.hits?.map((hit) => hit._source) ?? []
  },
  search: async (
    params: MusicSearchParams,
    signal?: AbortSignal
  ): Promise<MusicSearchResult> => {
    const must: unknown[] = []
    const filter: unknown[] = []
    const match = (
      value: string | undefined,
      fields: string[],
      type = "most_fields"
    ) => {
      if (value?.trim())
        must.push({ multi_match: { query: value.trim(), fields, type } })
    }
    match(params.q === "*" ? "" : params.q, [
      "general^2",
      "general.ngram",
      "general.romaji",
    ])
    match(params.song, ["name.ngram^2", "name^2", "name.romaji"], "phrase")
    match(
      params.artist,
      [
        "original_artist.ngram^2",
        "original_artist^2",
        "original_artist.romaji",
      ],
      "phrase"
    )
    const org = params.org?.trim()
    const channelIds = params.channelId?.split("\n").filter(Boolean) ?? []
    const suborgs = params.suborg?.split("\n").filter(Boolean) ?? []
    if (channelIds.length) filter.push({ terms: { channel_id: channelIds } })
    if (params.type) filter.push({ term: { is_mv: params.type === "mv" } })
    if (params.from || params.to)
      filter.push({
        range: {
          available_at: {
            ...(params.from ? { gte: params.from } : {}),
            ...(params.to ? { lte: `${params.to}||/d` } : {}),
          },
        },
      })
    const must_not = params.blockedIds?.length
      ? [{ terms: { channel_id: params.blockedIds } }]
      : []
    const sort =
      params.sort === "latest"
        ? [{ available_at: { order: "desc" } }]
        : params.sort === "oldest"
          ? [{ available_at: { order: "asc" } }]
          : [{ _score: { order: "desc" } }]
    const query = {
      query: { bool: { must, filter, must_not } },
      from: (params.page - 1) * params.per_page,
      size: Math.min(
        params.per_page,
        5000 - (params.page - 1) * params.per_page
      ),
      sort,
      track_total_hits: true,
      // Org and suborg narrow the hits but not the aggregations, so the
      // organization list stays complete while one is selected.
      ...(org || suborgs.length
        ? {
            post_filter: {
              bool: {
                filter: [
                  ...(org ? [{ term: { org } }] : []),
                  ...(suborgs.length ? [{ terms: { suborg: suborgs } }] : []),
                ],
              },
            },
          }
        : {}),
      aggs: {
        orgs: { terms: { field: "org", size: 50 } },
        suborgs: {
          filter: org ? { term: { org } } : { match_all: {} },
          aggs: { values: { terms: { field: "suborg", size: 100 } } },
        },
      },
    }
    type Buckets = { buckets: { key: string; doc_count: number }[] }
    const response = await request<{
      responses: {
        error?: { reason?: string }
        aggregations?: { orgs?: Buckets; suborgs?: { values?: Buckets } }
        hits?: { total: number | { value: number }; hits: { _source: Song }[] }
      }[]
    }>("/musicdex/elasticsearch/search", {
      method: "POST",
      ndjson: `{}\n${JSON.stringify(query)}\n`,
      signal,
    })
    const result = response.responses?.[0]
    if (!result?.hits)
      throw new Error(result?.error?.reason || "Music search failed")
    return {
      found:
        typeof result.hits.total === "number"
          ? result.hits.total
          : result.hits.total.value,
      page: params.page,
      orgs:
        result.aggregations?.orgs?.buckets.map((bucket) => ({
          name: bucket.key,
          count: bucket.doc_count,
        })) ?? [],
      suborgs:
        result.aggregations?.suborgs?.values?.buckets.map(
          (bucket) => bucket.key
        ) ?? [],
      hits: result.hits.hits.map((hit) => ({ document: hit._source })),
    }
  },
  discoveryOrg: (org: string, signal?: AbortSignal) =>
    request<MusicDiscovery>(`/musicdex/discovery/org/${id(org)}/`, { signal }),
  discoveryChannel: (channelId: string, signal?: AbortSignal) =>
    request<MusicDiscovery>(`/musicdex/discovery/channel/${id(channelId)}/`, {
      signal,
    }),
  discoveryPlaylists: (
    scope: string,
    type: string,
    offset = 0,
    signal?: AbortSignal
  ) =>
    request<{ items: PlaylistStub[]; total: number }>(
      `/musicdex/discovery/org/${id(scope)}/playlists`,
      { query: { type, offset }, signal }
    ),
  playlist: (playlistId: string, signal?: AbortSignal) =>
    request<Playlist>(`/musicdex/playlist/${id(playlistId)}`, {
      auth: true,
      signal,
    }),
  radio: (radioId: string, signal?: AbortSignal) =>
    request<Playlist>(`/musicdex/radio/${id(radioId)}`, { auth: true, signal }),
  myPlaylists: (signal?: AbortSignal) =>
    request<PlaylistStub[]>("/musicdex/playlist/", {
      auth: "required",
      signal,
    }),
  starredPlaylists: (signal?: AbortSignal) =>
    request<PlaylistStub[]>("/musicdex/star/", { auth: "required", signal }),
  writePlaylist: (playlist: Partial<WritablePlaylist>) =>
    request<PlaylistSavedRow[]>("/musicdex/playlist", {
      method: "POST",
      body: playlist,
      auth: "required",
    }),
  deletePlaylist: (playlistId: string) =>
    request<unknown>(`/musicdex/playlist/${id(playlistId)}`, {
      method: "DELETE",
      auth: "required",
    }),
  updatePlaylistSong: (
    playlistId: string,
    songId: string | number,
    action: "add" | "delete"
  ) =>
    request<unknown>(
      `/musicdex/playlist/${id(playlistId)}/${id(String(songId))}`,
      { method: action === "add" ? "GET" : "DELETE", auth: "required" }
    ),
  starPlaylist: (playlistId: string, starred: boolean) =>
    request<unknown>("/musicdex/star/", {
      method: starred ? "POST" : "DELETE",
      body: { playlist_id: playlistId },
      auth: "required",
    }),
  likedSongs: (page = 1, signal?: AbortSignal) =>
    request<PaginatedSongs>("/musicdex/like", {
      query: { page },
      auth: "required",
      signal,
    }),
  likeSong: (songId: string, liked: boolean) =>
    request<unknown>("/musicdex/like", {
      method: liked ? "POST" : "DELETE",
      body: { song_id: songId },
      auth: "required",
    }),
  checkLikes: (ids: string[], signal?: AbortSignal) =>
    request<boolean[]>("/musicdex/like/check", {
      query: { song_id: ids.join(",") },
      auth: "required",
      signal,
    }),
  trackSong: (songId: string) =>
    request<unknown>(`/musicdex/history/${id(songId)}`, { auth: true }),
}
