/* eslint-disable no-shadow */
import Vue from "vue";

const initialState = {
    layout: [],
    index: 1,
    layoutContent: {},
};

export const state = { ...initialState };

const getters = {
    activeVideos(state) {
        return state.layout
            .filter((item) => {
                if (state.layoutContent[item.i] && state.layoutContent[item.i].type === "video") {
                    return true;
                }
                return false;
            })
            .map((item) => state.layoutContent[item.i].content);
    },
};

const actions = {};

const mutations = {
    setLayout(state, layout) {
        state.layout = layout;
    },
    setLayoutContentById(state, payload) {
        const { id, content } = payload;
        Vue.set(state.layoutContent, id, content);
    },
    setLayoutContent(state, content) {
        state.layoutContent = content;
    },
    addLayoutItem(state) {
        // Increment the counter to ensure key is always unique.
        state.index = new Date().getTime();
        state.layout.push({
            x: 0,
            y: 0, // puts it at the bottom
            w: 4,
            h: 6,
            i: state.index,
        });
    },
    removeLayoutItem(state, id) {
        const index = state.layout.map((item) => item.i).indexOf(id);
        state.layout.splice(index, 1);
        if (state.layoutContent[id]) Vue.delete(state.layoutContent, id);
    },
    deleteLayoutContent(state, id) {
        Vue.delete(state.layoutContent, id);
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
