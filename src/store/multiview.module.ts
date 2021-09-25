/* eslint-disable no-shadow */
import type { LayoutItem } from "@/external/vue-grid-layout/src/helpers/utils";
import { getFirstCollision } from "@/external/vue-grid-layout/src/helpers/utils";
import {
 getDesktopDefaults, desktopPresets, mobilePresets, decodeLayout,
} from "@/utils/mv-utils";
import type { Content } from "@/utils/mv-utils";
import api from "@/utils/backend-api";
import Vue from "vue";
import debounce from "lodash-es/debounce";

const initialState = {
    layout: [],
    index: 1,
    layoutContent: {},
    presetLayout: [],
};

const isAppleDevice = navigator?.platform ? ["iPhone", "iPad", "iPod"].includes(navigator.platform) : false;

const persistedState = {
    autoLayout: getDesktopDefaults(),
    ytUrlHistory: [],
    twUrlHistory: [],
    // Default true for iOS device
    muteOthers: isAppleDevice,
};
export const state = { ...initialState, ...persistedState };

const getters = {
    nonChatCellCount(state) {
        return state.layout.reduce((a, c) => a + ((!state.layoutContent[c.i] || state.layoutContent[c.i]?.type === "video") ? 1 : 0), 0);
    },
    activeVideos(state) {
        return state.layout
            .filter((item) => state.layoutContent[item.i] && state.layoutContent[item.i].type === "video")
            .map((item) => state.layoutContent[item.i].video);
    },
    decodedCustomPresets(state) {
        return state.presetLayout.map((preset) => ({
            ...preset,
            ...decodeLayout(preset.layout),
        }));
    },
    decodedDesktopPresets() {
        return desktopPresets.map((preset) => ({
            ...preset,
            ...decodeLayout(preset.layout),
        }));
    },
    decodedMobilePresets() {
        return mobilePresets.map((preset) => ({
            ...preset,
            ...decodeLayout(preset.layout),
        }));
    },
    desktopGroups(state, getters) {
        const groups = [];
        const seen = new Set();
        const customId = new Set(getters.decodedCustomPresets.map((p) => p.id));
        getters.decodedCustomPresets.concat(getters.decodedDesktopPresets).forEach((preset) => {
            if (seen.has(preset.id)) return;
            seen.add(preset.id);
            if (customId.has(preset.id)) preset.custom = true;
            if (!groups[preset.videoCellCount]) groups[preset.videoCellCount] = [];
            groups[preset.videoCellCount].push(preset);
        });
        return groups;
    },
};

const actions = {
    fetchVideoData({ state, commit }) {
        // Load missing video data from backend
        const videoIds = new Set<string>(Object.values<Content>(state.layoutContent)
            .filter((x) => x.type === "video" && x.video.type !== "twitch" && x.video.id === x.video.channel?.name && !(x?.video?.noData))
            .map((x) => x.video.id));
        if (videoIds.size) {
            api
                .videos({
                    include: "live_info",
                    id: [...videoIds].join(","),
                })
                .then(({ data }) => {
                    commit("setVideoData", data);
                })
                .catch((e) => {
                    console.error(e);
                });
        }
    },
};

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
            for (let x = 0; !foundGoodSpot && x < 24 - 3; x += 1) {
                console.log(x, Math.min(24 - x, 4));
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

        if (!newLayoutItem || !foundGoodSpot) {
            newLayoutItem = {
                x: 0,
                y: 24, // puts it at the bottom
                w: 4,
                h: 6,
                i: state.index,
                isResizable: true,
                isDraggable: true,
            };
        }
        state.layout.push(newLayoutItem);
    },
    setLayoutContentWithKey(state, { id, key, value }) {
        if (state.layoutContent[id]) Vue.set(state.layoutContent[id], key, value);
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
        Vue.delete(state.layoutContent, id);
    },
    addPresetLayout(state, content) {
        state.presetLayout.push(content);
    },
    removePresetLayout(state, name) {
        const index = state.presetLayout.findIndex((x) => x.name === name);
        state.presetLayout.splice(index, 1);
    },
    resetState(state) {
        Object.assign(state, JSON.parse(JSON.stringify(initialState)), {
            presetLayout: state.presetLayout,
        });
    },
    setAutoLayout(state, { index, encodedLayout }) {
        if (!encodedLayout) return;
        Vue.set(state.autoLayout, index, encodedLayout);
    },
    resetAutoLayout(state) {
        state.autoLayout = getDesktopDefaults();
    },
    addUrlHistory(state, { twitch = false, url }) {
        const history = (twitch ? state.twUrlHistory : state.ytUrlHistory);
        if (history.length >= 8) history.shift();
        history.push(url);
    },
    setMuteOthers(state, val) {
        state.muteOthers = val;
        // Setting is set to true, flip all but one to muted
        if (val) {
            Object.keys(state.layoutContent)
            .filter((key) => state.layoutContent[key]?.type === "video")
            .forEach((key, index) => {
                Vue.set(state.layoutContent[key], "muted", index !== 0);
            });
        }
    },
    muteOthers: debounce((state, currentKey) => {
        if (!state.muteOthers) return;
        Object.keys(state.layoutContent).forEach((key) => {
            if (key === `${currentKey}`) {
                Vue.set(state.layoutContent[key], "muted", false);
                return;
            }
            if (state.layoutContent[key]?.type === "video") {
                Vue.set(state.layoutContent[key], "muted", true);
            }
        });
    }, 0, { trailing: true }),
    setVideoData(state, videos) {
        if (!videos) return;
        videos.forEach((video) => {
            Object.values<Content>(state.layoutContent).forEach((x) => {
                if (x.video?.id === video.id) {
                    x.video = video;
                }
            });
        });
        Object.values<Content>(state.layoutContent).forEach((x) => {
            if (x.type === "video" && x.video.type !== "twitch" && x.video.id === x.video.channel?.name && !x.video.noData) {
                x.video.noData = true;
            }
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
