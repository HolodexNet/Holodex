import { useSyncExternalStore } from "react"

function subscribe(listener: () => void) {
  document.addEventListener("fullscreenchange", listener)
  return () => document.removeEventListener("fullscreenchange", listener)
}

export function toggleFullscreen() {
  if (document.fullscreenElement) void document.exitFullscreen()
  else void document.documentElement.requestFullscreen()
}

export function useFullscreen() {
  const isFullscreen = useSyncExternalStore(
    subscribe,
    () => !!document.fullscreenElement
  )
  return { isFullscreen, toggleFullscreen }
}
