import { useEffect, useMemo, useSyncExternalStore } from "react"
import { useSearchParams } from "react-router"

import { parseOffsets, resolveOffsets } from "@/lib/multiview/sync"
import { useMultiview } from "@/stores/multiview"
import {
  archiveClock,
  currentTimeline,
  setArchiveLink,
} from "@/stores/multiview-sync"

/**
 * The shared timeline every archive on the grid follows. Any number of controls
 * can use this at once: they all show the one clock, which runs while any are up.
 */
export function useArchiveSync() {
  const [params] = useSearchParams()
  const cells = useMultiview((s) => s.cells)
  const localOffsets = useMultiview((s) => s.syncOffsets)
  const linkedOffsets = params.get("offsets")
  const linkedTime = params.get("t")
  const timeline = currentTimeline(cells)
  const offsets = useMemo(
    () => resolveOffsets(timeline, localOffsets, parseOffsets(linkedOffsets)),
    [timeline, localOffsets, linkedOffsets]
  )

  useEffect(() => {
    setArchiveLink(
      linkedTime ? Number(linkedTime) : undefined,
      parseOffsets(linkedOffsets)
    )
  }, [linkedTime, linkedOffsets])
  useEffect(() => archiveClock.acquire(), [])

  const { paused, rate, currentTs } = useSyncExternalStore(
    archiveClock.subscribe,
    archiveClock.getSnapshot
  )

  return {
    timeline,
    offsets,
    paused,
    rate,
    currentTs,
    seek: archiveClock.seek,
    setPaused: archiveClock.setPaused,
    setRate: archiveClock.setRate,
  }
}
