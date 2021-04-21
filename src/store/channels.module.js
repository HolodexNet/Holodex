/* eslint-disable no-shadow */
// import api from "@/utils/backend-api";
import Vue from "vue";
// import { CHANNEL_TYPES } from "@/utils/consts";

const initialState = {
    channels: [],
    isLoading: true,
    hasError: false,
    currentOffset: 0,
};

const persistState = {
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

export const state = {
    ...initialState,
    ...persistState,
};

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
};

const actions = {
    // fetchNextChannels({ state, commit, rootState }, params) {
    //     // context.commit("fetchStart");
    //     return api
    //         .channels({
    //             limit: 25,
    //             offset: state.currentOffset,
    //             ...(params?.type === CHANNEL_TYPES.VTUBER && { org: rootState.currentOrg }),
    //             ...(params?.type === CHANNEL_TYPES.SUBBER && { lang: rootState.settings.clipLangs.join(",") }),
    //             ...params,
    //         })
    //         .then(({ data }) => {
    //             // console.log(data.length);
    //             commit("updateChannels", data);
    //             // context.commit("fetchEnd");
    //         });
    // },
};

const mutations = {
    updateChannels(state, channels) {
        state.currentOffset += channels.length;
        state.channels = state.channels.concat(channels);
        state.isLoading = false;
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
    resetChannels(state) {
        state.currentOffset = 0;
        state.channels = [];
        state.isLoading = true;
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
