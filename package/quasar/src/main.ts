import { createApp } from "vue";
import router from "./router/index";
import { VueQueryPlugin } from "vue-query";
import { useI18n } from "vue-i18n";

import App from "./App.vue";
import { setupPinia, setupI18N, getVueQueryPluginOptions } from "./setup";
import { useThemeStore } from "./stores/theme";

import "@/setup/main.css"; // tailwind configuration

import "@/setup/vuetify/main.sass"; // vuetify configuration

import { createVuetify } from "vuetify";
import { createVueI18nAdapter } from "vuetify/locale/adapters/vue-i18n";
// import { OhVueIcon } from "oh-vue-icons";
import * as icons from "@/utils/icons";

const app = createApp(App);

app.use(VueQueryPlugin, getVueQueryPluginOptions());

// config pinia:
const pinia = setupPinia();
app.use(pinia);

const i18n = setupI18N();
app.use(i18n);

app.use(router);

export const vuetify = createVuetify({
  locale: createVueI18nAdapter({ i18n, useI18n }),
  icons: {
    defaultSet: "svg",
  } as any,
  theme: {
    defaultTheme: "dark",
  },
});
app.use(vuetify);

app.config.globalProperties.icons = icons;
// app.component("VIcon", OhVueIcon); // overwrite v-icon?

// Assumes you have a <div id="app"></div> in your index.html
app.mount("#app");
