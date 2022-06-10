import { createApp } from "vue";
import { Quasar } from "quasar";
import router from "./router/index";

// Import icon libraries
import "@quasar/extras/material-icons/material-icons.css";

// Import Quasar css
import "quasar/src/css/index.sass";

// Assumes your root component is App.vue
// and placed in same folder as main.js
import App from "./App.vue";
import { setupPinia, setupI18N } from "./setup";

const app = createApp(App);

app.use(router);

app.use(Quasar, {
  plugins: {}, // import Quasar plugins and add here
});

// config pinia:
const pinia = setupPinia();
app.use(pinia);

const i18n = setupI18N();
app.use(i18n);

// Assumes you have a <div id="app"></div> in your index.html
app.mount("#app");

