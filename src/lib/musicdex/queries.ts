import { queryOptions, useQuery } from "@tanstack/react-query"
import { ALL_VTUBERS } from "@/lib/consts"
import { musicApi } from "./api"
import type { MusicSearchParams } from "./types"

function musicDiscoveryOptions(scope: { org?: string; channelId?: string }) {
  return queryOptions({
    queryKey: [
      "musicdex",
      "discovery",
      scope.channelId ? "channel" : "org",
      scope.channelId ?? scope.org,
    ],
    queryFn: ({ signal }) =>
      scope.channelId
        ? musicApi.discoveryChannel(scope.channelId, signal)
        : musicApi.discoveryOrg(scope.org!, signal),
    enabled: !!(scope.org || scope.channelId),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  })
}
function musicTrendingOptions(
  params: { org?: string; channel_id?: string },
  enabled = true
) {
  return queryOptions({
    queryKey: ["musicdex", "trending", params],
    queryFn: ({ signal }) => musicApi.trending(params, signal),
    enabled,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  })
}

// Navigation and rendering share keys so early requests are reused on mount.
export function musicHomeQueryOptions(org: string) {
  return {
    discovery: musicDiscoveryOptions({
      org: org === ALL_VTUBERS ? "All_Vtubers" : org,
    }),
    trending: musicTrendingOptions(org === ALL_VTUBERS ? {} : { org }),
  }
}

export function useMusicDiscovery(scope: { org?: string; channelId?: string }) {
  return useQuery(musicDiscoveryOptions(scope))
}

export function useMusicTrending(
  params: { org?: string; channel_id?: string },
  enabled = true
) {
  return useQuery(musicTrendingOptions(params, enabled))
}
export function useMusicSearch(params: MusicSearchParams) {
  return useQuery({
    queryKey: ["musicdex", "search", params],
    queryFn: ({ signal }) => musicApi.search(params, signal),
    staleTime: 60_000,
    // Keep the last results on screen while the next search loads.
    placeholderData: (previous) => previous,
  })
}
