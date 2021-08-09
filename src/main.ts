import Vue from "vue";
import VueGTag from "vue-gtag";
import VueMeta from "vue-meta";
import VueI18n from "vue-i18n";
import * as icons from "@/utils/icons";
import LoadScript from "vue-plugin-load-script";
import PortalVue from "portal-vue";
import App from "./App.vue";
import store from "./store";
import router from "./router";
import { i18n, vuetify } from "./plugins/vuetify";

Vue.config.productionTip = false;

Vue.use(
    VueGTag,
    {
        config: {
            id: "UA-178428556-1",
        },
    },
    router,
);

// Create a manager to use a custom path (due to reverse proxy)
if (!(window as any).hideMeta) {
    Vue.use(VueMeta, {
        refreshOnceOnNavigation: true,
    });
}
Vue.use(VueI18n);
Vue.use(LoadScript);

Vue.use(PortalVue);
Vue.prototype.icons = icons;

new Vue({
    i18n,
    router,
    store,
    vuetify,
    render: (h) => h(App),
} as any).$mount("#app");
