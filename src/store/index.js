import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";
import api from "@/utils/backend-api";

Vue.use(Vuex);

function defaultState() {
    return {
        darkMode: true,
        redirectMode: false,
        canUseWebP: true,
        testedWebP: false,
        recentVideoFilter: "all",
        liveFilter: "all",
        favorites: [],
        cachedChannelsLastUpdated: null,
        cachedChannelsError: false,
        cachedChannels: {},
        nameProperty: "name_en",
        hideThumbnail: false,
        showUpdateDetails: false,
        channelsCategory: 0,
        channelsSort: {
            0: "group",
            1: "recent_upload",
            2: "subscribers",
        },
        channelsCardView: {
            0: false,
            1: false,
            2: false,
        },
    };
}

export default new Vuex.Store({
    plugins: [
        createPersistedState({
            key: "holodex",
        }),
    ],
    state: defaultState(),
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
        setCachedChannelsError(state, payload) {
            state.cachedChannelsError = payload;
        },
        setCachedChannelsLastUpdated(state, payload) {
            state.cachedChannelsLastUpdated = payload;
        },
        setShowUpdatesDetail(state, payload) {
            state.showUpdateDetails = payload;
        },
        setChannelsSort(state, payload) {
            Vue.set(state.channelsSort, payload.category, payload.value);
        },
        setChannelsCardView(state, payload) {
            Vue.set(state.channelsCardView, payload.category, payload.value);
        },
        setChannelsCategory(state, payload) {
            state.channelsCategory = payload;
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
        resetState(state) {
            Object.assign(state, defaultState());
        },
    },
    actions: {
        async updateChannelCache({ commit }) {
            console.log("Channel Cache updated");
            commit("setCachedChannelsLastUpdated", new Date().getTime());
            const res = await api.channels({
                limit: 100,
                type: "vtuber",
            });
            if (res.data.channels.length) {
                res.data.channels.forEach(channel => {
                    commit("addCachedChannel", channel);
                });
            }
        },
        async checkChannelCache({ state, dispatch }) {
            const currentTime = new Date().getTime();
            if (
                !state.cachedChannelsLastUpdated ||
                // update every hour
                currentTime - state.cachedChannelsLastUpdated >
                    1000 * 60 * 60 * 1 ||
                // retry every 15 minutes if error
                (state.cachedChannelsError &&
                    currentTime - state.cachedChannelsLastUpdated >
                        1000 * 60 * 15)
            ) {
                this.commit("setCachedChannelsError", false);
                await dispatch("updateChannelCache");
                return;
            }

            // update favorites if missing channels
            for (let id of state.favorites) {
                // eslint-disable-next-line prettier/prettier
                if (!Object.prototype.hasOwnProperty.call(state.cachedChannels, id) && id < 1000) {
                    console.log(`Missing channel_id: ${id}, refreshing cache`);
                    try {
                        await dispatch("updateChannelCache");
                        break;
                    } catch (e) {
                        console.log(e);
                        this.commit("setCachedChannelsError", true);
                    }
                }
            }
        },
    },
    modules: {},
});
