import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        darkMode: true,
        redirectMode: false,
    },
    mutations: {
        toggleDarkMode(state) {
            state.darkMode = !state.darkMode;
        },
        toggleRedirectMode(state) {
            state.redirectMode = !state.redirectMode;
        },
    },
    actions: {},
    modules: {},
});
