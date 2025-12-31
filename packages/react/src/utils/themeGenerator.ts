import { colord as Color, extend } from "colord";
import mixPlugin from "colord/plugins/mix";
extend([mixPlugin]);

export type ThemeVariables = {
  "--background": string;
  "--foreground": string;
  "--card": string;
  "--card-foreground": string;
  "--popover": string;
  "--popover-foreground": string;
  "--primary": string;
  "--primary-foreground": string;
  "--secondary": string;
  "--secondary-foreground": string;
  "--muted": string;
  "--muted-foreground": string;
  "--accent": string;
  "--accent-foreground": string;
  "--destructive": string;
  "--destructive-foreground": string;
  "--border": string;
  "--input": string;
  "--ring": string;
  "--chart-1": string;
  "--chart-2": string;
  "--chart-3": string;
  "--chart-4": string;
  "--chart-5": string;
  "--sidebar": string;
  "--sidebar-foreground": string;
  "--sidebar-primary": string;
  "--sidebar-primary-foreground": string;
  "--sidebar-accent": string;
  "--sidebar-accent-foreground": string;
  "--sidebar-border": string;
  "--sidebar-ring": string;
};

export function generateTheme(
  primaryHex: string,
  secondaryHex: string,
  _baseColor: string,
  mode: "light" | "dark",
): ThemeVariables {
  const primary = primaryHex;
  // Determine foreground for primary based on darkness
  const white = Color("#fff");
  const black = Color("#000");
  const primaryForeground = Color(primary).isDark()
    ? Color(primary).mix(white, 0.9).toHex()
    : Color(primary).mix(black, 0.9).toHex();

  // For simplicity, using Oxidus logic which bases everything on 'hex' (primary).
  // We will mix in secondary/base where appropriate if we want to diverge,
  // but for now let's stick closer to the Oxidus DefaultPaletteStrategy which
  // mostly uses the primary hex to derive others, blending with black/white.

  // NOTE: Holodex might want the secondary color to actually be used for 'secondary'
  // instead of just a mix of primary.
  // Oxidus: const lightSecondary = Color(hex).mix(white, 0.85).toHex();
  // We will use the user-provided secondaryHex for secondary.

  const secondary = secondaryHex;
  const secondaryForeground = Color(secondary).isDark()
    ? Color(secondary).mix(white, 0.9).toHex()
    : Color(secondary).mix(black, 0.9).toHex();

  if (mode === "light") {
    const background = "#ffffff";
    const foreground = Color(primary).mix(black, 0.9).desaturate(0.6).toHex();

    return {
      "--background": background,
      "--foreground": foreground,
      "--card": Color(primary).mix(white, 0.98).toHex(),
      "--card-foreground": Color(primary).mix(black, 0.9).toHex(),
      "--popover": Color(primary).mix(white, 0.98).toHex(),
      "--popover-foreground": Color(primary).mix(black, 0.9).toHex(),
      "--primary": primary,
      "--primary-foreground": primaryForeground,
      "--secondary": secondary,
      "--secondary-foreground": secondaryForeground,
      "--muted": Color(primary).mix(white, 0.9).toHex(),
      "--muted-foreground": white.darken(0.6).toHex(),
      "--accent": Color(primary).mix(white, 0.9).toHex(),
      "--accent-foreground": Color(primary).mix(black, 0.85).toHex(),
      "--destructive": "oklch(0.64 0.21 25.39)", // Keep default destructive
      "--destructive-foreground": "oklch(0.98 0 0)",
      "--border": Color("#000")
        .mix(Color(primary).mix(Color(background), 0.92), 0.92)
        .toHex(),
      "--input": Color(primary).mix(black, 0.5).mix(white, 0.75).toHex(),
      "--ring": primary,
      "--chart-1": primary,
      "--chart-2": Color(primary).mix(white, 0.15).toHex(),
      "--chart-3": Color(primary).mix(white, 0.35).toHex(),
      "--chart-4": Color(primary).mix(white, 0.45).toHex(),
      "--chart-5": Color(primary).mix(white, 0.55).toHex(),
      "--sidebar": Color(primary).mix(white, 0.98).toHex(),
      "--sidebar-foreground": Color(primary).mix(black, 0.9).toHex(),
      "--sidebar-primary": primary,
      "--sidebar-primary-foreground": primaryForeground,
      "--sidebar-accent": primary,
      "--sidebar-accent-foreground": primaryForeground,
      "--sidebar-border": Color(primary).mix(white, 0.8).toHex(),
      "--sidebar-ring": primary,
    };
  } else {
    const background = "#000000";
    const foreground = Color(primary).mix(white, 0.85).desaturate(0.6).toHex();

    return {
      "--background": background,
      "--foreground": foreground,
      "--card": Color(primary).mix(Color("#0a0a0a"), 0.96).toHex(),
      "--card-foreground": Color(primary).mix(white, 0.85).toHex(),
      "--popover": Color(primary).mix(Color("#0f0f0f"), 0.98).toHex(),
      "--popover-foreground": Color(primary).mix(white, 0.85).toHex(),
      "--primary": primary,
      "--primary-foreground": primaryForeground,
      "--secondary": secondary,
      "--secondary-foreground": secondaryForeground,
      "--muted": Color("#000000").mix(white, 0.1).toHex(),
      "--muted-foreground": Color("#000000").mix(white, 0.5).toHex(),
      "--accent": black.mix(Color(primary), 0.35).toHex(),
      "--accent-foreground": Color(primary).mix(white, 0.85).toHex(),
      "--destructive": "oklch(0.64 0.21 25.39)",
      "--destructive-foreground": "oklch(0.98 0 0)",
      "--border": Color("#343434")
        .mix(Color(primary).mix(Color(background), 0.8), 0.3)
        .toHex(),
      "--input": Color(primary).mix(white, 0.6).mix(black, 0.75).toHex(),
      "--ring": primary,
      "--chart-1": primary,
      "--chart-2": Color(primary).mix(black, 0.15).toHex(),
      "--chart-3": Color(primary).mix(black, 0.35).toHex(),
      "--chart-4": Color(primary).mix(black, 0.45).toHex(),
      "--chart-5": Color(primary).mix(black, 0.55).toHex(),
      "--sidebar": Color(primary).mix(Color("#0f0f0f"), 0.95).toHex(),
      "--sidebar-foreground": Color(primary).mix(white, 0.85).toHex(),
      "--sidebar-primary": primary,
      "--sidebar-primary-foreground": primaryForeground,
      "--sidebar-accent": primary,
      "--sidebar-accent-foreground": primaryForeground,
      "--sidebar-border": Color(primary).mix(black, 0.8).toHex(),
      "--sidebar-ring": primary,
    };
  }
}
