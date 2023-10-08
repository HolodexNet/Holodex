import * as createPlugin from "windy-radix-palette";


console.log(createPlugin);
const colors = createPlugin.default();

function getColorSpace(name, alpha) {
  const a = alpha ? 'A' : ''
  var colorspace = { "DEFAULT": "var(--primary-9)" }
  for (var i = 1; i <= 12; i++) {
    const color = `--${name}-${a}${i}`;
    colorspace[i] = `var(${color})`
  }
  return colorspace
}

console.log(getColorSpace('primary'))

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
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
      colors: {
        base: getColorSpace("base"),
        primary: getColorSpace("primary"),
        "primaryA": getColorSpace("primary", true),
        secondary: getColorSpace("secondary"),
        "secondaryA": getColorSpace("secondary", true),
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), colors.handler],
}