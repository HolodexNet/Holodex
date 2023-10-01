import { defineConfig } from "vite";
// Faster React using swc apparently
import react from "@vitejs/plugin-react-swc";
import UnoCSS from 'unocss/vite'
import presetIcons from "@unocss/preset-icons";
import { fileURLToPath, URL } from "url";
// import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), UnoCSS({ presets: [presetIcons()], })],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly'
    }
  }
});
