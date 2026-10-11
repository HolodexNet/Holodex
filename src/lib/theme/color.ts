/**
 * Minimal OKLCH <-> sRGB conversion. The theme engine does all of its math in
 * OKLCH so that "same lightness" and "same chroma" mean what they say across
 * hues, which plain HSL does not give you.
 */

export interface Oklch {
  /** Perceptual lightness, 0..1 */
  l: number
  /** Chroma, 0..~0.37 */
  c: number
  /** Hue angle in degrees, 0..360 */
  h: number
}

type Rgb = [number, number, number]

const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i

export function isHexColor(value: string): boolean {
  return HEX_RE.test(value.trim())
}

export function normalizeHex(value: string): string {
  const match = HEX_RE.exec(value.trim())
  if (!match) return "#000000"
  let hex = match[1].toLowerCase()
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((ch) => ch + ch)
      .join("")
  }
  return `#${hex}`
}

function hexToRgb(hex: string): Rgb {
  const n = parseInt(normalizeHex(hex).slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

function toLinear(v: number): number {
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

function toGamma(v: number): number {
  return v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055
}

export function wrapHue(h: number): number {
  return ((h % 360) + 360) % 360
}

/** Shortest angular distance between two hues, 0..180. */
export function hueDistance(a: number, b: number): number {
  const d = Math.abs(wrapHue(a) - wrapHue(b))
  return d > 180 ? 360 - d : d
}

export function hexToOklch(hex: string): Oklch {
  const [r, g, b] = hexToRgb(hex).map(toLinear)

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)

  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s

  const c = Math.hypot(A, B)
  // Hue is meaningless for greys; pin it so downstream math stays stable.
  const h = c < 1e-4 ? 0 : wrapHue((Math.atan2(B, A) * 180) / Math.PI)
  return { l: L, c, h }
}

function oklchToLinearRgb({ l: L, c, h }: Oklch): Rgb {
  const rad = (h * Math.PI) / 180
  const A = c * Math.cos(rad)
  const B = c * Math.sin(rad)

  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3

  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
}

function inGamut(rgb: Rgb): boolean {
  return rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4)
}

/**
 * Converts to a displayable hex, lowering chroma (never lightness or hue)
 * until the colour fits inside sRGB.
 */
export function oklchToHex(color: Oklch): string {
  let lo = 0
  let hi = color.c
  let rgb = oklchToLinearRgb(color)
  if (!inGamut(rgb)) {
    for (let i = 0; i < 18; i++) {
      const mid = (lo + hi) / 2
      if (inGamut(oklchToLinearRgb({ ...color, c: mid }))) lo = mid
      else hi = mid
    }
    rgb = oklchToLinearRgb({ ...color, c: lo })
  }
  const hex = rgb
    .map((v) => Math.round(Math.min(1, Math.max(0, toGamma(v))) * 255))
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("")
  return `#${hex}`
}

/** WCAG relative luminance of an sRGB hex colour. */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(toLinear)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

const round = (n: number, digits: number) => Number(n.toFixed(digits))

/** Serialises to a CSS `oklch()` colour. */
export function oklchCss({ l, c, h }: Oklch, alpha?: number): string {
  const body = `${round(l, 4)} ${round(c, 4)} ${round(h, 2)}`
  return alpha === undefined || alpha >= 1
    ? `oklch(${body})`
    : `oklch(${body} / ${round(alpha * 100, 1)}%)`
}
