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

console.log(Object.keys(colors).filter(x => !(x.includes("P3") || x.includes("Dark"))).map(x => {
  return [
    x,
    getColorSpace(x)
  ]
}).reduce((prev, cur) => ({ ...prev, [cur[0]]: cur[1] }), {}))

console.log(getColorSpace('primaryA'))

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
        "primaryA": getColorSpace("primaryA"),
        secondary: getColorSpace("secondary"),
        "secondaryA": getColorSpace("secondaryA"),
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