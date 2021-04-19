/* eslint-disable no-shadow */
import api from "@/utils/backend-api";
import { createSimpleMutation } from "@/utils/functions";

const initialState = {
    id: null,
    video: {
        channel: {},
        id: null,
        title: "Loading...",
        description: "",
    },
    isLoading: true,
    hasError: false,
    // comments: [],
};

const persistedState = {
    showTL: false,
    showLiveChat: true,
    theatherMode: false,
};

export const state = { ...initialState, ...persistedState };

const getters = {};

const actions = {
    fetchVideo({ state, commit, rootState }) {
        if (!state.id) return commit("fetchError");

        commit("fetchStart");
        return api
            .video(state.id, rootState.settings.clipLangs.join(","), 1)
            .then(({ data }) => {
                commit("setVideo", data);
                commit("fetchEnd");
            })
            .catch((e) => {
                console.error(e);
                commit("fetchError");
            });
    },
    // fetchComments({ state, commit }) {
    //     return api.comments(state.id).then(({ data }) => {
    //         commit("setComments", data);
    //     });
    // },
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
    ...createSimpleMutation(["showTL", "showLiveChat", "theatherMode"]),
    // setComments(state, comments) {
    //     state.comments = comments;
    // },
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
