import { useSyncExternalStore } from "react"

const MOBILE_BREAKPOINT = 768
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

function subscribe(listener: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener("change", listener)
  return () => mql.removeEventListener("change", listener)
}

/** True below the `md` breakpoint, where the sidebar becomes a drawer. */
export function useIsMobile() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches)
}
