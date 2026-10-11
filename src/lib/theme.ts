export const AQUA_PINK = "#F06292";
export const swatches = [
  { name: "Aqua-iro pink", color: AQUA_PINK },
  { name: "Ocean blue", color: "#5B9DE8" },
  { name: "Lavender", color: "#A68BEA" },
  { name: "Mint", color: "#66BFA8" },
  { name: "Amber", color: "#DCA45C" },
  { name: "Coral", color: "#E77B75" },
];

// Convert sRGB into perceptual OKLCH. Complementary hue + restrained chroma
// creates a quiet backing palette without washing the UI in the primary color.
export function palette(hex: string, dark: boolean) {
  const rgb = hex.match(/[a-f\d]{2}/gi)!.map((value) => {
    const c = parseInt(value, 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const [r, g, b] = rgb;
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const h = ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360;
  const complement = (h + 180) % 360;
  const chroma = Math.min(Math.hypot(a, bb) * 0.025, 0.0045);
  const color = (light: number, c = chroma, hue = complement) =>
    `oklch(${light} ${c} ${hue})`;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const contrast = luminance > 0.179 ? "#17151B" : "#FFFFFF";
  return {
    "--primary": hex,
    "--primary-foreground": contrast,
    "--primary-ink": color(dark ? 0.79 : 0.43, 0.12, h),
    "--ring": hex,
    "--background": color(dark ? 0.175 : 0.979),
    "--foreground": color(dark ? 0.94 : 0.25),
    "--card": color(dark ? 0.215 : 0.998),
    "--card-foreground": color(dark ? 0.94 : 0.25),
    "--popover": color(dark ? 0.24 : 0.998),
    "--popover-foreground": color(dark ? 0.94 : 0.25),
    "--muted": color(dark ? 0.26 : 0.946),
    "--muted-foreground": color(dark ? 0.71 : 0.49),
    "--secondary": color(dark ? 0.28 : 0.95),
    "--secondary-foreground": color(dark ? 0.94 : 0.25),
    "--accent": color(dark ? 0.29 : 0.951, 0.027, h),
    "--accent-foreground": color(dark ? 0.83 : 0.41, 0.11, h),
    "--border": color(dark ? 0.31 : 0.916),
    "--input": color(dark ? 0.34 : 0.916),
    "--sidebar": color(dark ? 0.205 : 0.998),
    "--sidebar-foreground": color(dark ? 0.94 : 0.25),
    "--sidebar-accent": color(dark ? 0.29 : 0.951, 0.027, h),
    "--sidebar-accent-foreground": color(dark ? 0.83 : 0.41, 0.11, h),
    "--sidebar-border": color(dark ? 0.31 : 0.916),
    "--sidebar-ring": hex,
  };
}
