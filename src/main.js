import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import VueGTag from "vue-gtag";
import "./registerServiceWorker";

Vue.config.productionTip = false;
Vue.use(
    VueGTag,
    {
        config: {
            id: "G-0SFRKG0C9M",
        },
    },
    router
);
new Vue({
    router,
    store,
    vuetify,
    render: h => h(App),
}).$mount("#app");
