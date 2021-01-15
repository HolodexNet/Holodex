/* eslint-disable no-shadow */
import api from "@/utils/backend-api";

const initialState = {
    id: null,
    video: {},
    isLoading: true,
    hasError: false,
};

export const state = { ...initialState };

const getters = {};

const actions = {
    fetchVideo({ state, commit }) {
        if (!state.id) return commit("fetchError");

        commit("fetchStart");
        return api
            .video(state.id)
            .then(({ data }) => {
                commit("setVideo", data);
                commit("fetchEnd");
            })
            .catch((e) => {
                console.error(e);
                commit("fetchError");
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
    setVideo(state, video) {
        state.video = video;
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
