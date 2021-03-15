/* eslint-disable no-shadow */
import api from "@/utils/backend-api";
import Vue from "vue";

const initialState = {
    // id: null,
    // video: {
    //     channel: {},
    //     id: null,
    //     title: "Loading...",
    //     description: "",
    // },
    // isLoading: true,
    // hasError: false,
    // comments: [],
    layout: [],
    index: 3,
    layoutContent: {},
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
    fetchComments({ state, commit }) {
        return api.comments(state.id).then(({ data }) => {
            commit("setComments", data);
        });
    },
};

const mutations = {
    setLayout(state, layout) {
        state.layout = layout;
    },
    setLayoutContent(state, payload) {
        const { id, content } = payload;
        Vue.set(state.layoutContent, id, content);
    },
    addLayoutItem(state) {
        state.layout.push({
            x: 0,
            y: 0, // puts it at the bottom
            w: 4,
            h: 6,
            i: state.index,
        });
        // Increment the counter to ensure key is always unique.
        state.index += 1;
    },
    removeLayoutItem(state, id) {
        const index = state.layout.map((item) => item.i).indexOf(id);
        state.layout.splice(index, 1);
    },
    deleteLayoutContent(state, id) {
        Vue.delete(state.layoutContent, id);
    },
    // updateLayoutId(state, id, obj) {
    //     Vue.set(state.layout, )
    // }
    // fetchStart(state) {
    //     state.isLoading = true;
    // },
    // fetchEnd(state) {
    //     state.isLoading = false;
    // },
    // fetchError(state) {
    //     state.hasError = true;
    //     state.isLoading = false;
    // },
    // setId(state, id) {
    //     state.id = id;
    // },
    // setVideo(state, video) {
    //     state.video = video;
    // },
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
