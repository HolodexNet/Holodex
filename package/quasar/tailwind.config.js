/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui"), require("@tailwindcss/line-clamp")],
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
