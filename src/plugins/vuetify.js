import Vue from "vue";
import Vuetify from "vuetify/lib";
import { primary_color, secondary_color } from "@/utils/consts";
import VueI18n from "vue-i18n";

Vue.use(Vuetify);

// ====== i18n setup ======
Vue.use(VueI18n);

import vuetifyEn from "vuetify/es5/locale/en";
import vuetifyJa from "vuetify/es5/locale/ja";
import enTL from "@/locales/en.yml";
import jaTL from "@/locales/ja.yml";

const messages = {
    en: { $vuetify: vuetifyEn, ...enTL },
    ja: { $vuetify: vuetifyJa, ...jaTL },
};

export const i18n = new VueI18n({
    locale: "en", // set locale
    messages, // set locale messages
});
// ====== end i18n setup ======

export const vuetify = new Vuetify({
    treeShake: true,
    icons: {
        iconfont: "mdiSvg",
    },
    theme: {
        themes: {
            dark: {
                primary: primary_color,
                secondary: secondary_color,
            },
            light: {
                primary: primary_color,
                secondary: secondary_color,
            },
        },
    },
    lang: {
        t: (key, ...params) => i18n.t(key, params),
    },
    // breakpoint: {
    //     thresholds: {
    //         xs: 0,
    //         sm: 476,
    //         md: 668,
    //         lg: 1000,
    //         xl: 1300,
    //     },
    // },
});
