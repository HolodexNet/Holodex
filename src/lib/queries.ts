import {
  keepPreviousData,
  QueryClient,
  useInfiniteQuery,
  useQueries,
  useQuery,
} from "@tanstack/react-query"

import { api, ApiError, type VideoListQuery } from "@/lib/api"
import type { FavoriteChannel, StaticChannel, Video } from "@/lib/types"
import { useAuth } from "@/stores/auth"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      // Validation, permission and rate-limit failures will not fix themselves.
      retry: (failureCount, error) =>
        !(error instanceof ApiError && error.status >= 400 && error.status < 500) &&
        failureCount < 2,
    },
  },
})

/** The live route is cached for 120s server-side; polling faster is wasted. */
const LIVE_REFRESH = 2 * 60_000

export function useOrgs() {
  return useQuery({
    queryKey: ["orgs"],
    queryFn: ({ signal }) => api.orgs(signal),
    staleTime: 60 * 60_000,
    gcTime: Infinity,
  })
}

export function useTopics(enabled = true) {
  return useQuery({
    queryKey: ["topics"],
    queryFn: ({ signal }) => api.topics(signal),
    staleTime: 60 * 60_000,
    enabled,
  })
}

export function useOrgLive(org: string, enabled = true) {
  return useQuery({
    queryKey: ["live", "org", org],
    queryFn: ({ signal }) => api.live(org, signal),
    enabled,
    staleTime: LIVE_REFRESH,
    refetchInterval: LIVE_REFRESH,
    // Keep the previous cards on screen while a refresh is in flight.
    placeholderData: keepPreviousData,
  })
}

const EMPTY_FAVORITES: FavoriteChannel[] = []

export function useFavorites() {
  const userId = useAuth((s) => s.user?.id ?? null)
  const query = useQuery({
    queryKey: ["favorites", userId],
    queryFn: ({ signal }) => api.favorites(signal),
    enabled: userId !== null,
    staleTime: 5 * 60_000,
  })
  return { ...query, favorites: query.data ?? EMPTY_FAVORITES }
}

/** Live and upcoming streams of the logged-in user's favorites. */
export function useFavoritesLive(enabled = true) {
  const userId = useAuth((s) => s.user?.id ?? null)
  return useQuery({
    queryKey: ["live", "favorites", userId],
    queryFn: ({ signal }) => api.favoritesLive(signal),
    enabled: enabled && userId !== null,
    staleTime: LIVE_REFRESH,
    refetchInterval: LIVE_REFRESH,
    placeholderData: keepPreviousData,
  })
}

export const PAGE_SIZE = 24

interface VideoPage {
  items: Video[]
  next?: string
}

/**
 * Past videos for an organization (v3, cursor paginated) or, with
 * `favorites`, for the logged-in user's favorites (v2, offset paginated).
 */
export function useVideoFeed(
  query: Omit<VideoListQuery, "limit">,
  { favorites = false, enabled = true } = {}
) {
  const userId = useAuth((s) => s.user?.id ?? null)

  return useInfiniteQuery({
    queryKey: ["videos", favorites ? ["favorites", userId] : "org", query],
    enabled,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam, signal }): Promise<VideoPage> => {
      const full = { ...query, limit: PAGE_SIZE }
      if (favorites) {
        const offset = Number(pageParam ?? 0)
        const items = await api.favoritesVideos(full, offset, signal)
        return {
          items,
          next:
            items.length >= PAGE_SIZE ? String(offset + PAGE_SIZE) : undefined,
        }
      }
      const res = await api.videos(full, pageParam, signal)
      return { items: res.items ?? [], next: res.nextPage }
    },
    // A cursor is not a promise of more results: stop on an empty page, and
    // never follow a cursor we have already used.
    getNextPageParam: (last, _pages, lastParam) =>
      last.items.length > 0 && last.next && last.next !== lastParam
        ? last.next
        : undefined,
    staleTime: 3 * 60_000,
  })
}

/** Flattens pages and drops ids repeated across page boundaries. */
export function flattenPages(pages: { items: Video[] }[] | undefined): Video[] {
  if (!pages) return []
  const seen = new Set<string>()
  const out: Video[] = []
  for (const page of pages) {
    for (const video of page.items) {
      if (seen.has(video.id)) continue
      seen.add(video.id)
      out.push(video)
    }
  }
  return out
}

const channelInfoKey = (id: string) => ["channel-info", id] as const

/** Names for channel ids that only exist in a URL (search filters). */
export function useChannelInfos(ids: string[]) {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: channelInfoKey(id),
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        api.channelInfo(id, signal),
      staleTime: 60 * 60_000,
      retry: false,
    })),
    combine: (results) => {
      const map = new Map<string, StaticChannel>()
      results.forEach((result, i) => {
        if (result.data) map.set(ids[i], result.data)
      })
      return map
    },
  })
}

/** Remembers a channel we already know, so its chip never has to load. */
export function rememberChannel(channel: StaticChannel) {
  queryClient.setQueryData<StaticChannel>(
    channelInfoKey(channel.id),
    (old) => old ?? channel
  )
}
