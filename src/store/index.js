import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex);

export default new Vuex.Store({
    plugins: [
        createPersistedState({
            key: "holosubs",
        }),
    ],
    state: {
        darkMode: true,
        redirectMode: false,
        canUseWebP: true,
        testedWebP: false,
        recentVideoFilter: "both",
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
        testedWebP(state) {
            state.testedWebP = true;
        },
        updateRecentVideoFilter(state, payload) {
            state.recentVideoFilter = payload;
        },
    },
    actions: {},
    modules: {},
});
