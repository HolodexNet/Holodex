import Vue from "vue";
import VueGTag from "vue-gtag";
import VueMeta from "vue-meta";
import VueI18n from "vue-i18n";
import * as icons from "@/utils/icons";
import VueSocketIOExt from "vue-socket.io-extended";
import { io, Manager } from "socket.io-client";
import App from "./App.vue";
import store from "./store";
import router from "./router";
import { i18n, vuetify } from "./plugins/vuetify";

import "./registerServiceWorker";
import { API_BASE_URL } from "./utils/backend-api";

Vue.config.productionTip = false;
Vue.config.performance = true;
Vue.use(
    VueGTag,
    {
        config: {
            id: "UA-178428556-1",
        },
    },
    router,
);
// Vue.use(VueSimpleHeadful, {
//     key: "metaInfo", // custom key for component option
// });

// Create a manager to use a custom path (due to reverse proxy)
const manager = new Manager(/* process.env.NODE_ENV === "development" ? "http://localhost:2434" : */ API_BASE_URL, {
    reconnectionAttempts: 10,
    transports: ["websocket"],
    upgrade: false,
    path: /* process.env.NODE_ENV !== "development" && */ "/api/socket.io/",
    secure: true,
    autoConnect: false,
});

Vue.use(VueSocketIOExt, manager.socket("/"));

Vue.use(VueMeta, {
    refreshOnceOnNavigation: true,
});
Vue.use(VueI18n);

Vue.prototype.icons = icons;

new Vue({
    i18n,
    router,
    store,
    vuetify,
    render: (h) => h(App),
} as any).$mount("#app");
