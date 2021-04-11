/* eslint-disable no-shadow */
import api from "@/utils/backend-api";
import Vue from "vue";
import { debounce } from "@/utils/functions";
import fdequal from "fast-deep-equal";

const initialState = {
    live: [],
    videos: [],
    isLoading: true,
    hasError: false,
    currentOffset: 0,

    stagedFavorites: {},
    lastLiveUpdate: 0,
};
const persistState = {
    favorites: [],
    recentVideoFilter: "all",
};

export const state = {
    ...initialState,
    ...persistState,
};

const getters = {
    isFavorited: (state) => (channelId) => {
        return (
            state.stagedFavorites[channelId] === "add" ||
            (state.favorites.find((f) => f.id === channelId) && state.stagedFavorites[channelId] !== "remove")
        );
    },
};

const actions = {
    fetchFavorites({ commit, rootState, state, dispatch }) {
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
    fetchLive({ state, commit, rootState }, { force = false, minutes = 2 }) {
        if (!(rootState.userdata && rootState.userdata.jwt)) return null; // don't update.
        if (force || !state.lastLiveUpdate || Date.now() - state.lastLiveUpdate > minutes * 60 * 1000) {
            commit("fetchStart");
            return api
                .favoritesLive({
                    // last_update: "2021-01-07T18:31:22-08:00",
                    channels: state.favorites.map((f) => f.id).join(","),
                })
                .then((res) => {
                    // console.log(res);
                    commit("setLive", res);
                    commit("fetchEnd");
                })
                .catch((e) => {
                    console.error(e);
                    commit("fetchError");
                });
        }
        return null;
    },
    fetchNextVideos({ state, commit, rootState, dispatch }, params) {
        return api
            .favoritesVideos(rootState.userdata.jwt, {
                offset: state.currentOffset,
                status: "past",
                ...(state.recentVideoFilter !== "all" && { type: state.recentVideoFilter }),
                include: "clips",
                lang: rootState.settings.clipLangs.join(","),
                ...params,
            })
            .catch((e) => {
                console.error(e);
                dispatch("loginVerify", null, { root: true }); // check if the user is actually logged in.
            })
            .then(({ data }) => {
                commit("updateVideos", data);
            });
    },
    // eslint-disable-next-line no-unused-vars
    updateFavorites: debounce(({ state, commit, dispatch, rootState }) => {
        const operations = Object.keys(state.stagedFavorites).map((key) => {
            return {
                op: state.stagedFavorites[key],
                channel_id: key,
            };
        });
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
                } else {
                    throw new Error("Error while adding favorite");
                }
            })
            .finally(() => commit("clearStagedFavorites"));
    }, 2000),
    async resetFavorites({ dispatch, commit, rootState }) {
        commit("resetVideos");
        commit("resetState");
        if (rootState.userdata && rootState.userdata.jwt) await dispatch("fetchFavorites");
        if (rootState.userdata && rootState.userdata.jwt) await dispatch("fetchLive", { force: true });
        else commit("setFavorites", []);
    },
};

const mutations = {
    fetchStart(state) {
        state.isLoading = true;
    },
    fetchEnd(state) {
        state.isLoading = false;
    },
    fetchError(state) {
        state.hasError = true;
    },
    setLive(state, live) {
        state.live = live;
        state.lastLiveUpdate = Date.now();
    },
    setRecentVideoFilter(state, filter) {
        state.recentVideoFilter = filter;
    },
    setFavorites(state, favorites) {
        state.favorites = favorites;
    },
    updateVideos(state, videos) {
        // increment offset
        state.currentOffset += videos.length;
        state.videos = state.videos.concat(videos);
    },
    resetVideos(state) {
        state.currentOffset = 0;
        state.videos = [];
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
