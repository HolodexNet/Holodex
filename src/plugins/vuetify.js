import Vue from "vue";
import Vuetify from "vuetify/lib";
import colors from 'vuetify/lib/util/colors'

Vue.use(Vuetify);

export default new Vuetify({
    icons: {
        iconfont: "mdiSvg",
    },
    theme: {
        themes: {
            dark: {
                primary: colors.pink.lighten2,
                secondary: colors.blue.lighten2,
            },
            light: {
                primary: colors.pink.lighten2,
                secondary: colors.blue.lighten2,
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
