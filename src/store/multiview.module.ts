/* eslint-disable no-shadow */
import { LayoutItem, getFirstCollision } from "@/external/vue-grid-layout/src/helpers/utils";
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
        let newLayoutItem: LayoutItem;

        // try to find a good location for it:
        let foundGoodSpot = false;
        for (let y = 0; !foundGoodSpot && y < 24; y += 1) {
            for (let x = 0; !foundGoodSpot && x < 24 - 4; x += 1) {
                newLayoutItem = {
                    x,
                    y,
                    w: 4,
                    h: 6,
                    i: state.index,
                    isResizable: true,
                    isDraggable: true,
                };

                const collision = getFirstCollision(state.layout, newLayoutItem);
                if (!collision) {
                    foundGoodSpot = true;
                }
            }
        }

        if (!newLayoutItem)
            newLayoutItem = {
                x: 0,
                y: 0, // puts it at the bottom
                w: 4,
                h: 6,
                i: state.index,
                isResizable: true,
                isDraggable: true,
            };
        state.layout.push(newLayoutItem);
    },
    removeLayoutItem(state, id) {
        const index = state.layout.map((item) => item.i).indexOf(id);
        state.layout.splice(index, 1);
        if (state.layoutContent[id]) Vue.delete(state.layoutContent, id);
    },
    freezeLayoutItem(state, id) {
        const index = state.layout.map((item) => item.i).indexOf(id);
        state.layout[index].isResizable = false;
        state.layout[index].isDraggable = false;
    },
    unfreezeLayoutItem(state, id) {
        const index = state.layout.map((item) => item.i).indexOf(id);
        state.layout[index].isResizable = true;
        state.layout[index].isDraggable = true;
    },
    deleteLayoutContent(state, id) {
        const index = state.layout.map((item) => item.i).indexOf(id);
        Vue.delete(state.layoutContent, id);
    },
    resetState(state) {
        Object.assign(state, JSON.parse(JSON.stringify(initialState)));
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
