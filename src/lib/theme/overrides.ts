import {
  hexToOklch,
  isHexColor,
  normalizeHex,
  oklchCss,
  oklchToHex,
  wrapHue,
  type Oklch,
} from "./color.ts"
import {
  derivePalette,
  normalizeTuning,
  type ResolvedMode,
  type ThemeColor,
  type ThemeColorOverrides,
  type ThemeOverrides,
  type ThemePalette,
  type ThemeTuning,
} from "./palette.ts"

/** Overrides are hex colours, optionally including an alpha byte. */
export function isThemeColor(value: string): boolean {
  return isHexColor(value) || /^#[0-9a-f]{8}$/i.test(value.trim())
}

export function normalizeThemeColor(value: string): string {
  const color = value.trim().toLowerCase()
  return /^#[0-9a-f]{8}$/.test(color) ? color : normalizeHex(color)
}

interface ParsedColor {
  color: Oklch
  /** 0..1 */
  alpha: number
}

const OKLCH_RE = /^oklch\(([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+)%)?\)$/

/** Reads one of our tokens: a generated `oklch()` value or a stored hex. */
function parseThemeColor(value: string): ParsedColor {
  if (isThemeColor(value)) {
    const hex = normalizeThemeColor(value)
    return {
      color: hexToOklch(hex.slice(0, 7)),
      alpha: hex.length === 9 ? parseInt(hex.slice(7), 16) / 255 : 1,
    }
  }
  const match = OKLCH_RE.exec(value)
  if (!match) throw new Error(`Unsupported theme color: ${value}`)
  return {
    color: { l: Number(match[1]), c: Number(match[2]), h: Number(match[3]) },
    alpha: match[4] === undefined ? 1 : Number(match[4]) / 100,
  }
}

/** Converts our generated OKLCH tokens to editable hex, preserving opacity. */
export function themeColorToHex(value: string): string {
  if (isThemeColor(value)) return normalizeThemeColor(value)
  const { color, alpha } = parseThemeColor(value)
  const hex = oklchToHex(color)
  const byte = Math.round(alpha * 255)
  return byte === 255 ? hex : `${hex}${byte.toString(16).padStart(2, "0")}`
}

/**
 * The middle layer of customisation. Each group has a seed token; setting the
 * group's colour moves every member with it, keeping each member's offset
 * from the seed (lightness, hue, chroma and opacity), so a page's hierarchy
 * survives a new colour. Every overridable token belongs to exactly one group.
 */
export interface GroupDef {
  seed: keyof ThemeOverrides
  members: readonly (keyof ThemeOverrides)[]
  /** Token the seed is read against, for a contrast hint. */
  contrastWith?: ThemeColor
}

export const THEME_GROUPS = {
  surfaces: {
    seed: "--background",
    members: [
      "--background",
      "--card",
      "--popover",
      "--header",
      "--secondary",
      "--muted",
      "--accent",
      "--sidebar",
      "--sidebar-accent",
    ],
  },
  text: {
    seed: "--foreground",
    contrastWith: "--background",
    members: [
      "--foreground",
      "--card-foreground",
      "--popover-foreground",
      "--secondary-foreground",
      "--accent-foreground",
      "--sidebar-foreground",
      "--sidebar-accent-foreground",
      "--muted-foreground",
    ],
  },
  brand: {
    seed: "--brand",
    contrastWith: "--background",
    members: ["--brand", "--ring", "--sidebar-ring", "--sidebar-primary"],
  },
  onPrimary: {
    seed: "--primary-foreground",
    contrastWith: "--primary",
    members: ["--primary-foreground", "--sidebar-primary-foreground"],
  },
  secondary: {
    seed: "--complement",
    members: ["--complement", "--complement-soft"],
  },
  borders: {
    seed: "--border",
    members: ["--border", "--input", "--sidebar-border"],
  },
  status: {
    seed: "--destructive",
    members: ["--destructive", "--live"],
  },
} as const satisfies Record<string, GroupDef>

export type ThemeGroup = keyof typeof THEME_GROUPS
export type ThemeGroupOverrides = Partial<
  Record<ResolvedMode, Partial<Record<ThemeGroup, string>>>
>

/** Everything the viewer can set; all but `primary` are optional. */
export interface ThemeConfig {
  primary: string
  tuning?: ThemeTuning
  groups?: ThemeGroupOverrides
  overrides?: ThemeColorOverrides
}

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n))

/** Moves `member` the way its seed moved from `from` to `to`. */
function follow(
  from: ParsedColor,
  to: ParsedColor,
  member: ParsedColor
): ParsedColor {
  // Chroma offsets are damped as the new seed gets greyer, so a grey seed
  // gives grey members instead of picking up the old tint at a stray hue.
  const damp = from.color.c > 0 ? Math.min(1, to.color.c / from.color.c) : 1
  return {
    color: {
      l: clamp(to.color.l + member.color.l - from.color.l, 0, 1),
      c: clamp(to.color.c + (member.color.c - from.color.c) * damp, 0, 0.37),
      h: wrapHue(to.color.h + member.color.h - from.color.h),
    },
    alpha:
      from.alpha > 0
        ? clamp((member.alpha * to.alpha) / from.alpha, 0, 1)
        : to.alpha,
  }
}

