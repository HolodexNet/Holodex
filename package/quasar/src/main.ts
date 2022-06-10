import { createApp } from "vue";
import { Quasar, QuasarPluginOptions } from "quasar";
import router from "./router/index";
import { VueQueryPlugin } from "vue-query";
import iconSet from 'quasar/icon-set/svg-ionicons-v6'

// Import icon libraries
import "@quasar/extras/material-icons/material-icons.css";

// Import Quasar css
import "quasar/src/css/index.sass";

import App from "./App.vue";
import { setupPinia, setupI18N, getVueQueryPluginOptions } from "./setup";
import { useThemeStore } from "./stores/theme";

const app = createApp(App);

app.use(VueQueryPlugin, getVueQueryPluginOptions());

// config pinia:
const pinia = setupPinia();
app.use(pinia);

const i18n = setupI18N();
app.use(i18n);

app.use(Quasar, <Partial<QuasarPluginOptions>>{
  plugins: {}, // import Quasar plugins and add here
  config: {
    dark: useThemeStore().dark
  },
  iconSet: iconSet,
  /*
  config: {
    brand: {
      primary: '#e46262',
      // ... or all other brand colors
    },
    notify: {...}, // default set of options for Notify Quasar plugin
    loading: {...}, // default set of options for Loading Quasar plugin
    loadingBar: { ... }, // settings for LoadingBar Quasar plugin
    // ..and many more (check Installation card on each Quasar component/directive/plugin)
  }
  */
});

app.use(router);

// Assumes you have a <div id="app"></div> in your index.html
app.mount("#app");

