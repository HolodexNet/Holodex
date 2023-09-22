import { defineConfig } from "vite";
// Faster React using swc apparently
import react from "@vitejs/plugin-react-swc";
import UnoCSS from 'unocss/vite'
// import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), UnoCSS()],
  css: {
    modules: {
      localsConvention: 'camelCaseOnly'
    }
  }
});
