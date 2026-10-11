import {
  contrastRatio,
  hexToOklch,
  hueDistance,
  normalizeHex,
  oklchCss,
  oklchToHex,
  wrapHue,
  type Oklch,
} from "./color.ts"

export type ResolvedMode = "light" | "dark"

export interface ThemePalette {
  /** CSS custom properties, keyed by name including the leading `--`. */
  vars: Record<string, string>
  /** Hue the neutral surfaces are tinted with. */
  baseHue: number
  /** Hex of the page background, for `<meta name="theme-color">`. */
  background: string
  /** Hex of the vivid complement, used by the logo and vtuber names. */
  complement: string
}

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
  const a = wrapHue(primary.h + 120)
  const b = wrapHue(primary.h + 240)
  return hueDistance(a, COOL_ANCHOR) <= hueDistance(b, COOL_ANCHOR) ? a : b
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
 */
export function derivePalette(
  primaryHex: string,
  mode: ResolvedMode
): ThemePalette {
  const hex = normalizeHex(primaryHex)
  const primary = hexToOklch(hex)
  const baseHue = deriveBaseHue(primary)
  const dark = mode === "dark"

  // 0.35..1 multiplier applied to every neutral's chroma.
  const tint =
    primary.c < ACHROMATIC ? 0.2 : clamp(primary.c / FULL_CHROMA, 0.35, 1)
  const base = (l: number, c: number): Oklch => ({
    l,
    c: c * tint,
    h: baseHue,
  })

  const surface = dark
    ? {
        background: base(0.165, 0.014),
        card: base(0.205, 0.017),
        popover: base(0.225, 0.019),
        muted: base(0.262, 0.019),
        secondary: base(0.285, 0.026),
        sidebar: base(0.188, 0.016),
        header: base(0.215, 0.034),
        foreground: base(0.972, 0.006),
        mutedForeground: base(0.715, 0.022),
        border: base(0.93, 0.03),
      }
    : {
        background: base(0.983, 0.005),
        card: base(0.998, 0.002),
        popover: base(0.998, 0.002),
        muted: base(0.951, 0.009),
        secondary: base(0.932, 0.016),
        sidebar: base(0.968, 0.008),
        header: base(0.96, 0.02),
        foreground: base(0.215, 0.022),
        mutedForeground: base(0.49, 0.024),
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

  const complement: Oklch = dark
    ? { l: 0.77, c: 0.115, h: baseHue }
    : { l: 0.5, c: 0.13, h: baseHue }
  const complementSoft: Oklch = dark
    ? { l: 0.36, c: 0.06 * tint, h: baseHue }
    : { l: 0.9, c: 0.045 * tint, h: baseHue }

  const border = dark ? oklchCss(surface.border, 0.11) : oklchCss(surface.border)
  const input = dark ? oklchCss(surface.border, 0.16) : oklchCss(surface.border)
  const ring = oklchCss(brand, 0.55)

  const vars: Record<string, string> = {
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
  }

  return {
    vars,
    baseHue,
    background: oklchToHex(surface.background),
    complement: oklchToHex(complement),
  }
}
