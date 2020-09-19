import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";
import api from "@/utils/backend-api";

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
        recentVideoFilter: "all",
        liveFilter: "all",
        favorites: [],
        cachedChannels: {
            lastUpdated: null,
        },
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
        setRecentVideoFilter(state, payload) {
            state.recentVideoFilter = payload;
        },
        setLiveFilter(state, payload) {
            state.liveFilter = !state.favorites ? "all" : payload;
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
        addCachedChannel(state, channel_obj) {
            state.cachedChannels[channel_obj.id] = channel_obj;
        },
        removeCachedChannel(state, channel_id) {
            delete state.cachedChannels[channel_id];
        },
    },
    actions: {
        // async updateCachedChannels({ commit, state }) {
        //     await api.channels(100, 0, "vtuber").then(res => {
        //         if (res.data.channels.length) {
        //             res.data.channels.forEach(channel => {
        //                 if (state.favorites.includes(channel.id))
        //                     commit("addCachedChannel", channel);
        //             });
        //         }
        //     });
        // },
        async checkFavorites({ commit, state }) {
            for (let id of state.favorites) {
                // eslint-disable-next-line prettier/prettier
                if (!Object.prototype.hasOwnProperty.call(state.cachedChannels, id)) {
                    console.log(`Missing channel_id: ${id}, refreshing cache`);
                    await api.channels(100, 0, "vtuber").then(res => {
                        if (res.data.channels.length) {
                            res.data.channels.forEach(channel => {
                                // if (state.favorites.includes(channel.id))
                                commit("addCachedChannel", channel);
                            });
                        }
                    });
                    break;
                }
            }
            // this.channels = Object.values(this.cachedChannels);
        },
    },
    modules: {},
});
