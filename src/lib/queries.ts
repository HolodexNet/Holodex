import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { api } from './api'
import { usePreferences } from './preferences'
export function useOrganizations() { return useQuery({ queryKey: ['organizations'], queryFn: ({ signal }) => api.organizations(signal), staleTime: 3600000 }) }
export function useLive(enabled = true) {
  const { preferences } = usePreferences()
  return useInfiniteQuery({
    queryKey: ['live', preferences.organization], initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) => api.live(preferences.organization, pageParam, signal),
    getNextPageParam: (last, pages, cursor) => last.items.length && last.nextPage && last.nextPage !== cursor && !pages.slice(0, -1).some((p) => p.nextPage === last.nextPage) ? last.nextPage : undefined,
    staleTime: 120000, refetchInterval: 120000, enabled,
  })
}
