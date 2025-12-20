import Color from "color";

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
  baseColor: string,
  mode: "light" | "dark",
): ThemeVariables {
  const primary = primaryHex;
  // Determine foreground for primary based on darkness
  const primaryForeground = Color(primary).isDark()
    ? Color(primary).mix(Color("white"), 0.9).hex()
    : Color(primary).mix(Color("black"), 0.9).hex();

  // For simplicity, using Oxidus logic which bases everything on 'hex' (primary).
  // We will mix in secondary/base where appropriate if we want to diverge,
  // but for now let's stick closer to the Oxidus DefaultPaletteStrategy which
  // mostly uses the primary hex to derive others, blending with black/white.

  // NOTE: Holodex might want the secondary color to actually be used for 'secondary'
  // instead of just a mix of primary.
  // Oxidus: const lightSecondary = Color(hex).mix(Color("white"), 0.85).hex();
  // We will use the user-provided secondaryHex for secondary.

  const secondary = secondaryHex;
  const secondaryForeground = Color(secondary).isDark()
    ? Color(secondary).mix(Color("white"), 0.9).hex()
    : Color(secondary).mix(Color("black"), 0.9).hex();

  if (mode === "light") {
    const background = "#ffffff";
    const foreground = Color(primary).mix(Color("black"), 0.9).hex();

    return {
      "--background": background,
      "--foreground": foreground,
      "--card": Color(primary).mix(Color("white"), 0.98).hex(),
      "--card-foreground": Color(primary).mix(Color("black"), 0.9).hex(),
      "--popover": Color(primary).mix(Color("white"), 0.98).hex(),
      "--popover-foreground": Color(primary).mix(Color("black"), 0.9).hex(),
      "--primary": primary,
      "--primary-foreground": primaryForeground,
      "--secondary": secondary,
      "--secondary-foreground": secondaryForeground,
      "--muted": Color(primary).mix(Color("white"), 0.9).hex(),
      "--muted-foreground": Color("white").hsl().darken(0.6).hex(),
      "--accent": Color(primary).mix(Color("white"), 0.9).hex(),
      "--accent-foreground": Color(primary).mix(Color("black"), 0.85).hex(),
      "--destructive": "oklch(0.64 0.21 25.39)", // Keep default destructive
      "--destructive-foreground": "oklch(0.98 0 0)",
      "--border": Color("#000")
        .mix(Color(primary).mix(Color(background), 0.92), 0.92)
        .hex(),
      "--input": Color(primary)
        .mix(Color("black"), 0.5)
        .mix(Color("white"), 0.75)
        .hex(),
      "--ring": primary,
      "--chart-1": primary,
      "--chart-2": Color(primary).mix(Color("white"), 0.15).hex(),
      "--chart-3": Color(primary).mix(Color("white"), 0.35).hex(),
      "--chart-4": Color(primary).mix(Color("white"), 0.45).hex(),
      "--chart-5": Color(primary).mix(Color("white"), 0.55).hex(),
      "--sidebar": Color(primary).mix(Color("white"), 0.98).hex(),
      "--sidebar-foreground": Color(primary).mix(Color("black"), 0.9).hex(),
      "--sidebar-primary": primary,
      "--sidebar-primary-foreground": primaryForeground,
      "--sidebar-accent": primary,
      "--sidebar-accent-foreground": primaryForeground,
      "--sidebar-border": Color(primary).mix(Color("white"), 0.8).hex(),
      "--sidebar-ring": primary,
    };
  } else {
    const background = "#000000";
    const foreground = Color(primary).mix(Color("white"), 0.85).hex();

    return {
      "--background": background,
      "--foreground": foreground,
      "--card": Color(primary).mix(Color("#0a0a0a"), 0.96).hex(),
      "--card-foreground": Color(primary).mix(Color("white"), 0.85).hex(),
      "--popover": Color(primary).mix(Color("#0f0f0f"), 0.98).hex(),
      "--popover-foreground": Color(primary).mix(Color("white"), 0.85).hex(),
      "--primary": primary,
      "--primary-foreground": primaryForeground,
      "--secondary": secondary,
      "--secondary-foreground": secondaryForeground,
      "--muted": Color("#000000").mix(Color("white"), 0.1).hex(),
      "--muted-foreground": Color("#000000").mix(Color("white"), 0.5).hex(),
      "--accent": Color("black").mix(Color(primary), 0.35).hex(),
      "--accent-foreground": Color(primary).mix(Color("white"), 0.85).hex(),
      "--destructive": "oklch(0.64 0.21 25.39)",
      "--destructive-foreground": "oklch(0.98 0 0)",
      "--border": Color("#343434")
        .mix(Color(primary).mix(Color(background), 0.8), 0.3)
        .hex(),
      "--input": Color(primary)
        .mix(Color("white"), 0.6)
        .mix(Color("black"), 0.75)
        .hex(),
      "--ring": primary,
      "--chart-1": primary,
      "--chart-2": Color(primary).mix(Color("black"), 0.15).hex(),
      "--chart-3": Color(primary).mix(Color("black"), 0.35).hex(),
      "--chart-4": Color(primary).mix(Color("black"), 0.45).hex(),
      "--chart-5": Color(primary).mix(Color("black"), 0.55).hex(),
      "--sidebar": Color(primary).mix(Color("#0f0f0f"), 0.98).hex(),
      "--sidebar-foreground": Color(primary).mix(Color("white"), 0.85).hex(),
      "--sidebar-primary": primary,
      "--sidebar-primary-foreground": primaryForeground,
      "--sidebar-accent": primary,
      "--sidebar-accent-foreground": primaryForeground,
      "--sidebar-border": Color(primary).mix(Color("black"), 0.8).hex(),
      "--sidebar-ring": primary,
    };
  }
}
