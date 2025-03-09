/* eslint-disable no-shadow */
import Vue from "vue";
import { createSimpleMutation, getUILang, getLang } from "@/utils/functions";

const userLanguage = navigator.language || navigator.userLanguage || "en";

const englishNamePrefs = new Set(["en", "es", "fr", "id", "pt", "de", "ru", "it"]);
const lang = getLang(userLanguage);

const initialState = {
    // Language
    lang: getUILang(userLanguage), // UI lang
    foolsLang: "",
    clipLangs: [lang],

    // Site
    darkMode: true,
    defaultOpen: "home",

    // Content
    redirectMode: false,
    autoplayVideo: false,
    scrollMode: true,
    hideThumbnail: false,
    hidePlaceholder: false,
    hideMissing: false,
    nameProperty: englishNamePrefs.has(lang) ? "english_name" : "name",
    hideCollabStreams: false,
    hiddenGroups: {},
    ignoredTopics: [],
    // Valid values: "grid" | "list" | "denseList"
    homeViewMode: "grid",
    watchViewReversed: false,

    // Live TL Window Settings
    liveTlStickBottom: false,
    liveTlLang: lang,
    liveTlFontSize: 14,
    liveTlShowVerified: true, // show verified messages
    liveTlShowModerator: true, // show moderator messages
    liveTlShowVtuber: true, // show vtuber messages
    liveTlShowLocalTime: false, // show client local time
    liveTlWindowSize: 0, // Default size, otherwise percentage height
    liveTlShowSubtitle: true, // Show subtitles on videos
    liveTlHideSpoiler: false, // Hide message past current video time
    liveTlBlocked: [],

    blockedChannels: [],

    // Deprecated
    canUseWebP: true,
    testedWebP: false,
};

export const state = { ...initialState };

const getters = {
    useEnName(state) {
        return state.nameProperty === "english_name";
    },
    blockedChannelIDs(state) {
        return new Set(state.blockedChannels.map((x) => x.id));
    },
    liveTlBlockedNames(state) {
        return new Set(state.liveTlBlocked);
    },
    ignoredTopics(state) {
        return new Set(state.ignoredTopics);
    },
};

const actions = {};

const mutations = {
    setDarkMode(state, val) {
        state.darkMode = val;
        localStorage.setItem("darkMode", val ? "true" : "false");
    },
    setRedirectMode(state, val) {
        state.redirectMode = val;
    },
    setAutoplayVideo(state, val) {
        state.autoplayVideo = val;
    },
    noWebPSupport(state) {
        state.canUseWebP = false;
    },
    testedWebP(state) {
        state.testedWebP = true;
    },
    setUseEnName(state, payload) {
        state.nameProperty = payload ? "english_name" : "name";
    },
    setHideThumbnail(state, val) {
        state.hideThumbnail = val;
    },
    setLanguage(state, val) {
        state.lang = val;
    },
    setClipLangs(state, val) {
        state.clipLangs = val;
    },
    setIgnoredTopics(state, val) {
        state.ignoredTopics = val;
    },
    setScrollMode(state, val) {
        state.scrollMode = val;
    },
    ...createSimpleMutation([
        "defaultOpen",
        "liveTlStickBottom",
        "liveTlLang",
        "liveTlFontSize",
        "liveTlShowVerified",
        "liveTlShowModerator",
        "liveTlShowLocalTime",
        "liveTlWindowSize",
        "hideCollabStreams",
        "ignoredTopics",
        "liveTlShowVtuber",
        "liveTlShowSubtitle",
        "liveTlHideSpoiler",
        "hidePlaceholder",
        "hideMissing",
        "homeViewMode",
        "watchViewReversed",
    ]),
    resetState(state) {
        Object.assign(state, initialState);
        localStorage.removeItem("theme");
        localStorage.removeItem("darkMode");
    },
    toggleBlocked(state, channel) {
        // initialize if doesn't exist
        if (!state.blockedChannels) Vue.set(state, "blockedChannels", []);

        // determine to add or subtract:
        if (state.blockedChannels.filter((x) => x.id === channel.id).length > 0) {
            Vue.delete(
                state.blockedChannels,
                state.blockedChannels.findIndex((x) => x.id === channel.id),
            );
        } else {
            state.blockedChannels.push(channel);
        }
    },
    toggleGroupDisplay(state, group) {
        const groupName = `${group.title}`.toLowerCase();
        const orgName = `${group.org}`;
        if (!state.hiddenGroups) Vue.set(state, "hiddenGroups", {});
        if (!state.hiddenGroups[orgName]) Vue.set(state.hiddenGroups, `${orgName}`, []);

        // determine to add or subtract:
        if (state.hiddenGroups[orgName].includes(groupName)) {
            Vue.delete(
                state.hiddenGroups[orgName],
                state.hiddenGroups[orgName].findIndex((x) => x.toLowerCase() === groupName),
            );
        } else {
            state.hiddenGroups[orgName].push(groupName);
        }
    },
    toggleLiveTlBlocked(state, name) {
        if (!state.liveTlBlocked) Vue.set(state, "blockedChannels", []);
        const index = state.liveTlBlocked.indexOf(name);
        if (index !== -1) {
            Vue.delete(state.liveTlBlocked, index);
        } else {
            state.liveTlBlocked.push(name);
        }
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
