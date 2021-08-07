import { defineConfig, loadEnv } from "vite";
import { createVuePlugin } from "vite-plugin-vue2";
import ViteComponents, { VuetifyResolver } from "vite-plugin-components";
import yaml from "@rollup/plugin-yaml";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
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