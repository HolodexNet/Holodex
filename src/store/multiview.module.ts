/* eslint-disable no-shadow */
import { LayoutItem, getFirstCollision } from "@/external/vue-grid-layout/src/helpers/utils";
import { decodeLayout, getEmptyCells } from "@/utils/mv-layout";
import Vue from "vue";

const initialState = {
    layout: [],
    index: 1,
    layoutContent: {},
    presetLayout: [],
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
        Vue.set(state, "layoutContent", content);
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
    muteLayoutContent(state, { id, value }) {
        if (state.layoutContent[id]) Vue.set(state.layoutContent[id], "muted", value);
    },
    removeLayoutItem(state, id) {
        const index = state.layout.map((item) => item.i).indexOf(id);
        state.layout.splice(index, 1);
        if (state.layoutContent[id]) Vue.delete(state.layoutContent, id);
    },
    freezeLayoutItem(state, id) {
        const index = (state.layout as Array<any>).findIndex((x) => x.i === id);
        Vue.set(state.layout[index], "isResizable", false);
        Vue.set(state.layout[index], "isDraggable", false);
    },
    unfreezeLayoutItem(state, id) {
        const index = (state.layout as Array<any>).findIndex((x) => x.i === id);
        Vue.set(state.layout[index], "isResizable", true);
        Vue.set(state.layout[index], "isDraggable", true);
    },
    deleteLayoutContent(state, id) {
        const index = state.layout.map((item) => item.i).indexOf(id);
        Vue.delete(state.layoutContent, id);
    },
    addPresetLayout(state, content) {
        state.presetLayout.push(content);
    },
    removePresetLayout(state, name) {
        const index = state.presetLayout.findIndex((x) => x.name === name);
        state.presetLayout.splice(index, 1);
    },
    togglePresetAutoLayout(state, name) {
        const index = state.presetLayout.findIndex((x) => x.name === name);
        if (state.presetLayout[index].emptyCells > 0) {
            Vue.set(state.presetLayout[index], "emptyCells", 0);
        } else {
            const decodedPreset = decodeLayout(state.presetLayout[index].layout);
            Vue.set(state.presetLayout[index], "emptyCells", getEmptyCells(decodedPreset));
        }
    },
    resetState(state) {
        Object.assign(state, JSON.parse(JSON.stringify(initialState)), {
            presetLayout: state.presetLayout,
        });
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
