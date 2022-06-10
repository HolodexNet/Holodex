import { createApp } from "vue";
import { Quasar, QuasarPluginOptions } from "quasar";
import router from "./router/index";

// Import icon libraries
import "@quasar/extras/material-icons/material-icons.css";

// Import Quasar css
import "quasar/src/css/index.sass";

// Assumes your root component is App.vue
// and placed in same folder as main.js
import App from "./App.vue";
import { setupPinia, setupI18N } from "./setup";
import { useThemeStore } from "./stores/theme";

const app = createApp(App);

app.use(router);

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

// Assumes you have a <div id="app"></div> in your index.html
app.mount("#app");

