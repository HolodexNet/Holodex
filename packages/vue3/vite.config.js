// FILE: vite.config.js

import { defineConfig } from "vite";
import BuildInfo from "vite-plugin-info";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import dynamicImportVars from "@rollup/plugin-dynamic-import-vars";
import yaml from "@rollup/plugin-yaml";
import Unocss from "unocss/vite";
import presetIcons from "@unocss/preset-icons";
import * as icons from "./src/utils/icons.ts";
import path from "node:path";
import bundleAnalyzer from "rollup-plugin-bundle-analyzer";

const API_BASE_URL = process.env.API_BASE_URL || "https://staging.holodex.net";
const REWRITE_API_ROUTES = false;

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __VUE_I18N_LEGACY_API__: false,
    __VUE_I18N_FULL_INSTALL__: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    rollupOptions: {
      external: [
        "ffprobe-worker.js",
        "ffprobe-core.js",
        "ffprobe-core.wasm",
        "ffmpeg.min.js",
      ],
    },
  },
  plugins: [
    BuildInfo(),
    // visualizer({ template: "treemap", gzipSize: true, brotliSize: true }),
    // ^ keeping this around, as it's still useful for answering "WHY is this component around", but its estimates are inaccurate.
    bundleAnalyzer({
      analyzerMode: "static",
      reportFilename: "stats.html",
      statsFilename: "stats.json",
    }),
    // ViteYaml({
    //   // for converting yml into ES6 modules.
    //   include: ["src/locales/**/*.yml"]
    // }),
    yaml(),
    dynamicImportVars({
      // for importing yml dynamically.
      include: ["src/locales/**/*.yml", "node_modules/dayjs/**/*.js"],
    }),
    // ViteAliases(),
    vue({
      script: {
        defineModel: true,
      },
    }),
    Unocss({
      presets: [presetIcons()],
      safelist: [
        ...Object.values(icons).filter((x) => typeof x === "string"),
        ...Object.values(icons.search),
      ],
    }),
    AutoImport({
      // AutoImports is temperamental, might add non-treeshaking.
      imports: ["vue", "pinia", "vue-router"],
      dts: "src/auto-imports.d.ts",
      eslintrc: {
        enabled: true,
      },
      exclude: [/ffmpeg.min.js/, /node_modules/, /\.git/],
    }),
    Components({
      dirs: ["src"],
      extensions: ["vue"],
      include: ["src/**"],
      types: [],
      dts: "src/components.d.ts",
    }),
    // filesize({
    //   showBeforeSizes: "build",
    // }),
    // {
    //   name: "configure-response-headers",
    //   configureServer: (server) => {
    //     server.middlewares.use((_req, res, next) => {
    //       res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    //       res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    //       next();
    //     });
    //   },
    // },
  ],
  server: {
    port: 8080,
    proxy: {
      "/api": {
        target: API_BASE_URL,
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: (url) =>
          REWRITE_API_ROUTES ? url.replace(/^\/api/, "") : url,
      },
      "^/(stats|orgs).json$": {
        target: API_BASE_URL,
        changeOrigin: true,
        secure: false,
      },
      "/statics": {
        target: "https://holodex.net",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
