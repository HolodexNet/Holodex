/* eslint-disable no-shadow */
import Vue from "vue";
import { createSimpleMutation, getUILang, getLang } from "@/utils/functions";

const userLanguage = navigator.language || navigator.userLanguage || "en";

const englishNamePrefs = new Set(["en", "es", "fr", "id", "pt", "de", "ru", "it"]);
const lang = getLang(userLanguage);

const initialState = {
    // Language
    lang: getUILang(userLanguage), // UI lang
    clipLangs: [lang],

    // Site
    darkMode: true,
    defaultOpenFavorites: false,

    // Content
    redirectMode: false,
    autoplayVideo: true,
    scrollMode: true,
    hideThumbnail: false,
    nameProperty: englishNamePrefs.has(lang) ? "english_name" : "name",
    hideCollabStreams: false,

    // Live TL Window Settings
    liveTlStickBottom: false,
    liveTlLang: lang,
    liveTlFontSize: 14,
    liveTlShowVerified: true, // show verified messages
    liveTlShowModerator: true, // show moderator messages
    liveTlWindowSize: 0, // Default size, otherwise percentage height

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
};

const actions = {};

const mutations = {
    setDarkMode(state, val) {
        state.darkMode = val;
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
    setScrollMode(state, val) {
        state.scrollMode = val;
    },
    ...createSimpleMutation([
        "defaultOpenFavorites",
        "liveTlStickBottom",
        "liveTlLang",
        "liveTlFontSize",
        "liveTlShowVerified",
        "liveTlShowModerator",
        "liveTlWindowSize",
        "hideCollabStreams",
    ]),
    resetState(state) {
        Object.assign(state, initialState);
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
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
