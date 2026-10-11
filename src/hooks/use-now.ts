import { useSyncExternalStore } from "react"

/**
 * Shared clocks. Every card that shows a relative time subscribes to the same
 * timer instead of starting its own.
 */
function createClock(intervalMs: number) {
  let now = Date.now()
  let timer: ReturnType<typeof setInterval> | undefined
  const listeners = new Set<() => void>()

  const tick = () => {
    now = Date.now()
    listeners.forEach((listener) => listener())
  }

  return {
    subscribe(listener: () => void) {
      listeners.add(listener)
      if (listeners.size === 1) {
        now = Date.now()
        timer = setInterval(tick, intervalMs)
      }
      return () => {
        listeners.delete(listener)
        if (listeners.size === 0) clearInterval(timer)
      }
    },
    getSnapshot: () => now,
  }
}

const seconds = createClock(1000)
const minutes = createClock(30_000)

/** Current time, refreshed every second. For running stream timers. */
export function useNowSeconds(): number {
  return useSyncExternalStore(seconds.subscribe, seconds.getSnapshot)
}

/** Current time, refreshed twice a minute. For "in 5 minutes" style labels. */
export function useNowMinutes(): number {
  return useSyncExternalStore(minutes.subscribe, minutes.getSnapshot)
}
