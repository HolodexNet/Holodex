/* eslint-disable no-shadow */
import api from "@/utils/backend-api";

const initialState = {
    id: null,
    channel: {},
    videos: [],
    currentOffset: 0,
    isLoading: true,
    hasError: false,
};

export const state = { ...initialState };

const getters = {
    // channels(state) {
    //     return state.channels;
    // },
    // isLoading(state) {
    //     return state.isLoading;
    // },
    // hasError(state) {
    //     return state.hasError;
    // },
    // currentOffset(state) {
    //     return state.currentOffset;
    // },
    // recentVideoFilter(state) {
    //     return state.recentVideoFilter;
    // },
};

const actions = {
    fetchChannel({ state, commit }) {
        if (!state.id) return commit("fetchError");

        commit("fetchStart");
        return api
            .channel(state.id)
            .then(({ data }) => {
                console.log("test");
                commit("setChannel", data);
                commit("fetchEnd");
            })
            .catch((e) => {
                console.error(e);
                commit("fetchError");
            });
    },
    fetchNextVideos({ state, commit }, { type, params }) {
        return api
            .channelVideos(state.id, {
                type,
                query: {
                    ...params,
                    offset: state.currentOffset,
                    include: "clips",
                },
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
        state.isLoading = false;
    },
    setId(state, id) {
        state.id = id;
    },
    setChannel(state, channel) {
        state.channel = channel;
    },
    updateVideos(state, videos) {
        // increment offset
        state.currentOffset += videos.length;
        state.videos = state.videos.concat(videos);
    },
    resetVideos(state) {
        console.log("rest");
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
