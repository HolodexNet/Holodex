export type Appearance = 'dark' | 'light' | 'system'
export const PRIMARY_COLORS = [
  { name: 'Sunflower', hex: '#f5c542' }, { name: 'Lilac', hex: '#a78bfa' },
  { name: 'Ocean', hex: '#38bdf8' }, { name: 'Mint', hex: '#34d399' },
  { name: 'Rose', hex: '#fb7185' }, { name: 'Peach', hex: '#fb923c' },
]
export function isHex(value: unknown): value is string { return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) }
function channels(hex: string) { return [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255) }
function linear(c: number) { return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
export function luminance(hex: string) { const [r, g, b] = channels(hex).map(linear); return .2126 * r + .7152 * g + .0722 * b }
export function contrast(a: string, b: string) { const l = [luminance(a), luminance(b)].sort((x, y) => y - x); return (l[0] + .05) / (l[1] + .05) }
function rgbHex(rgb: number[]) { return '#' + rgb.map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0')).join('') }
export function oklchToHex(lightness: number, chroma: number, hue: number) {
  const a = chroma * Math.cos(hue * Math.PI / 180), b = chroma * Math.sin(hue * Math.PI / 180)
  const l = (lightness + .3963377774 * a + .2158037573 * b) ** 3
  const m = (lightness - .1055613458 * a - .0638541728 * b) ** 3
  const s = (lightness - .0894841775 * a - 1.291485548 * b) ** 3
  const rgb = [4.0767416621 * l - 3.3077115913 * m + .2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - .3413193965 * s, -.0041960863 * l - .7034186147 * m + 1.707614701 * s]
  return rgbHex(rgb.map((v) => v <= .0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - .055))
}
export function readableColor(primary: string, background: string, dark: boolean) {
  if (contrast(primary, background) >= 4.6) return primary
  const rgb = channels(primary)
  for (let step = 1; step <= 100; step++) {
    const mixed = rgbHex(rgb.map((v) => v + ((dark ? 1 : 0) - v) * step / 100))
    if (contrast(mixed, background) >= 4.6) return mixed
  }
  return dark ? '#ffffff' : '#000000'
}
export function complementaryHue(hex: string) {
  const [r, g, b] = channels(hex).map(linear)
  const l = Math.cbrt(.4122214708 * r + .5363325363 * g + .0514459929 * b)
  const m = Math.cbrt(.2119034982 * r + .6806995451 * g + .1073969566 * b)
  const s = Math.cbrt(.0883024619 * r + .2817188376 * g + .6299787005 * b)
  const a = 1.9779984951 * l - 2.428592205 * m + .4505937099 * s
  const bb = .0259040371 * l + .7827717662 * m - .808675766 * s
  return (Math.atan2(bb, a) * 180 / Math.PI + 540) % 360
}
export function deriveTheme(primary: string, dark: boolean) {
  const hex = isHex(primary) ? primary : PRIMARY_COLORS[0].hex
  const hue = complementaryHue(hex)
  // A complementary OKLCH hue, with low chroma, colors the neutral surfaces.
  // Fixed lightness steps keep text, controls, and layers legible for any accent.
  const neutral = (lightness: number, chroma = .009) => `oklch(${lightness} ${chroma} ${hue.toFixed(2)})`
  const fg = dark ? neutral(.94, .005) : neutral(.22)
  const bg = neutral(dark ? .165 : .975)
  const card = neutral(dark ? .205 : .995)
  const muted = neutral(dark ? .255 : .945)
  const border = neutral(dark ? .30 : .875)
  const readableAccent = readableColor(hex, oklchToHex(dark ? .255 : .945, .009, hue), dark)
  return {
    '--primary': hex, '--primary-foreground': contrast(hex, '#ffffff') > contrast(hex, '#000000') ? '#ffffff' : '#000000',
    '--primary-readable': readableAccent, '--base-hue': String(hue), '--background': bg,
    '--foreground': fg, '--card': card, '--card-foreground': fg, '--popover': card, '--popover-foreground': fg,
    '--muted': muted, '--muted-foreground': neutral(dark ? .69 : .49, .012),
    '--secondary': muted, '--secondary-foreground': fg, '--accent': muted, '--accent-foreground': fg,
    '--border': border, '--input': border, '--ring': readableAccent,
    '--sidebar': neutral(dark ? .185 : .985), '--sidebar-foreground': fg,
    '--sidebar-primary': hex, '--sidebar-primary-foreground': contrast(hex, '#ffffff') > contrast(hex, '#000000') ? '#ffffff' : '#000000',
    '--sidebar-accent': muted, '--sidebar-accent-foreground': fg, '--sidebar-border': border, '--sidebar-ring': readableAccent,
  }
}
