// FILE: vite.config.js

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { ViteAliases } from "vite-aliases";
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars';
import yaml from "@rollup/plugin-yaml";
import visualizer from "rollup-plugin-visualizer";
import vuetify from 'vite-plugin-vuetify'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    '__VUE_I18N_LEGACY_API__': false,
    '__VUE_I18N_FULL_INSTALL__': false,
  },
  plugins: [
    // ViteYaml({
    //   // for converting yml into ES6 modules.
    //   include: ["src/locales/**/*.yml"]
    // }),
    yaml(),
    dynamicImportVars({
      // for importing yml dynamically.
      include: ["src/locales/**/*.yml", "node_modules/dayjs/**/*.js"],
    }),
    vue({
    }),
    vuetify({
      autoImport: true,
      styles: 'expose'
    }),
    AutoImport({ // AutoImports is temperamental, might add non-treeshaking.
      imports: [
        'vue',
        'pinia'
      ],
      dts: 'src/auto-imports.d.ts',
      eslintrc: {
        enabled: true,
      },
    }),
    Components({
      dirs: ['src'],
      extensions: ['vue'],
      include: ['src/**'],
      types: [],
    }),
    ViteAliases(),
    visualizer({ gzipSize: true, brotliSize: true }),
  ],
  optimizeDeps: {
    exclude: ['oh-vue-icons/icons']
  }
});
