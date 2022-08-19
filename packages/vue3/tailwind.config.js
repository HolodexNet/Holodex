const colors = {
  primary: "--p",
  secondary: "--s",
  accent: "--a",
  bgColor: "--b1",
  neutral: "--n",
};
const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

const colorOpts = Object.keys(colors).reduce((prev, colorName) => {
  const cssVar = colors[colorName];
  shades.forEach((shadeNum) => {
    if (!prev[colorName]) prev[colorName] = {};
    prev[colorName][
      shadeNum
    ] = `hsl(var(${cssVar}-${shadeNum}) / <alpha-value>)`;
    // makes bg-primary same as bg-primary-400
    if (shadeNum === 400) {
      prev[colorName]["DEFAULT"] = `hsl(var(${cssVar}) / <alpha-value>)`;
    }
  });
  return prev;
}, {});
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: colorOpts,
    },
  },
  plugins: [
    require("daisyui"),
    require("@tailwindcss/line-clamp"),
    function ({ addComponents }) {
      addComponents({
        ".container": {
          maxWidth: "100%",
          "@screen sm": {
            maxWidth: "640px",
          },
          "@screen md": {
            maxWidth: "768px",
          },
          "@screen lg": {
            maxWidth: "970px",
          },
          "@screen xl": {
            maxWidth: "1080px",
          },
        },
      });
    },
  ],
  daisyui: {
    styled: true,
    themes: [],
    base: true,
    utils: true,
    logs: true,
    rtl: false,
    prefix: "",
  },
};
