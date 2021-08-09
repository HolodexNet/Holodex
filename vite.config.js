/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from "vite";
import { createVuePlugin } from "vite-plugin-vue2";
import ViteComponents, { VuetifyResolver } from "vite-plugin-components";
import visualizer from "rollup-plugin-visualizer";
import yaml from "@rollup/plugin-yaml";
import { VitePWA } from "vite-plugin-pwa";
import { resolve, replace } from "path";

const API_BASE_URL = process.env.API_BASE_URL || "https://staging.holodex.net";
const REWRITE_API_ROUTES = !!process.env.REWRITE_API_ROUTES;

export default defineConfig({
    plugins: [
        yaml(),
        createVuePlugin(),
        ViteComponents({
            customComponentResolvers: [VuetifyResolver()],
        }),
        VitePWA({
            includeAssets: ["favicon.ico", "robots.txt", "img/icons/safari-pinned-tab.svg"],
            manifest: {
                // content of manifest
                display: "standalone",
                theme_color: "#42a5f5",
                name: "Holodex",
                background_color: "#42a5f5",
                scope: "/",
                icons: [
                    {
                        src: "img/icons/android-chrome-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "img/icons/android-chrome-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                    {
                        src: "img/icons/android-chrome-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "maskable",
                    },
                ],
            },
            workbox: {
                // NOTE: `vite-plugin-pwa` expects the service worker to be called `sw.js` for some reason.
                // there is no way to change this.
                swDest: "./dist/sw.js",
                runtimeCaching: [
                    {
                        urlPattern: new RegExp(
                            "https://fonts.(?:googleapis|gstatic).com/(.*)",
                        ),
                        handler: "CacheFirst",
                        options: {
                            cacheName: "google-fonts",
                            expiration: {
                                maxEntries: 30,
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                    {
                        urlPattern: new RegExp(
                            "https://yt3.ggpht.com/(a/|ytc/)(.*)=s(40|88)-c-k-c0x00ffffff-no-rj-mo(.*)",
                        ),
                        handler: "CacheFirst",
                        options: {
                            cacheName: "channel-photo",
                            expiration: {
                                maxAgeSeconds: 86400,
                                purgeOnQuotaError: true,
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                    {
                        urlPattern: new RegExp("https://www.youtube.com/player_api"),
                        handler: "CacheFirst",
                        options: {
                            cacheName: "youtube-player",
                            expiration: {
                                maxAgeSeconds: 10800,
                                maxEntries: 1,
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                ],
                // workbox options for generateSW
            },
        }),
        visualizer({ gzipSize: true }),
    ],
    resolve: {
        alias: [
            {
                find: "@",
                replacement: resolve(__dirname, "src"),
            },
        ],
    },
    sourcemap: true,
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
                seo: resolve(__dirname, "seo.html"),
            },
        },
    },
    server: {
        port: 8080,
        proxy: {
            "/api": {
                target: API_BASE_URL,
                changeOrigin: true,
                secure: false,
                rewrite: (path) => (REWRITE_API_ROUTES ? replace(/^\/api/, "") : path),
            },
            "^/(stats|orgs).json$": {
                target: API_BASE_URL,
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
