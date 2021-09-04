/* eslint-disable no-shadow */
import api from "@/utils/backend-api";
import { sendFavoritesToExtension, sendTokenToExtension } from "@/utils/messaging";
import Vue from "vue";
import debounce from "lodash-es/debounce";
import fdequal from "fast-deep-equal";

const initialState = {
    live: [],
    isLoading: true,
    hasError: false,

    stagedFavorites: {},
    lastLiveUpdate: 0,
};
const persistState = {
    favorites: [],
};

export const state = {
    ...initialState,
    ...persistState,
};

const getters = {
    isFavorited: (state) => (channelId) => state.stagedFavorites[channelId] === "add"
        || (state.favorites.find((f) => f.id === channelId) && state.stagedFavorites[channelId] !== "remove"),
    favoriteChannelIDs: (state) => new Set(state?.favorites?.map((f) => f.id) || []),
};

const actions = {
    fetchFavorites({
 commit, rootState, state, dispatch,
}) {
        return api
            .favorites(rootState.userdata.jwt)
            .then((res) => {
                if (!fdequal(res.data, state.favorites)) commit("setFavorites", res.data);
            })
            .catch((e) => {
                console.error(e);
                dispatch("loginVerify", null, { root: true }); // check if the user is actually logged in.
            });
    },
    fetchLive({
 state, commit, rootState, dispatch,
}, { force = false, minutes = 2 }) {
        if (!(rootState.userdata && rootState.userdata.jwt) || (rootState.visibilityState === "hidden" && !force)) {
            return null;
        } // don't update.
        if (
            state.hasError
            || force
            || !state.lastLiveUpdate
            || Date.now() - state.lastLiveUpdate > minutes * 60 * 1000
        ) {
            commit("fetchStart");
            return api
                .favoritesLive(rootState.userdata.jwt)
                .then((res) => {
                    res.sort((a, b) => {
                        if (a.available_at === b.available_at) {
                            return a.id - b.id;
                        }
                        const dateA = new Date(a.available_at).getTime();
                        const dateB = new Date(b.available_at).getTime();
                        return dateA - dateB;
                    });
                    commit("setLive", res);
                    commit("fetchEnd");
                })
                .catch((e) => {
                    dispatch("loginCheck", null, { root: true });
                    console.error(e);
                    commit("fetchError");
                });
        }
        commit("resetErrors");
        return null;
    }, // eslint-disable-next-line no-unused-vars
    updateFavorites: debounce(({
 state, commit, dispatch, rootState,
}) => {
        const operations = Object.keys(state.stagedFavorites).map((key) => ({
            op: state.stagedFavorites[key],
            channel_id: key,
        }));
        return api
            .patchFavorites(rootState.userdata.jwt, operations)
            .catch((e) => {
                console.error(e);
                dispatch("loginVerify", null, { root: true }); // check if the user is actually logged in.
            })
            .then((res) => {
                if (res.status === 200) {
                    // console.log("success");
                    commit("setFavorites", res.data);
                    dispatch("fetchLive", { force: true });
                    sendFavoritesToExtension(res.data);
                } else {
                    throw new Error("Error while adding favorite");
                }
            })
            .finally(() => commit("clearStagedFavorites"));
    }, 2000),
    async resetFavorites({ dispatch, commit, rootState }) {
        commit("resetState");
        if (rootState.userdata && rootState.userdata.jwt) {
            await dispatch("fetchFavorites");
            sendTokenToExtension(rootState.userdata.jwt);
        }
        if (rootState.userdata && rootState.userdata.jwt) {
            await dispatch("fetchLive", { force: true });
        } else {
            commit("setFavorites", []);
            sendTokenToExtension(null);
        }
    },
};

const mutations = {
    fetchStart(state) {
        state.isLoading = true;
        state.hasError = false;
    },
    fetchEnd(state) {
        state.isLoading = false;
        state.hasError = false;
    },
    fetchError(state) {
        state.hasError = true;
        state.isLoading = false;
    },
    setLive(state, live) {
        state.live = live;
        state.lastLiveUpdate = Date.now();
    },
    setFavorites(state, favorites) {
        state.favorites = favorites;
    },
    resetErrors(state) {
        state.hasError = false;
        state.isLoading = false;
    },
    resetState(state) {
        // state.hasError = false;
        // state.isLoading = true;
        Object.assign(state, initialState);
    },
    clearStagedFavorites(state) {
        state.stagedFavorites = {};
    },
    toggleFavorite(state, channelId) {
        if (state.stagedFavorites[channelId]) {
            Vue.delete(state.stagedFavorites, channelId);
            return;
        }
        // console.log(state.favorites.find((f) => f.id === channelId));
        if (state.favorites.find((f) => f.id === channelId)) {
            Vue.set(state.stagedFavorites, channelId, "remove");
        } else {
            Vue.set(state.stagedFavorites, channelId, "add");
        }
        // console.log(state.stagedFavorites);
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
