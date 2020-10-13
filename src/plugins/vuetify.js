import Vue from "vue";
import Vuetify from "vuetify/lib";
import { primary_color, secondary_color } from "@/utils/consts";

Vue.use(Vuetify);

export default new Vuetify({
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
