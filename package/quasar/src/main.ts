import { createApp } from "vue";
import router from "./router/index";
import { VueQueryPlugin } from "vue-query";


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

app.use(router);

// Assumes you have a <div id="app"></div> in your index.html
app.mount("#app");

