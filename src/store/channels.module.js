/* eslint-disable no-shadow */
import api from "@/utils/backend-api";

const initialState = {
    channels: [],
    isLoading: true,
    hasError: false,
    currentOffset: 0,

    category: 0,
    channelsCategory: 0,
    channelsSort: {
        0: "suborg",
        1: "clip_count",
        2: "subscribers",
    },
    channelsCardView: {
        0: false,
        1: false,
        2: false,
    },
};

export const state = { ...initialState };

const getters = {
    channels(state) {
        return state.channels;
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
    fetchChannels(context, params) {
        context.commit("fetchStart");
        return api
            .live(params)
            .then((res) => {
                context.commit("updateChannels", res);
                context.commit("fetchEnd");
            })
            .catch((e) => {
                console.error(e);
                context.commit("fetchError");
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
    updateChannels(state, channels) {
        state.channels = state.channels.concat(channels);
    },
    // setRecentVideoFilter(state, filter) {
    //     state.recentVideoFilter = filter;
    // },
    // updateVideos(state, videos) {
    //     // increment offset
    //     state.currentOffset += videos.length;
    //     state.videos = state.videos.concat(videos);
    // },
    // resetVideos(state) {
    //     state.currentOffset = 0;
    //     state.videos = [];
    // },
    // resetState(state) {
    //     Object.assign(state, initialState);
    // },
};

export default {
    state,
    getters,
    actions,
    mutations,
};
