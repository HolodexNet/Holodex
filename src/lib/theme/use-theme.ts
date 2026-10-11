import { useEffect, useSyncExternalStore } from "react"

import { useSettings } from "@/stores/settings"
import { applyTheme, onSystemModeChange, systemMode } from "./apply"
import type { ResolvedMode } from "./palette"

/** The mode actually in effect once "system" is resolved. */
export function useResolvedMode(): ResolvedMode {
  const themeMode = useSettings((s) => s.themeMode)
  const system = useSyncExternalStore(onSystemModeChange, systemMode)
  return themeMode === "system" ? system : themeMode
}

/** Keeps the document's theme in step with the viewer's settings. */
export function ThemeSync() {
  const primary = useSettings((s) => s.primaryColor)
  const mode = useResolvedMode()

  useEffect(() => {
    applyTheme(primary, mode)
  }, [primary, mode])

  return null
}
