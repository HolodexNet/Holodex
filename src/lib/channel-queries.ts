import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { queryClient } from "@/lib/queries"

export type ChannelTab = "videos" | "clips" | "collabs"

export function useChannels(org: string, sort: string, type = "vtuber") {
  return useInfiniteQuery({
    queryKey: ["channels", org, sort, type],
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      api.channels(
        {
          org,
          sort,
          type,
          order: sort === "suborg" ? "asc" : "desc",
          limit: 48,
          offset: pageParam,
        },
        signal
      ),
    getNextPageParam: (last, _pages, offset) =>
      last.length === 48 ? offset + last.length : undefined,
    staleTime: 3 * 60_000,
  })
}

export function useChannel(id: string) {
  return useQuery({
    queryKey: ["channel", id],
    queryFn: ({ signal }) => api.channel(id, signal),
    enabled: !!id,
    staleTime: 20 * 60_000,
  })
}

export function useChannelVideos(id: string, tab: ChannelTab) {
  return useInfiniteQuery({
    queryKey: ["channel-videos", id, tab],
    initialPageParam: 0,
    enabled: !!id,
    queryFn: ({ pageParam, signal }) =>
      api.channelVideos(id, tab, pageParam, signal),
    getNextPageParam: (last, _pages, offset) =>
      last.length === 24 ? offset + last.length : undefined,
    staleTime: 3 * 60_000,
  })
}

export function useFavoriteMutation() {
  return useMutation({
    mutationFn: ({ id, favorite }: { id: string; favorite: boolean }) =>
      api.setFavorite(id, favorite),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["favorites"] }),
        queryClient.invalidateQueries({ queryKey: ["live", "favorites"] }),
        queryClient.invalidateQueries({
          queryKey: ["videos"],
          predicate: (query) =>
            Array.isArray(query.queryKey[1]) &&
            query.queryKey[1][0] === "favorites",
        }),
      ])
    },
  })
}
