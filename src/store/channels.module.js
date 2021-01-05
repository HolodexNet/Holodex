/* eslint-disable no-shadow */
import api from "@/utils/backend-api";
import Vue from "vue";

const initialState = {
    channels: [],
    isLoading: true,
    hasError: false,
    currentOffset: 0,

    // persisted
    category: 0,
    sort: {
        0: "group",
        1: "video_count",
        2: "subscribers",
    },
    cardView: {
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
    fetchNextChannels({ state, commit, rootState }, params) {
        // context.commit("fetchStart");
        return api
            .channels({
                limit: 25,
                offset: state.currentOffset,
                org: rootState.currentOrg,
                ...params,
            })
            .then(({ data }) => {
                console.log(data);
                commit("updateChannels", data);
                // context.commit("fetchEnd");
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
        state.currentOffset += channels.length;
        state.channels = state.channels.concat(channels);
    },
    setCategory(state, category) {
        state.category = category;
    },
    setSort(state, val) {
        Vue.set(state.sort, state.category, val);
    },
    setCardView(state, val) {
        Vue.set(state.cardView, state.category, val);
    },
    // setRecentVideoFilter(state, filter) {
    //     state.recentVideoFilter = filter;
    // },
    // updateVideos(state, videos) {
    //     // increment offset
    //     state.currentOffset += videos.length;
    //     state.videos = state.videos.concat(videos);
    // },
    resetChannels(state) {
        state.currentOffset = 0;
        state.channels = [];
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
