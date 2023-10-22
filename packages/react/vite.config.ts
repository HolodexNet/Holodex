import { defineConfig } from "vite";
// Faster React using swc apparently
import react from "@vitejs/plugin-react-swc";
import yaml from "@rollup/plugin-yaml";
import dynamicImportVars from "@rollup/plugin-dynamic-import-vars";
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
    port: 8080,
    open: true,
    proxy: {
      "/api": {
        target: "https://staging.holodex.net",
        changeOrigin: true,
        headers: { origin: "https://staging.holodex.net" },
        secure: false,
        ws: true,
        // This configuration manages the logging behavior: turn on for debugging purposes.
        // configure: (proxy, _options) => {
        //   proxy.on("error", (err, _req, _res) => {
        //     console.log("proxy error", err);
        //   });
        //   proxy.on("proxyReq", (proxyReq, req, _res) => {
        //     console.log(
        //       "Sending Request:\n\t",
        //       req.method,
        //       req.url,
        //       "\n\t => TO THE TARGET => \n\t",
        //       proxyReq.method,
        //       proxyReq.protocol,
        //       proxyReq.host,
        //       proxyReq.path,
        //       "\n",
        //       JSON.stringify(proxyReq.getHeaders(), null, 2),
        //     );
        //   });
        //   proxy.on("proxyRes", (proxyRes, req, _res) => {
        //     console.log(
        //       "Received Response from the Target:",
        //       proxyRes.statusCode,
        //       req.url,
        //       JSON.stringify(proxyRes.headers),
        //     );
        //   });
        // },
      },
      "^/(stats|orgs).json$": {
        target: "https://staging.holodex.net",
        changeOrigin: true,
        headers: { origin: "https://staging.holodex.net" },
        secure: false,
      },
      "/statics": {
        target: "https://staging.holodex.net",
        changeOrigin: true,
        headers: { origin: "https://staging.holodex.net" },
        secure: false,
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
