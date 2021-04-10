/* eslint-disable no-shadow */
import Vue from "vue";
import { langs } from "@/plugins/vuetify";
import { TL_LANGS } from "@/utils/consts";

const userLanguage = (navigator.language || navigator.userLanguage || "en").split("-")[0].toLowerCase();

const validLangs = new Set(langs.map((x) => x.val));
const validTlLangs = new Set(TL_LANGS.map((x) => x.value));

const englishNamePrefs = new Set(["en", "es", "fr", "id", "pt", "de", "ru", "it"]);

const initialState = {
    lang: validLangs.has(userLanguage) ? userLanguage : "en",
    clipLangs: [validTlLangs.has(userLanguage) ? userLanguage : "en"],
    darkMode: true,
    defaultOpenFavorites: false,
    redirectMode: false,
    autoplayVideo: true,
    canUseWebP: true,
    testedWebP: false,
    nameProperty: englishNamePrefs.has(userLanguage) ? "english_name" : "name",
    hideThumbnail: false,
    scrollMode: true,

    liveTlStickBottom: false,
    liveTlLang: validTlLangs.has(userLanguage) ? userLanguage : "en",

    blockedChannels: [],
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
    setLiveTlStickBottom(state, val) {
        state.liveTlStickBottom = val;
    },
    setLiveTlLang(state, val) {
        state.liveTlLang = val;
    },
    setDefaultOpenFavorites(state, val) {
        state.defaultOpenFavorites = val;
    },
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
