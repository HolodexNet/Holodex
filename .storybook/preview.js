import Vue from "vue";
import linkify from "vue-linkify";
import VueI18n from "vue-i18n";
import store from "@/store/index";
import router from "@/router";
import { i18n, vuetify } from "@/plugins/vuetify";

import Vuetify from "vuetify";
import "vuetify/dist/vuetify.css";
import { addDecorator, configure } from "@storybook/vue";
// import "https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900";

// Vue.config.productionTip = false;
// Vue.config.performance = true;

Vue.use(VueI18n);
Vue.directive("linkified", linkify);
Vue.use(Vuetify);

Vue.prototype.$store = store;
// Vue.prototype.$i18n = i18n;

export const decorators = [
    (_) => {
        return {
            vuetify: vuetify,
            i18n,
            store,
            router,
            template: `
            <v-app>
              <v-main>
                <v-container fluid>
                  <story />
                </v-container>
              </v-main>
            </v-app>`,
        };
    },
];

export const parameters = {
    docs: {
        iframeHeight: "60px",
    },
};

configure(require.context("../src/stories", true, /\.stories\.js$/), module);
