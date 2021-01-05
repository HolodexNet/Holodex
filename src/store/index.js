import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";
import createMutationsSharer from "vuex-shared-mutations";
import api from "@/utils/backend-api";
import { ORGS } from "@/utils/consts";
// import { langs } from "@/plugins/vuetify";
// import { dayjs } from "@/utils/time";

import home from "./home.module";
import channel from "./channel.module";
import channels from "./channels.module";
import library from "./library.module";
import watch from "./watch.module";
import settings from "./settings.module";

Vue.use(Vuex);

function defaultState() {
    return {
        favoritesVideoFilter: "all",
        favorites: [],
        cachedChannelsLastUpdated: null,
        cachedChannelsError: false,
        cachedChannels: {},
        // other
        showUpdateDetails: false,
        // authorization
        userdata: {
            user: null,
            jwt: null,
        },
        currentOrg: "hololive",
    };
}

export default new Vuex.Store({
    plugins: [
        createPersistedState({
            key: "holodex",
        }),
        createMutationsSharer({
            predicate: (mutation /* state */) => {
                console.info(mutation);
                return true;
            },
        }), // Share all mutations across tabs.
    ],
    state: defaultState(),
    mutations: {
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
        setCurrentOrg(state, val) {
            if (!ORGS.find((org) => org === val)) return;
            state.currentOrg = val;
        },
        // login
        setUser(state, { user, jwt }) {
            Vue.set(state.userdata, "user", user);
            state.userdata.jwt = jwt;
        },
    },
    actions: {
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
        watch,
        settings,
    },
});
