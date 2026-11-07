import { useMemo } from "react"
import { useQueries } from "@tanstack/react-query"

import { api, ApiError } from "@/lib/api"
import {
  parseSource,
  resolveSource,
  type ResolvedSource,
} from "@/lib/tlclient/session"

export interface SourceState {
  source: ResolvedSource
  /** Still asking the catalog whether it knows this stream. */
  pending: boolean
  /** The catalog could not be asked; which room to post to is not known. */
  error: Error | null
}

/**
 * Looks each entered stream up in the catalog. A stream it knows posts to its
 * own room; anything else goes to a custom room named by what was entered,
 * exactly as the previous client did, so existing custom rooms keep working.
 */
export function useSources(raws: string[], refresh: boolean) {
  const key = raws.join("\n")
  // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by content
  const parsed = useMemo(() => raws.map(parseSource), [key])

  const results = useQueries({
    queries: parsed.map((source) => ({
      queryKey: ["tlclient-source", source.lookupId],
      queryFn: async ({ signal }: { signal: AbortSignal }) => {
        try {
          return await api.video(source.lookupId!, signal)
        } catch (error) {
          if (
            error instanceof ApiError &&
            (error.status === 404 || error.status === 400)
          )
            return null
          throw error
        }
      },
      enabled: !!source.lookupId,
      staleTime: 30_000,
      // Status and start time drive the room and the clock; keep them fresh.
      refetchInterval: refresh ? 60_000 : (false as const),
      retry: 1,
    })),
  })

  // Rebuilt only when a lookup actually changed, so consumers can memoize.
  const version = results
    .map((r) => `${r.status}:${r.dataUpdatedAt}:${r.errorUpdatedAt}`)
    .join(",")
  const sources = useMemo<SourceState[]>(
    () =>
      results.map((result, index) => ({
        source: resolveSource(parsed[index], result.data ?? null),
        pending: !!parsed[index].lookupId && result.isPending,
        error: result.data === undefined ? result.error : null,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see `version`
    [parsed, version]
  )
  const refetch = () => {
    for (const result of results) void result.refetch()
  }
  return { sources, refetch }
}
