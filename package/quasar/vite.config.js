// FILE: vite.config.js

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { quasar, transformAssetUrls } from "@quasar/vite-plugin";
import { ViteAliases } from "vite-aliases";
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import content from '@originjs/vite-plugin-content',

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    content({
      // for converting yml, xml, ini, and other files to ES6 modules.
    }),
    vue({
      template: { transformAssetUrls },
    }),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'pinia',
        'quasar',
      ],
      dts: 'src/auto-imports.d.ts',
      eslintrc: {
        enabled: true,
      },
    }),
    Components({
      dirs: ['src/components'],
      extensions: ['vue'],
    }),
    quasar({
      sassVariables: "src/quasar-variables.sass",
    }),
    ViteAliases(),
  ],
});
