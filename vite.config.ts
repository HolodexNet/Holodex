import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = env.API_BASE_URL || "http://localhost:2434";
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: "react",
                test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/,
              },
              { name: "ui", test: /[\\/]node_modules[\\/]@base-ui[\\/]/ },
              { name: "data", test: /[\\/]node_modules[\\/]@tanstack[\\/]/ },
            ],
          },
        },
      },
    },
    server: {
      host: "127.0.0.1",
      port: 8080,
      proxy: {
        "/api": {
          target,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
          // The first-party UI's local proxy uses the backend's approved origin.
          headers: {
            origin: "https://holodex.net",
            referer: "https://holodex.net/",
          },
        },
      },
    },
  };
});
