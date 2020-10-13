import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import VueGTag from "vue-gtag";
import "./registerServiceWorker";

Vue.config.productionTip = false;
Vue.config.performance = true;
Vue.use(
    VueGTag,
    {
        config: {
            id: "UA-178428556-1",
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
