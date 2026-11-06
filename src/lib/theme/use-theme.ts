import { useEffect, useMemo, useSyncExternalStore } from "react"

import { useSettings, type Settings } from "@/stores/settings"
import { applyTheme, onSystemModeChange, systemMode } from "./apply"
import type { ThemeConfig } from "./overrides"
import type { ResolvedMode } from "./palette"

/** The mode actually in effect once "system" is resolved. */
export function useResolvedMode(): ResolvedMode {
  const themeMode = useSettings((s) => s.themeMode)
  const system = useSyncExternalStore(onSystemModeChange, systemMode)
  return themeMode === "system" ? system : themeMode
}

/** The theme-related part of the settings, as the theme engine takes it. */
export function themeConfig(settings: Settings): ThemeConfig {
  return {
    primary: settings.primaryColor,
    tuning: settings.themeTuning,
    groups: settings.themeGroupOverrides,
    overrides: settings.themeColorOverrides,
  }
}

export function useThemeConfig(): ThemeConfig {
  const primary = useSettings((s) => s.primaryColor)
  const tuning = useSettings((s) => s.themeTuning)
  const groups = useSettings((s) => s.themeGroupOverrides)
  const overrides = useSettings((s) => s.themeColorOverrides)
  return useMemo(
    () => ({ primary, tuning, groups, overrides }),
    [primary, tuning, groups, overrides]
  )
}

/** Keeps the document's theme in step with the viewer's settings. */
export function ThemeSync() {
  const theme = useThemeConfig()
  const mode = useResolvedMode()

  useEffect(() => {
    applyTheme(theme, mode)
  }, [theme, mode])

  return null
}
