import {
  contrastRatio,
  hexToOklch,
  hueDistance,
  isHexColor,
  normalizeHex,
  oklchCss,
  oklchToHex,
  wrapHue,
  type Oklch,
} from "./color.ts"

export type ResolvedMode = "light" | "dark"

/**
 * Hue that tinted neutrals gravitate towards. Low-chroma blue-violet reads as
 * the familiar "slate" surface, so when two harmonies are equally valid we
 * prefer the one closer to it.
 */
const COOL_ANCHOR = 255

/** Chroma at which a primary counts as fully saturated for tinting purposes. */
const FULL_CHROMA = 0.15

/** Below this chroma the primary is effectively grey and has no usable hue. */
const ACHROMATIC = 0.025

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n))

/**
 * Picks the hue of the base (neutral) colour from the primary.
 *
 * The base sits a third of the way around the wheel from the primary, i.e.
 * on one of its two triadic partners. A triad contrasts clearly without the
 * vibration of a direct complement; it is also the relationship between the
 * two colours of the Holodex mark (aqua pink and sky blue). Of the two
 * partners we take the cooler one, so surfaces stay calm behind thumbnails.
 */
export function deriveBaseHue(primary: Oklch): number {
  if (primary.c < ACHROMATIC) return COOL_ANCHOR
  const [a, b] = triadicHues(primary.h)
  return hueDistance(a, COOL_ANCHOR) <= hueDistance(b, COOL_ANCHOR) ? a : b
}

export function triadicHues(hue: number): [number, number] {
  return [wrapHue(hue + 120), wrapHue(hue + 240)]
}

/**
 * Knobs that steer the derivation itself, so the palette stays coherent
 * however far they are turned. Shared by light and dark mode.
 */
export interface ThemeTuning {
  /**
   * Secondary colour. Its hue tints every neutral and becomes the complement;
   * omitted means the cooler triadic partner of the primary.
   */
  secondary?: string
  /** Multiplier on how strongly neutrals are tinted, 0 (grey) .. 2. */
  tint: number
  /**
   * -1..1. Positive pushes surfaces towards black in dark mode (1 = OLED) and
   * white in light mode, and text the other way; negative softens both.
   */
  contrast: number
}

export const DEFAULT_TUNING: ThemeTuning = { tint: 1, contrast: 0 }

/** Coerces stored tuning into range, dropping anything malformed. */
export function normalizeTuning(value: unknown): ThemeTuning {
  const v = (value ?? {}) as Partial<Record<keyof ThemeTuning, unknown>>
  const num = (n: unknown, min: number, max: number, fallback: number) =>
    typeof n === "number" && Number.isFinite(n) ? clamp(n, min, max) : fallback
  return {
    secondary:
      typeof v.secondary === "string" && isHexColor(v.secondary)
        ? normalizeHex(v.secondary)
        : undefined,
    tint: num(v.tint, 0, 2, DEFAULT_TUNING.tint),
    contrast: num(v.contrast, -1, 1, DEFAULT_TUNING.contrast),
  }
}

/** The secondary's hue and chroma, or undefined when it should be automatic. */
function secondarySeed(tuning: ThemeTuning): Oklch | undefined {
  return tuning.secondary === undefined
    ? undefined
    : hexToOklch(tuning.secondary)
}

/** Hue the neutrals and complement use for a primary and tuning. */
export function resolveBaseHue(primary: Oklch, tuning: ThemeTuning): number {
  const secondary = secondarySeed(tuning)
  if (!secondary) return deriveBaseHue(primary)
  return secondary.c < ACHROMATIC ? COOL_ANCHOR : secondary.h
}

/** The complement as shown for a given hue and mode, as hex. */
export function complementHex(hue: number, mode: ResolvedMode): string {
  return oklchToHex(autoComplement(hue, mode === "dark"))
}

function autoComplement(hue: number, dark: boolean): Oklch {
  return dark ? { l: 0.77, c: 0.115, h: hue } : { l: 0.5, c: 0.13, h: hue }
}

/**
 * Derives the complete set of design tokens from a single primary colour.
 *
 * - `--primary` is the user's colour, untouched, for fills.
 * - `--brand` is the same hue adjusted in lightness until it is readable as
 *   text or an icon on the page background.
 * - Every surface (background, card, sidebar, header, border, ...) is a step
 *   on a neutral ramp tinted with the base hue. How strongly it is tinted
 *   scales with the primary's own chroma, so a muted primary gets quiet
 *   neutrals and a vivid one gets surfaces with a little more character.
 * - `--complement` is the base hue at full strength.
 *
 * `tuning` adjusts the inputs of that derivation; see {@link ThemeTuning}.
 */
