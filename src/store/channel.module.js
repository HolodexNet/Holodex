/* eslint-disable no-shadow */
import api from "@/utils/backend-api";

const initialState = {
    id: null,
    channel: {},
    videos: [],
    currentOffset: 0,
    total: 1,
    isLoading: true,
    hasError: false,
};

export const state = { ...initialState };

const getters = {};

const actions = {
    fetchChannel({ state, commit }) {
        if (!state.id) return commit("fetchError");

        commit("fetchStart");
        return api
            .channel(state.id)
            .then(({ data }) => {
                commit("setChannel", data);
                commit("fetchEnd");
            })
            .catch((e) => {
                console.error(e);
                commit("fetchError");
            });
    },
    fetchNextVideos({ state, commit, rootState }, { type, params }) {
        return api
            .channelVideos(state.id, {
                type,
                query: {
                    lang: rootState.settings.clipLangs.join(","),
                    offset: state.currentOffset,
                    include: "clips,live_info",
                    ...params,
                },
            })
            .then(({ data }) => {
                commit("setTotal", Number(data.total));
                commit("updateVideos", data.items);
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
    setTotal(state, count) {
        state.total = count;
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
