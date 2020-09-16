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
        favorites: [],
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
        addFavorite(state, channel_id) {
            state.favorites.push(channel_id);
        },
        removeFavorite(state, channel_id) {
            const index = state.favorites.indexOf(channel_id);
            if (index > -1) {
                state.favorites.splice(index, 1);
            }
        },
    },
    actions: {},
    modules: {},
});
