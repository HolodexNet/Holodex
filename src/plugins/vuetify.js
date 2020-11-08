import Vue from "vue";
import Vuetify from "vuetify/lib";
import { primary_color, secondary_color } from "@/utils/consts";
import VueI18n from "vue-i18n";

Vue.use(Vuetify);

// ====== i18n setup ======
Vue.use(VueI18n);

import en from "vuetify/es5/locale/en";
import ja from "vuetify/es5/locale/ja";
import enTL from "@/localization/en.yaml";
import jaTL from "@/localization/ja.yaml";

const localization = {
    en: { $vuetify: en, ...enTL },
    ja: { $vuetify: ja, ...jaTL },
};

const i18n = new VueI18n({
    locale: "en", // set locale
    localization, // set locale messages
});
// ====== end i18n setup ======

export default new Vuetify({
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
