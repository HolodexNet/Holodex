import { defineConfig, loadEnv } from "vite";
import { createVuePlugin } from "vite-plugin-vue2";
import ViteComponents, { VuetifyResolver } from "vite-plugin-components";
import yaml from "@rollup/plugin-yaml";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default ({ mode }) => {
    process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

    const API_BASE_URL = process.env.API_BASE_URL || "https://staging.holodex.net";
    const REWRITE_API_PATH = !!process.env.REWRITE_API_PATH;

    return defineConfig({
        plugins: [
            yaml(),
            createVuePlugin(),
            ViteComponents({
                customComponentResolvers: [VuetifyResolver()]
            })
        ],
        resolve: {
            alias: [
                {
                    find: "@",
                    replacement: path.resolve(__dirname, "src")
                }
            ]
        },
        server: {
            port: 8080
        }
    });
}