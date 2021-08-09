/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from "vite";
import { createVuePlugin } from "vite-plugin-vue2";
import ViteComponents, { VuetifyResolver } from "vite-plugin-components";
import visualizer from "rollup-plugin-visualizer";
import yaml from "@rollup/plugin-yaml";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

/**
 * @param {string} mode
 * @param {string} dir
 * @returns {Record<string, string>}
 */
const actuallyLoadEnv = (mode, dir) => {
    let env = {};
    const files = [".env", ".env.local", `.env.${mode}`, `.env.${mode}.local`];
    for (const file of files) {
        if (fs.existsSync(path.join(dir, file))) {
            const content = fs.readFileSync(path.join(dir, file), "utf-8");
            const data = dotenv.parse(content);
            env = { ...env, ...data };
        }
    }
    return env;
};

/**
 * @param {{ mode: string, command: string }}
 */
export default ({ mode }) => {
    // `process.env` is second so that loaded env vars dont overwrite anything by accident
    const env = actuallyLoadEnv(mode, __dirname);
    const API_BASE_URL = env.API_BASE_URL ?? "https://staging.holodex.net";
    const REWRITE_API_ROUTES = !!env.REWRITE_API_ROUTES;

    return defineConfig({
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
                    start_url: "/",
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
                    replacement: path.resolve(__dirname, "src"),
                },
            ],
        },
        sourcemap: true,
        build: {
            rollupOptions: {
                input: {
                    main: path.resolve(__dirname, "index.html"),
                    seo: path.resolve(__dirname, "seo.html"),
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
                    rewrite: (url) => (REWRITE_API_ROUTES ? url.replace(/^\/api/, "") : url),
                },
                "^/(stats|orgs).json$": {
                    target: API_BASE_URL,
                    changeOrigin: true,
                    secure: false,
                },
            },
        },
    });
};
