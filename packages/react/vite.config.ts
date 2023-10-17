import { defineConfig } from "vite";
// Faster React using swc apparently
import react from "@vitejs/plugin-react-swc";
import yaml from '@rollup/plugin-yaml';
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars';
import UnoCSS from "unocss/vite";
import presetIcons from "@unocss/preset-icons";
import { fileURLToPath, URL } from "url";
import bundleAnalyzer from "rollup-plugin-bundle-analyzer";
// import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    // sourcemap: true
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "https://staging.holodex.net/",
        changeOrigin: true,
      },
      "/statics": {
        target: "https://staging.holodex.net/",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    bundleAnalyzer({}),
    react({ plugins: [["@swc-jotai/debug-label", {}]] }),
    UnoCSS({ presets: [presetIcons()] }),
    yaml(),
    dynamicImportVars({
      // for importing yml dynamically.
      include: ["src/locales/**/*.yml", "node_modules/dayjs/**/*.js"],
    }),
  ],
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
