/* eslint-disable no-shadow */
import { langs } from "@/plugins/vuetify";

const userLanguage = (navigator.language || navigator.userLanguage || "en").split("-")[0].toLowerCase();

const validLangs = new Set(langs.map((x) => x.val));

const initialState = {
    lang: validLangs.has(userLanguage) ? userLanguage : "en",
    clipLangs: [validLangs.has(userLanguage) ? userLanguage : "en"],
    darkMode: true,
    redirectMode: false,
    autoplayVideo: true,
    canUseWebP: true,
    testedWebP: false,
    nameProperty: "english_name",
    hideThumbnail: false,
    scrollMode: true,
};

export const state = { ...initialState };

const getters = {
    useEnName(state) {
        return state.nameProperty === "english_name";
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
