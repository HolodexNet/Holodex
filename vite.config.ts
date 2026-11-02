import { resolve } from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { visualizer } from "rollup-plugin-visualizer"
import { defineConfig, loadEnv, type Plugin } from "vite"
import { parse as parseYaml } from "yaml"

/** Locale files are YAML (Crowdin source format); expose them as JSON modules. */
function yaml(): Plugin {
  return {
    name: "holodex-yaml",
    transform(code, id) {
      if (!/\.ya?ml$/.test(id)) return null
      return {
        code: `export default ${JSON.stringify(parseYaml(code))}`,
        map: null,
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // .env is read without a prefix filter: these values only configure the dev
  // proxy and are never exposed to client code.
  const env = { ...loadEnv(mode, process.cwd(), ""), ...process.env }
  const API_BASE_URL = env.API_BASE_URL ?? "https://staging.holodex.net"
  const REWRITE_API_ROUTES = !!env.REWRITE_API_ROUTES

  const proxyTarget = {
    target: API_BASE_URL,
    changeOrigin: true,
    secure: false,
  }

  return {
    experimental: {
      bundledDev: true,
    },
    plugins: [
      yaml(),
      react({
        compiler: true,
      }),
      tailwindcss(),
      visualizer({
        filename: "stats.html",
        gzipSize: true,
        brotliSize: true,
        template: "treemap",
      }),
    ],
    resolve: {
      alias: {
        "@": resolve(import.meta.dirname, "./src"),
      },
    },
    build: {
      sourcemap: true,
      chunkImportMap: true,
      rollupOptions: {
        input: {
          main: resolve(import.meta.dirname, "index.html"),
          seo: resolve(import.meta.dirname, "seo.html"),
        },
        output: {
          codeSplitting: true,
          // Keep the React Refresh preamble ahead of shared app chunks in bundledDev.
          // https://github.com/vitejs/vite-plugin-react/issues/1191
          strictExecutionOrder: true,
        },
      },
    },
    server: {
      port: 8080,
      proxy: {
        "/api": {
          ...proxyTarget,
          ws: true,
          rewrite: (url) =>
            REWRITE_API_ROUTES ? url.replace(/^\/api/, "") : url,
        },
        "^/(stats|orgs).json$": proxyTarget,
        "/statics": proxyTarget,
      },
    },
  }
})
