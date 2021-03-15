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
    layout: [
        { x: 0, y: 0, w: 2, h: 2, i: "0" },
        { x: 2, y: 0, w: 2, h: 4, i: "1" },
        { x: 4, y: 0, w: 2, h: 5, i: "2" },
        { x: 6, y: 0, w: 2, h: 3, i: "3" },
    ],
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
