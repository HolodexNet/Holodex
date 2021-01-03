import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";
import createMutationsSharer from "vuex-shared-mutations";
import api from "@/utils/backend-api";
// import { dayjs } from "@/utils/time";

import home from "./home.module";
import channel from "./channel.module";
import channels from "./channels.module";
import settings from "./settings.module";
import library from "./library.module";

Vue.use(Vuex);

function defaultState() {
    return {
        // persisted filters
        // Home
        // recentVideoFilter: "all",
        // Favorites
        favoritesVideoFilter: "all",
        // Channels
        // channelsCategory: 0,
        // channelsSort: {
        //     0: "suborg",
        //     1: "clip_count",
        //     2: "subscribers",
        // },
        // channelsCardView: {
        //     0: false,
        //     1: false,
        //     2: false,
        // },
        // saves
        favorites: [],
        // watchedVideos: {},
        // savedVideos: {},
        // channel cache
        cachedChannelsLastUpdated: null,
        cachedChannelsError: false,
        cachedChannels: {},
        // other
        showUpdateDetails: false,
        // live & live-update-lock
        // live: [],
        // liveLastUpdated: new Date(1000),
        // liveHasError: false,
        // authorization
        userdata: {
            user: null,
            jwt: null,
        },
        // navigation history tracking
        routerHistory: [],
    };
}

// function getMinVideoObj(video) {
//     // eslint-disable-next-line camelcase
//     const { id, yt_video_key, title, published_at, duration_secs } = video;
//     return {
//         id,
//         yt_video_key,
//         title,
//         channel: {
//             id: video.channel.id,
//             name: video.channel.name,
//             name_en: video.channel.name_en,
//         },
//         published_at,
//         duration_secs,
//         added_at: dayjs().format(),
//     };
// }

export default new Vuex.Store({
    plugins: [
        createPersistedState({
            key: "holodex",
        }),
        createMutationsSharer({
            predicate: (mutation /* state */) => {
                console.info(mutation);
                return !mutation.type.match("^history");
            },
        }), // Share all mutations except historyPop/Push across tabs.
    ],
    state: defaultState(),
    getters: {
        // useEnName(state) {
        //     return state.nameProperty === "english_name";
        // },
        // hasWatched: (state) => (videoId) => Object.prototype.hasOwnProperty.call(state.watchedVideos, videoId),
        // hasSaved: (state) => (videoId) => Object.prototype.hasOwnProperty.call(state.savedVideos, videoId),
    },
    mutations: {
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
        addFavorite(state, channelId) {
            if (channelId > 1000) return;
            state.favorites.push(channelId);
        },
        removeFavorite(state, channelId) {
            const index = state.favorites.indexOf(channelId);
            if (index > -1) {
                state.favorites.splice(index, 1);
            }
        },
        // addWatchedVideo(state, video) {
        //     Vue.set(state.watchedVideos, video.id, getMinVideoObj(video));
        // },
        // addSavedVideo(state, video) {
        //     Vue.set(state.savedVideos, video.id, getMinVideoObj(video));
        // },
        // removeSavedVideo(state, videoId) {
        //     Vue.delete(state.savedVideos, videoId);
        // },
        // channel cache
        setCachedChannelsError(state, payload) {
            state.cachedChannelsError = payload;
        },
        setCachedChannelsLastUpdated(state, payload) {
            state.cachedChannelsLastUpdated = payload;
        },
        addCachedChannel(state, channelObj) {
            Vue.set(state.cachedChannels, channelObj.id, channelObj);
        },
        removeCachedChannel(state, channelId) {
            delete state.cachedChannels[channelId];
        },
        // other
        setShowUpdatesDetail(state, payload) {
            state.showUpdateDetails = payload;
        },
        resetState(state) {
            Object.assign(state, defaultState());
        },
        // live & live update lock
        // private_startUpdateLive(state) {
        //     state.liveLastUpdated = new Date().getTime();
        // },
        // private_setLive(state, live) {
        //     state.liveHasError = false;
        //     state.live = live;
        // },
        // private_liveUpdateError(state) {
        //     state.liveHasError = true;
        // },
        // login
        setUser(state, { user, jwt }) {
            Vue.set(state.userdata, "user", user);
            state.userdata.jwt = jwt;
        },
        historyPop(state) {
            state.routerHistory.splice(-1, 1);
        },
        historyPush(state, { from }) {
            state.routerHistory.push(from);
        },
    },
    actions: {
        async navigate({ commit }, { from }) {
            if (from) commit("historyPush", { from });
            else commit("historyPop");
        },
        async updateChannelCache({ commit }) {
            console.log("Channel Cache updated");
            commit("setCachedChannelsLastUpdated", new Date().getTime());
            // const res = await api.channels({
            //     limit: 100,
            //     type: "vtuber",
            // });
            // if (res.data.channels.length) {
            //     res.data.channels.forEach((channel) => {
            //         commit("addCachedChannel", channel);
            //     });
            // }
        },
        async checkChannelCache({ state, dispatch }) {
            const currentTime = new Date().getTime();
            if (
                !state.cachedChannelsLastUpdated ||
                // update every hour
                currentTime - state.cachedChannelsLastUpdated > 1000 * 60 * 60 ||
                // retry every 15 minutes if error
                (state.cachedChannelsError && currentTime - state.cachedChannelsLastUpdated > 1000 * 60 * 15)
            ) {
                this.commit("setCachedChannelsError", false);
                await dispatch("updateChannelCache");
                return;
            }

            // update favorites if missing channels
            for (const id of state.favorites) {
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
        async tryUpdatingLive({ state, commit, dispatch }, payload) {
            // will only trigger after user visits the first page that triggers a tryUpdatingLive dispatch.
            // currently only the Home component does this.

            const currentTime = new Date().getTime();
            const firstTimeInvoked = !window.liveDispatchSetup;
            if (firstTimeInvoked) {
                // use a global variable to ensure we generate a single dispatch loop every tab
                window.liveDispatchSetup = true;
                setInterval(() => {
                    dispatch("tryUpdatingLive");
                }, 1000 * 30);
            }

            if (
                firstTimeInvoked ||
                (payload && payload.forced) ||
                currentTime - state.liveLastUpdated >= 1000 * 60 * 5
            ) {
                // only update every 5 minutes
                commit("private_startUpdateLive");
                try {
                    commit("private_setLive", await api.live());
                } catch (err) {
                    console.error(err);
                    commit("private_liveUpdateError", err);
                }
            }
        },
        async logout({ commit }) {
            commit("setUser", { user: null, jwt: null });
        },
    },
    modules: {
        home,
        channel,
        channels,
        library,
        settings,
    },
});
