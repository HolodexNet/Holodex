import "uno.css";
import { createApp } from "vue";
import router from "./router/index";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { useI18n } from "vue-i18n";

import App from "./App.vue";
import { setupPinia, setupI18N, getVueQueryPluginOptions } from "./setup";
import LoadScript from "vue-plugin-load-script";
import VueToast from "vue-toast-notification";
import Vue3Linkify from "vue-3-linkify";

import "@/setup/main.css"; // tailwind configuration

import "@/setup/vuetify/main.sass"; // vuetify configuration
import "vue-toast-notification/dist/theme-default.css";
import { createVuetify } from "vuetify";
import { createVueI18nAdapter } from "vuetify/locale/adapters/vue-i18n";
// import { OhVueIcon } from "oh-vue-icons";
import * as icons from "@/utils/icons";

import { aliases, mdi } from "vuetify/iconsets/mdi-svg";

// a global logging hook for help with development.
window.log = function (props: any) {
  console.log(props);
  return props;
};

const app = createApp(App);

app.use(VueQueryPlugin, getVueQueryPluginOptions());

// config pinia:
const pinia = setupPinia();
app.use(pinia);

const i18n = setupI18N();

export const vuetify = createVuetify({
  display: {
    thresholds: {
      sm: 640,
    },
    mobileBreakpoint: "sm",
  },
  locale: { adapter: createVueI18nAdapter({ i18n, useI18n }) },
  icons: {
    defaultSet: "svg",
    aliases,
    sets: {
      mdi,
    },
  } as any,
  theme: {
    defaultTheme: "dark",
  },
});

app.use(router);

app.use(Vue3Linkify);

app.use(i18n);
app.use(vuetify);

// misc
app.use(LoadScript);
app.use(VueToast);
app.config.globalProperties.icons = icons;
// app.component("VIcon", OhVueIcon); // overwrite v-icon?

// Assumes you have a <div id="app"></div> in your index.html
app.mount("#app");
