import Vue from "vue";
import Vuex from "vuex";
import dayjs from "dayjs";
import createPersistedState from "vuex-persistedstate";
import api from "@/utils/backend-api";
import { langs } from "@/plugins/vuetify";

Vue.use(Vuex);

function defaultState() {
    const userLanguage = (navigator.language || navigator.userLanguage || "en")
        .split("-")[0]
        .toLowerCase();

    const validLangs = new Set(langs.map(x => x.val));

    return {
        // settings
        lang: validLangs.has(userLanguage) ? userLanguage : "en",
        darkMode: true,
        redirectMode: false,
        canUseWebP: true,
        testedWebP: false,
        nameProperty: "name_en",
        hideThumbnail: false,
        // persisted filters
        // Home
        recentVideoFilter: "all",
        // Favorites
        favoritesVideoFilter: "all",
        // Channels
        channelsCategory: 0,
        channelsSort: {
            0: "group",
            1: "clip_count",
            2: "subscribers",
        },
        channelsCardView: {
            0: false,
            1: false,
            2: false,
        },
        // saves
        favorites: [],
        watchedVideos: {},
        savedVideos: {},
        // channel cache
        cachedChannelsLastUpdated: null,
        cachedChannelsError: false,
        cachedChannels: {},
        // other
        showUpdateDetails: false,
    };
}

function getMinVideoObj(video) {
    const { id, yt_video_key, title, published_at, duration_secs } = video;
    return {
        id,
        yt_video_key,
        title,
        channel: {
            id: video.channel.id,
            name: video.channel.name,
            name_en: video.channel.name_en,
        },
        published_at,
        duration_secs,
        added_at: dayjs().format(),
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
        hasWatched: state => video_id => {
            return Object.prototype.hasOwnProperty.call(
                state.watchedVideos,
                video_id
            );
        },
        hasSaved: state => video_id => {
            return Object.prototype.hasOwnProperty.call(
                state.savedVideos,
                video_id
            );
        },
    },
    mutations: {
        // settings
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
        setUseEnName(state, payload) {
            state.nameProperty = payload ? "name_en" : "name";
        },
        setHideThumbnail(state, val) {
            state.hideThumbnail = val;
        },
        setLanguage(state, val) {
            state.lang = val;
        },
        // persistedFilters
        setRecentVideoFilter(state, payload) {
            state.recentVideoFilter = payload;
        },
        setFavoritesVideoFilter(state, payload) {
            state.favoritesVideoFilter = payload;
        },
        setChannelsCategory(state, payload) {
            state.channelsCategory = payload;
        },
        setChannelsSort(state, payload) {
            Vue.set(state.channelsSort, payload.category, payload.value);
        },
        setChannelsCardView(state, payload) {
            Vue.set(state.channelsCardView, payload.category, payload.value);
        },
        // saves
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
        addWatchedVideo(state, video) {
            Vue.set(state.watchedVideos, video.id, getMinVideoObj(video));
        },
        addSavedVideo(state, video) {
            Vue.set(state.savedVideos, video.id, getMinVideoObj(video));
        },
        removeSavedVideo(state, video_id) {
            Vue.delete(state.savedVideos, video_id);
        },
        // channel cache
        setCachedChannelsError(state, payload) {
            state.cachedChannelsError = payload;
        },
        setCachedChannelsLastUpdated(state, payload) {
            state.cachedChannelsLastUpdated = payload;
        },
        addCachedChannel(state, channel_obj) {
            Vue.set(state.cachedChannels, channel_obj.id, channel_obj);
        },
        removeCachedChannel(state, channel_id) {
            delete state.cachedChannels[channel_id];
        },
        // other
        setShowUpdatesDetail(state, payload) {
            state.showUpdateDetails = payload;
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
