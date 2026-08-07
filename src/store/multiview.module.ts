/* eslint-disable no-shadow */
import type { LayoutItem } from "@/external/vue-grid-layout/src/helpers/utils";
import { getFirstCollision } from "@/external/vue-grid-layout/src/helpers/utils";
import {
 getDesktopDefaults, desktopPresets, mobilePresets, decodeLayout,
 generateContentId,
} from "@/utils/mv-utils";
import type { Content } from "@/utils/mv-utils";
import api from "@/utils/backend-api";
import Vue from "vue";
import debounce from "lodash-es/debounce";
import axios from "axios";
import { CHANNEL_URL_REGEX } from "@/utils/consts";
import { checkIOS } from "@/utils/functions";

const initialState = {
    layout: [],
    index: 1,
    layoutContent: {},
    presetLayout: [],
};

const isAppleDevice = navigator?.platform ? checkIOS() : false;

const persistedState = {
    autoLayout: getDesktopDefaults(),
    ytUrlHistory: [],
    twUrlHistory: [],
    // Default true for iOS device
    muteOthers: isAppleDevice,
    defaultShowYtChat: true,
    defaultShowTlChat: false,
    syncOffsets: {},
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

const missingVideoDataFilter = (x) => x.type === "video" && x.video.type !== "twitch" && x.video.id === x.video.channel?.name && !(x?.video?.noData);
const videoIsLiveFilter = (x) => x?.video?.status === "live" || x?.video?.status === "upcoming";
const actions = {
    async fetchVideoData({ state, commit }, options: { refreshLive: boolean } | undefined) {
        // Load missing video data from backend
        const videoIds = new Set<string>(Object.values<Content>(state.layoutContent)
            .filter((x) => missingVideoDataFilter(x) || (options?.refreshLive && videoIsLiveFilter(x)))
            .map((x) => x.video.id));
        console.log("Refreshing video data", videoIds, Object.values(state.layoutContent));
        // Nothing to do
        if (!videoIds.size) return;
        const { data } = await api.videos({
            include: "live_info",
            id: [...videoIds].join(","),
        });
        // Delete all the videos pulled from backend
        data.forEach((video) => {
            videoIds.delete(video.id);
        });
        // Fetch still missing video data from yt's oembed endpoint (only has limited data)
        const results = await Promise.all([...videoIds].map((id) => {
            const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}`;
            return axios.get(url);
        }));
        const dataFromYt = results.map((res) => {
            const { data, config } = res;
            const channel = data.author_url.match(CHANNEL_URL_REGEX);
            const channelId = channel.length >= 2 && channel[1];
            const videoId = config.url.replace("https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=", "");
            return {
                id: videoId,
                title: data.title,
                channel: {
                    name: data.author_name,
                    id: channelId || data.author_name,
                },
            };
        });
        commit("setVideoData", [...data, ...dataFromYt]);
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
        let newLayoutItem: LayoutItem;

        // try to find a good location for it:
        let foundGoodSpot = false;
        for (let y = 0; !foundGoodSpot && y < 24; y += 1) {
            for (let x = 0; !foundGoodSpot && x < 24 - 3; x += 1) {
                newLayoutItem = {
                    x,
                    y,
                    w: 4,
                    h: 6,
                    i: generateContentId(),
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
                i: generateContentId(),
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
        // if (!encodedLayout) return;
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
    setDefaultYtChat(state, value) {
        state.defaultShowYtChat = value;
        if (!value && !state.defaultShowTlChat) {
            state.defaultShowTlChat = true;
        }
    },
    setDefaultTlChat(state, value) {
        state.defaultShowTlChat = value;
        if (!value && !state.defaultShowYtChat) {
            state.defaultShowYtChat = true;
        }
    },
    setVideoData(state, videos) {
        if (!videos) return;
        videos.forEach((video) => {
            Object.values<Content>(state.layoutContent).forEach((x) => {
                if (x.video?.id === video.id) {
                    x.video = video;
                }
            });
        });
        // Mark videos still missing data, so it doesn't attempt to fetch again
        Object.values<Content>(state.layoutContent).filter(missingVideoDataFilter).forEach((x) => { x.video.noData = true; });
    },
    setSyncOffsets(state, { id, value }) {
        Vue.set(state.syncOffsets, id, value);
    },
    swapGridPosition(state, { id1, id2 }) {
        const { x: tX, y: tY, w: tW, h: tH } = state.layout[id1];
        const { x, y, w, h } = state.layout[id2];
        Object.assign(state.layout[id1], { ...state.layout[id1], x, y, w, h });
        Object.assign(state.layout[id2], { ...state.layout[id2], x: tX, y: tY, w: tW, h: tH });
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
