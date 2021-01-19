import Vue from "vue";
import linkify from "vue-linkify";
import VueI18n from "vue-i18n";
import VueYouTubeEmbed from "vue-youtube-embed";
import { vuetify, i18n } from "@/plugins/vuetify";

import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css";

Vue.config.productionTip = false;
Vue.config.performance = true;
// Vue.use(VueMeta, {
//     refreshOnceOnNavigation: true,
// });
Vue.use(VueI18n);
Vue.use(VueYouTubeEmbed);
Vue.directive("linkified", linkify);
Vue.use(Vuetify);
Vue.use(i18n);

export const parameters = {
    docs: {
        iframeHeight: "60px",
    },
};
