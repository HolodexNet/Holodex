import { defineConfig } from "vite";
// Faster React using swc apparently
import react from "@vitejs/plugin-react-swc";
import UnoCSS from 'unocss/vite'
import presetIcons from "@unocss/preset-icons";
import { fileURLToPath, URL } from "url";
import bundleAnalyzer from "rollup-plugin-bundle-analyzer";
// import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    // sourcemap: true
  },
  plugins: [bundleAnalyzer({}), react({ plugins: [['@swc-jotai/debug-label', {}]] }), UnoCSS({ presets: [presetIcons()], })],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  // css: {
  //   modules: {
  //     localsConvention: 'camelCaseOnly'
  //   }
  // }
});
