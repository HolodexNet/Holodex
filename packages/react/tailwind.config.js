import * as colors from "@radix-ui/colors"

function getColorSpace(name) {
  let alpha = false
  if (name.endsWith("A")) {
    name = name.substring(0, name.length - 1)
    alpha = true
  }
  var colorspace = { "DEFAULT": `var(--${name}-${alpha ? 'a' : ''}9)` }
  for (var i = 1; i <= 12; i++) {
    colorspace[i] = `var(--${name}-${alpha ? 'a' : ''}${i})`
  }
  return colorspace
}

function configureDefaultColorSpace(level) {
  return {
    primary: { DEFAULT: `var(--primary-${level})` },
    primaryA: { DEFAULT: `var(--primary-a${level})` },
    secondary: { DEFAULT: `var(--secondary-${level})` },
    secondaryA: { DEFAULT: `var(--secondary-a${level})` },
    base: { DEFAULT: `var(--base-${level})` }
  }
}

/** @type {import('tailwindcss').Config} */
const config = {
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
      borderColor: configureDefaultColorSpace(6),
      backgroundColor: configureDefaultColorSpace(3),
      textColor: configureDefaultColorSpace(11),
      accentColor: configureDefaultColorSpace(9),
      outlineColor: configureDefaultColorSpace(7),
      ringColor: configureDefaultColorSpace(8),
      colors: {
        base: getColorSpace("base"),
        primary: getColorSpace("primary"),
        "primaryA": getColorSpace("primaryA"),
        secondary: getColorSpace("secondary"),
        "secondaryA": getColorSpace("secondaryA"),
        ...Object.keys(colors).filter(x => !(x.includes("P3") || x.includes("Dark"))).map(x => {
          return [
            x,
            getColorSpace(x)
          ]
        }).reduce((prev, cur) => ({ ...prev, [cur[0]]: cur[1] }), {})
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
  plugins: [require("tailwindcss-animate")],
}

module.exports = config
