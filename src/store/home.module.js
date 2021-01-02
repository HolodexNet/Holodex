/* eslint-disable no-shadow */
import api from "@/utils/backend-api";

const initialState = {
    live: [],
    videos: [],
    isLoading: true,
    hasError: false,
    currentOffset: 0,
    recentVideoFilter: "all",
};

export const state = { ...initialState };

const getters = {
    live(state) {
        return state.live;
    },
    videos(state) {
        return state.videos;
    },
    isLoading(state) {
        return state.isLoading;
    },
    hasError(state) {
        return state.hasError;
    },
    currentOffset(state) {
        return state.currentOffset;
    },
    recentVideoFilter(state) {
        return state.recentVideoFilter;
    },
};

const actions = {
    fetchLive({ commit }, params) {
        commit("fetchStart");
        return api
            .live(params)
            .then((res) => {
                commit("setLive", res);
                commit("fetchEnd");
            })
            .catch((e) => {
                console.error(e);
                commit("fetchError");
            });
    },
    fetchNextVideos({ state, commit }, params) {
        return api
            .videos({
                offset: state.currentOffset,
                status: "past",
                ...(state.recentVideoFilter !== "all" && { type: state.recentVideoFilter }),
                ...params,
            })
            .then((res) => {
                commit("updateVideos", res.data.videos);
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
        // console.log("set");
        state.live = live;
        // console.log(live);
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
    state,
    getters,
    actions,
    mutations,
};
