import * as colors from "@radix-ui/colors";

function getColorSpace(name) {
  let alpha = false;
  if (name.endsWith("A")) {
    name = name.substring(0, name.length - 1);
    alpha = true;
  }
  var colorspace = { DEFAULT: `var(--${name}-${alpha ? "a" : ""}9)` };
  for (var i = 1; i <= 12; i++) {
    colorspace[i] = `var(--${name}-${alpha ? "a" : ""}${i})`;
  }
  return colorspace;
}

function configureDefaultColorSpace(level) {
  return {
    primary: { DEFAULT: `var(--primary-${level})` },
    primaryA: { DEFAULT: `var(--primary-a${level})` },
    secondary: { DEFAULT: `var(--secondary-${level})` },
    secondaryA: { DEFAULT: `var(--secondary-a${level})` },
    base: { DEFAULT: `var(--base-${level})` },
  };
}

function configureDefaultColorSpaceForTextOnSolid(level) {
  return {
    primary: { DEFAULT: `var(--primary-${level})`, solid: `var(--primary-fg)` },
    primaryA: { DEFAULT: `var(--primary-a${level})` },
    secondary: {
      DEFAULT: `var(--secondary-${level})`,
      solid: `var(--secondary-fg)`,
    },
    secondaryA: { DEFAULT: `var(--secondary-a${level})` },
    base: { DEFAULT: `var(--base-${level})` },
    baseA: { DEFAULT: `var(--baseA-${level})` },
  };
}

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      borderColor: configureDefaultColorSpace(6),
      backgroundColor: configureDefaultColorSpaceForTextOnSolid(3),
      textColor: configureDefaultColorSpaceForTextOnSolid(11),
      accentColor: configureDefaultColorSpace(9),
      outlineColor: configureDefaultColorSpace(7),
      ringColor: configureDefaultColorSpace(8),
      colors: {
        muted: "var(--base-8)", // muted is the same as base-8
        base: getColorSpace("base"),
        baseA: getColorSpace("baseA"),
        primary: getColorSpace("primary"),
        primaryA: getColorSpace("primaryA"),
        secondary: getColorSpace("secondary"),
        secondaryA: getColorSpace("secondaryA"),
        ...Object.keys(colors)
          .filter((x) => !(x.includes("P3") || x.includes("Dark")))
          .map((x) => {
            return [x, getColorSpace(x)];
          })
          .reduce((prev, cur) => ({ ...prev, [cur[0]]: cur[1] }), {}),
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        shake: {
          "10%, 90%": {
            transform: "translate3d(-1px, 0, 0)",
          },
          "20%, 80%": {
            transform: "translate3d(2px, 0, 0)",
          },
          "30%, 50%, 70%": {
            transform: "translate3d(-4px, 0, 0)",
          },
          "40%, 60%": {
            transform: "translate3d(4px, 0, 0)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shake: "shake 0.82s cubic-bezier(.36,.07,.19,.97) both",
      },
      containers: {
        "screen-sm": "640px",
        "screen-md": "768px",
        "screen-lg": "1024px",
        "screen-xl": "1280px",
        "screen-2xl": "1536px",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/container-queries"),
  ],
};

module.exports = config;
