import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        darkMode: true,
        redirectMode: false,
        canUseWebP: true,
        testWebP: false,
    },
    mutations: {
        toggleDarkMode(state) {
            state.darkMode = !state.darkMode;
        },
        toggleRedirectMode(state) {
            state.redirectMode = !state.redirectMode;
        },
        noWebPSupport(state) {
            state.canUseWebP = false;
        },
    },
    actions: {},
    modules: {},
});