export function derivePalette(
  primaryHex: string,
  mode: ResolvedMode,
  tuning: ThemeTuning = DEFAULT_TUNING
) {
  const hex = normalizeHex(primaryHex)
  const primary = hexToOklch(hex)
  const baseHue = resolveBaseHue(primary, tuning)
  const secondary = secondarySeed(tuning)
  const dark = mode === "dark"

  // 0.35..1 multiplier applied to every neutral's chroma, then the user's.
  const tint =
    (primary.c < ACHROMATIC ? 0.2 : clamp(primary.c / FULL_CHROMA, 0.35, 1)) *
    tuning.tint
  const base = (l: number, c: number): Oklch => ({
    l,
    c: c * tint,
    h: baseHue,
  })

  // Contrast moves surfaces towards the page's extreme (black in dark mode,
  // white in light) and text towards the opposite one. At +1 the dark page is
  // pure black; at -1 everything sits closer to mid grey.
  const k = tuning.contrast
  const surfaceShift = dark
    ? k > 0
      ? -0.165 * k
      : -0.12 * k
    : k > 0
      ? 0.017 * k
      : 0.08 * k
  const textShift = (dark ? 1 : -1) * (k > 0 ? 0.1 * k : 0.12 * k)
  const s = (l: number, c: number) => base(clamp(l + surfaceShift, 0, 1), c)
  const tx = (l: number, c: number) => base(clamp(l + textShift, 0, 1), c)

  const surface = dark
    ? {
        background: s(0.165, 0.014),
        card: s(0.205, 0.017),
        popover: s(0.225, 0.019),
        muted: s(0.262, 0.019),
        secondary: s(0.285, 0.026),
        sidebar: s(0.188, 0.016),
        header: s(0.215, 0.034),
        foreground: tx(0.972, 0.006),
        mutedForeground: tx(0.715, 0.022),
        border: base(0.93, 0.03),
      }
    : {
        background: s(0.983, 0.005),
        card: s(0.998, 0.002),
        popover: s(0.998, 0.002),
        muted: s(0.951, 0.009),
        secondary: s(0.932, 0.016),
        sidebar: s(0.968, 0.008),
        header: s(0.96, 0.02),
        foreground: tx(0.215, 0.022),
        mutedForeground: tx(0.49, 0.024),
        border: base(0.895, 0.014),
      }

  // Text on a primary fill: white unless the fill is too light to carry it.
  const onPrimary: Oklch =
    contrastRatio(hex, "#ffffff") >= 2.6
      ? { l: 0.99, c: 0.01, h: primary.h }
      : { l: 0.2, c: Math.min(primary.c, 0.05), h: primary.h }

  // Primary as foreground: pull lightness to the readable side of the page.
  const brand: Oklch = {
    l: dark ? Math.max(primary.l, 0.74) : Math.min(primary.l, 0.56),
    c: Math.min(primary.c, 0.2),
    h: primary.h,
  }

  // A chosen secondary keeps its own chroma; like --brand its lightness is
  // only pulled as far as needed to stay readable on the page.
  const complement: Oklch = secondary
    ? {
        l: dark ? Math.max(secondary.l, 0.7) : Math.min(secondary.l, 0.55),
        c: Math.min(secondary.c, 0.2),
        h: baseHue,
      }
    : autoComplement(baseHue, dark)
  const complementSoft: Oklch = dark
    ? { l: 0.36, c: 0.06 * tint, h: baseHue }
    : { l: 0.9, c: 0.045 * tint, h: baseHue }

  const border = dark
    ? oklchCss(surface.border, 0.11)
    : oklchCss(surface.border)
  const input = dark ? oklchCss(surface.border, 0.16) : oklchCss(surface.border)
  const ring = oklchCss(brand, 0.55)

  const vars = {
    "--background": oklchCss(surface.background),
    "--foreground": oklchCss(surface.foreground),
    "--card": oklchCss(surface.card),
    "--card-foreground": oklchCss(surface.foreground),
    "--popover": oklchCss(surface.popover),
    "--popover-foreground": oklchCss(surface.foreground),
    "--primary": oklchCss(primary),
    "--primary-foreground": oklchCss(onPrimary),
    "--brand": oklchCss(brand),
    "--complement": oklchCss(complement),
    "--complement-soft": oklchCss(complementSoft),
    "--secondary": oklchCss(surface.secondary),
    "--secondary-foreground": oklchCss(surface.foreground),
    "--muted": oklchCss(surface.muted),
    "--muted-foreground": oklchCss(surface.mutedForeground),
    "--accent": oklchCss(surface.muted),
    "--accent-foreground": oklchCss(surface.foreground),
    "--border": border,
    "--input": input,
    "--ring": ring,
    "--header": oklchCss(surface.header),
    "--sidebar": oklchCss(surface.sidebar),
    "--sidebar-foreground": oklchCss(surface.foreground),
    "--sidebar-primary": oklchCss(primary),
    "--sidebar-primary-foreground": oklchCss(onPrimary),
    "--sidebar-accent": oklchCss(surface.muted),
    "--sidebar-accent-foreground": oklchCss(surface.foreground),
    "--sidebar-border": border,
    "--sidebar-ring": ring,
    "--destructive": dark
      ? "oklch(0.704 0.191 22.216)"
      : "oklch(0.577 0.245 27.325)",
    "--live": dark ? "oklch(0.66 0.23 25)" : "oklch(0.6 0.235 25)",
  }

  return {
    vars,
    baseHue,
    background: oklchToHex(surface.background),
    complement: oklchToHex(complement),
  }
}

export type ThemePalette = ReturnType<typeof derivePalette>
export type ThemeColor = keyof ThemePalette["vars"]
/** Primary remains the shared seed; all other colours can vary by mode. */
export type ThemeOverrides = Partial<
  Record<Exclude<ThemeColor, "--primary">, string>
>
export type ThemeColorOverrides = Partial<Record<ResolvedMode, ThemeOverrides>>
