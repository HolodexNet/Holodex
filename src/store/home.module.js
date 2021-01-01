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
    async fetchLive(context, params) {
        context.commit("fetchStart");
        try {
            const res = await api.live(params);
            context.commit("setLive", res);
        } catch (e) {
            console.error(e);
            context.commit("fetchError");
        }
        context.commit("fetchEnd");
    },
    async fetchNextVideos(context, params) {
        const { videos } = await api.videos(params);
        context.commit("updateVideos", videos);
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
        state.videos = state.videos.concat(videos);
    },
};

export default {
    state,
    getters,
    actions,
    mutations,
};
