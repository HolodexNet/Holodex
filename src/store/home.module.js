/* eslint-disable no-shadow */
import api from "@/utils/backend-api";

const initialState = {
    live: [],
    videos: [],
    isLoading: true,
    hasError: false,
    currentOffset: 0,
};

const persistState = {
    recentVideoFilter: "all",
};

export const state = {
    ...initialState,
    ...persistState,
};

const getters = {};

const actions = {
    fetchLive({ commit, rootState }, params) {
        commit("fetchStart");
        return api
            .live({
                org: rootState.currentOrg,
                ...params,
            })
            .then((res) => {
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
            .videos({
                offset: state.currentOffset,
                status: "past",
                ...(state.recentVideoFilter !== "all" && { type: state.recentVideoFilter }),
                include: "clips",
                org: rootState.currentOrg,
                lang: rootState.settings.clipLangs.join(","),
                ...params,
            })
            .then(({ data }) => {
                commit("updateVideos", data);
            });
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
    },
    setRecentVideoFilter(state, filter) {
        state.recentVideoFilter = filter;
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
        Object.assign(state, initialState);
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