/** Applies group colours on top of a derived palette (copying it). */
export function applyGroups(
  palette: ThemePalette,
  groups: Partial<Record<ThemeGroup, string>> = {}
): ThemePalette {
  const next = { ...palette, vars: { ...palette.vars } }
  for (const [name, group] of Object.entries(THEME_GROUPS) as [
    ThemeGroup,
    (typeof THEME_GROUPS)[ThemeGroup],
  ][]) {
    const value = groups[name]
    if (typeof value !== "string" || !isThemeColor(value)) continue
    const seedValue = palette.vars[group.seed]
    const from = parseThemeColor(seedValue)
    const to = parseThemeColor(value)
    for (const member of group.members) {
      const current = palette.vars[member]
      next.vars[member] =
        current === seedValue
          ? normalizeThemeColor(value)
          : (() => {
              const moved = follow(from, to, parseThemeColor(current))
              return oklchCss(moved.color, moved.alpha)
            })()
    }
  }
  syncHexes(next, palette)
  return next
}

/** Applies per-token overrides on top of a palette (copying it). */
export function applyOverrides(
  palette: ThemePalette,
  overrides: ThemeOverrides = {}
): ThemePalette {
  const next = { ...palette, vars: { ...palette.vars } }
  for (const name of Object.keys(next.vars) as ThemeColor[]) {
    if (name === "--primary") continue
    const value = overrides[name as keyof ThemeOverrides]
    if (typeof value === "string" && isThemeColor(value)) {
      next.vars[name] = normalizeThemeColor(value)
    }
  }
  syncHexes(next, palette)
  return next
}

/** Keeps the hex summaries in step with any token that changed. */
function syncHexes(next: ThemePalette, prev: ThemePalette) {
  const hex = (value: string) => themeColorToHex(value).slice(0, 7)
  if (next.vars["--background"] !== prev.vars["--background"])
    next.background = hex(next.vars["--background"])
  if (next.vars["--complement"] !== prev.vars["--complement"])
    next.complement = hex(next.vars["--complement"])
}

/** Bumped if the export format ever changes incompatibly. */
const EXPORT_VERSION = 1
const MODES: readonly ResolvedMode[] = ["light", "dark"]

/** A theme as shareable text. Default layers are left out to keep it short. */
export function exportTheme(theme: ThemeConfig): string {
  const tuning = normalizeTuning(theme.tuning)
  const nonEmpty = <T extends object>(
    byMode: Partial<Record<ResolvedMode, T>> = {}
  ) => {
    const kept = Object.fromEntries(
      MODES.filter((m) => Object.keys(byMode[m] ?? {}).length).map((m) => [
        m,
        byMode[m],
      ])
    )
    return Object.keys(kept).length ? kept : undefined
  }
  return JSON.stringify({
    holodexTheme: EXPORT_VERSION,
    primary: normalizeHex(theme.primary),
    tuning:
      tuning.secondary === undefined &&
      tuning.tint === 1 &&
      tuning.contrast === 0
        ? undefined
        : tuning,
    groups: nonEmpty(theme.groups),
    overrides: nonEmpty(theme.overrides),
  })
}

/**
 * Reads exported theme text. Unknown keys and invalid colours are dropped, so
 * a pasted theme can only ever set known tokens. Returns null when the text is
 * not a theme at all.
 */
export function importTheme(text: string): Required<ThemeConfig> | null {
  let data: unknown
  try {
    data = JSON.parse(text.trim())
  } catch {
    return null
  }
  if (!data || typeof data !== "object") return null
  const raw = data as Record<string, unknown>
  if (raw.holodexTheme !== EXPORT_VERSION) return null
  if (typeof raw.primary !== "string" || !isHexColor(raw.primary)) return null

  const byMode = <K extends string>(value: unknown, keys: readonly K[]) => {
    const result: Partial<Record<ResolvedMode, Partial<Record<K, string>>>> = {}
    if (!value || typeof value !== "object") return result
    for (const mode of MODES) {
      const entries = (value as Record<string, unknown>)[mode]
      if (!entries || typeof entries !== "object") continue
      const kept: Partial<Record<K, string>> = {}
      for (const key of keys) {
        const color = (entries as Record<string, unknown>)[key]
        if (typeof color === "string" && isThemeColor(color))
          kept[key] = normalizeThemeColor(color)
      }
      if (Object.keys(kept).length) result[mode] = kept
    }
    return result
  }

  const tokens = Object.values(THEME_GROUPS).flatMap((g) => g.members)
  return {
    primary: normalizeHex(raw.primary),
    tuning: normalizeTuning(raw.tuning),
    groups: byMode(raw.groups, Object.keys(THEME_GROUPS) as ThemeGroup[]),
    overrides: byMode(raw.overrides, tokens),
  }
}

/**
 * Resolves every layer, from broad to specific: derivation (primary and
 * tuning), group colours, then individual colours. Always starts from fresh
 * defaults so removing a customisation restores the layer below exactly.
 */
export function resolvePalette(theme: ThemeConfig, mode: ResolvedMode) {
  const derived = derivePalette(
    theme.primary,
    mode,
    normalizeTuning(theme.tuning)
  )
  const groups = theme.groups?.[mode]
  const overrides = theme.overrides?.[mode]
  if (!groups && !overrides) return derived
  return applyOverrides(applyGroups(derived, groups), overrides)
}
