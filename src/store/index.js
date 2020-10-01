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
        cachedChannelLastUpdated: null,
        cachedChannels: {},
        nameProperty: "name_en",
        hideThumbnail: false,
    },
    getters: {
        useEnName(state) {
            return state.nameProperty === "name_en";
        },
    },
    mutations: {
        setDarkMode(state, val) {
            state.darkMode = val;
        },
        setRedirectMode(state, val) {
            state.redirectMode = val;
        },
        noWebPSupport(state) {
            state.canUseWebP = false;
        },
        testedWebP(state) {
            state.testedWebP = true;
        },
        setHideThumbnail(state, val) {
            state.hideThumbnail = val;
        },
        setRecentVideoFilter(state, payload) {
            state.recentVideoFilter = payload;
        },
        setLiveFilter(state, payload) {
            state.liveFilter = !state.favorites ? "all" : payload;
        },
        setUseEnName(state, payload) {
            state.nameProperty = payload ? "name_en" : "name";
        },
        addFavorite(state, channel_id) {
            if (channel_id > 1000) return;
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
        async updateChannelCache({ commit, state }) {
            console.log("Channel Cache updated");
            state.cachedChannelLastUpdated = new Date().getTime();
            await api.channels(100, 0, "vtuber").then(res => {
                if (res.data.channels.length) {
                    res.data.channels.forEach(channel => {
                        commit("addCachedChannel", channel);
                    });
                }
            });
        },
        async checkChannelCache({ state, dispatch }) {
            const currentTime = new Date().getTime();
            // update favorites if last updated is null or greater than 24 hours
            if (
                !state.cachedChannelLastUpdated ||
                currentTime - state.cachedChannelLastUpdated >
                    1000 * 60 * 60 * 24
            ) {
                await dispatch("updateChannelCache");
                return;
            }

            // update favorites if missing channels
            for (let id of state.favorites) {
                // eslint-disable-next-line prettier/prettier
                if (!Object.prototype.hasOwnProperty.call(state.cachedChannels, id) && id < 1000) {
                    console.log(`Missing channel_id: ${id}, refreshing cache`);
                    await dispatch("updateChannelCache");
                    break;
                }
            }
        },
    },
    modules: {},
});
