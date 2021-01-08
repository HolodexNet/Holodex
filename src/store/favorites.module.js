/* eslint-disable no-shadow */
import api from "@/utils/backend-api";
import Vue from "vue";
import { debounce } from "@/utils/functions";

const initialState = {
    favorites: [],

    live: [],
    videos: [],
    isLoading: true,
    hasError: false,
    currentOffset: 0,
    recentVideoFilter: "all",

    stagedFavorites: {},
    // lastLiveUpdate: "2021-01-07T18:31:22-08:00",
};

export const state = { ...initialState };

const getters = {
    isFavorited: (state) => (channelId) => {
        return state.favorites.find((f) => f.id === channelId) || state.stagedFavorites[channelId] === "add";
    },
};

const actions = {
    fetchFavorites({ commit, rootState }) {
        return api
            .favorites(rootState.userdata.jwt)
            .then((res) => {
                commit("setFavorites", res.data);
            })
            .catch((e) => {
                console.error(e);
            });
    },
    fetchLive({ state, commit }) {
        commit("fetchStart");
        return api
            .favoritesLive({
                // last_update: "2021-01-07T18:31:22-08:00",
                channels: state.favorites.map((f) => f.id).join(","),
            })
            .then((res) => {
                console.log(res);
                commit("setLive", res);
                commit("fetchEnd");
            })
            .catch((e) => {
                console.error(e);
                commit("fetchError");
            });
    },
    fetchNextVideos({ state, commit, rootState }, params) {
        return api
            .favoritesVideos(rootState.userdata.jwt, {
                offset: state.currentOffset,
                status: "past",
                ...(state.recentVideoFilter !== "all" && { type: state.recentVideoFilter }),
                include: "clips",
                ...params,
            })
            .then(({ data }) => {
                commit("updateVideos", data);
            });
    },
    updateFavorites: debounce(({ state, commit, rootState }) => {
        const operations = Object.keys(state.stagedFavorites).map((key) => {
            return {
                op: state.stagedFavorites[key],
                channel_id: key,
            };
        });

        return api
            .patchFavorites(rootState.userdata.jwt, operations)
            .then((res) => {
                console.log(res);
                if (res.status === 200) {
                    console.log("success");
                    commit("setFavorites", res.data);
                } else {
                    throw new Error("Error while adding favorite");
                }
            })
            .finally(() => commit("clearStagedFavorites"));
    }, 2000),
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
    resetLive(state) {
        // state.currentOffset = 0;
        state.hasError = false;
        state.live = [];
    },
    resetVideos(state) {
        state.currentOffset = 0;
        state.videos = [];
    },
    // resetState(state) {
    //     Object.assign(state, initialState);
    // },
    clearStagedFavorites(state) {
        state.stagedFavorites = {};
    },
    toggleFavorite(state, channelId) {
        if (state.stagedFavorites[channelId]) {
            Vue.delete(state.stagedFavorites, channelId);
            return;
        }

        if (!state.favorites.includes[channelId]) {
            Vue.set(state.stagedFavorites, channelId, "add");
        } else {
            Vue.set(state.stagedFavorites, channelId, "remove");
        }
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
