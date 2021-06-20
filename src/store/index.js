/* eslint-disable max-len */
import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";
import createMutationsSharer from "vuex-shared-mutations";
import createMigrate from "vuex-persistedstate-migrate";
import jwtDecode from "jwt-decode";
import { ORGS } from "@/utils/consts";
import * as icons from "@/utils/icons";
import { sendTokenToExtension } from "@/utils/messaging";
import kvidb from "kv-idb";

// import { dayjs } from "@/utils/time";

import backendApi from "@/utils/backend-api";
import home from "./home.module";
import channel from "./channel.module";
import channels from "./channels.module";
import watch from "./watch.module";
import settings from "./settings.module";
import favorites from "./favorites.module";
import music from "./music.module";
import multiview from "./multiview.module";
import playlist from "./playlist.module";
import history from "./history.module";

// import socket from "./socket.module";

Vue.use(Vuex);

/**--------------------------------------------
 *               Initial State
 *---------------------------------------------* */

function defaultState() {
    return {
        // other
        firstVisit: true,
        showUpdateDetails: false,
        firstVisitMugen: true,
        lastShownInstallPrompt: 0,

        TPCookieEnabled: false,
        TPCookieAlertDismissed: false,

        // authorization
        userdata: {
            user: null,
            jwt: null,
        },
        isMobile: true,
        currentGridSize: 0,

        currentOrg: "Hololive",
        orgFavorites: ["All Vtubers", "Hololive", "Nijisanji", "Independents"],

        // Migration: prevent migrating initial state.
        migration: { version: 4 },

        // Socket counter, if it is zero, then close the shared WebSocket
        activeSockets: 0,

        // MainNav Extension slot for tabs on mobile
        showExtension: false,
        // Open/Close Nav drawer
        navDrawer: false,

        // Shared video card dots menu, teleports around
        videoCardMenu: null,
        showVideoCardMenu: false,
        // Global report video dialog
        reportVideo: null,
    };
}

/**--------------------------------------------
 *               Put Migrations Here
 *---------------------------------------------* */

const migrations = [
    {
        version: 2,
        // migrate old defaultOpenFavorites boolean => defaultOpen enum value.
        up: (state) => {
            const defaultOpen =
                state.settings.defaultOpen || (state.settings.defaultOpenFavorites ? "favorites" : "home");

            return {
                ...state,
                settings: {
                    ...state.settings,
                    defaultOpen,
                    autoplayVideo: false,
                },
            };
        },
    },
    {
        // deletion of VWP and Hanayori org.
        version: 4,
        up: (state) => {
            const orgFavorites = state.orgFavorites.filter(
                (v) => v !== "Virtual Witch Phenomenon" && v !== "Hanayori Joshiryo",
            );
            return {
                ...state,
                orgFavorites,
            };
        },
    },
    {
        version: 5,
        // migrates library -->
        up: (state) => {
            const mergedPlaylist = state.playlist && state.playlist.active ? state.playlist.active.videos || [] : [];

            for (const property in state.library.savedVideos) {
                if (property.length === 11)
                    // yt video
                    mergedPlaylist.push(state.library.savedVideos[property]);
            }

            const db = kvidb("watch-history");
            for (const property in state.library.watchedVideos) {
                if (property.length === 11)
                    // yt video
                    db.put(property, 1, (x, err) => {
                        console.log(x, err);
                    });
            }

            delete state.library;

            return {
                ...state,
                playlist: {
                    ...state.playlist,
                    active: {
                        ...state.playlist.active,
                        videos: mergedPlaylist,
                    },
                },
            };
        },
    },
];

/**-----------------------
 *     Configure Synchronized Modules & Mutations across tabs
 *------------------------* */
const syncedModules = /^(?:playlist|settings)/;
const syncedMutations =
    /^(?:resetState|setUser|setShowUpdatesDetail|firstVisit|firstVisitMugen|favorites\/setFavorites|favorites\/resetFavorites|favorites\/setLive|music\/(?:addSong|removeSong|resetState|clearPlaylist)|multiview\/(?:addPresetLayout|removePresetLayout|togglePresetAutoLayout))/;

export default new Vuex.Store({
    plugins: [
        createPersistedState({
            key: "holodex-v2",
            // eslint-disable-next-line no-unused-vars
            reducer: (state, paths) => {
                const o = { ...state };
                o.music = { ...o.music };
                o.activeSockets = 0;
                // o.music.state = MUSIC_PLAYER_STATE.PLAYING; // don't start new tab playing music.
                o.music.isOpen = false; // hide it
                o.reportVideo = null;
                o.videoCardMenu = null;
                return o;
            },
            getState: createMigrate(migrations, "migration.version"),
        }),
        createMutationsSharer({
            predicate: (mutation /* state */) => {
                // console.info(mutation);
                return mutation.type.match(syncedModules) || mutation.type.match(syncedMutations); // channel & channels
            },
        }), // Share all mutations except historyPop/Push across tabs.
    ],
    state: defaultState(),
    getters: {
        isLoggedIn(state) {
            return state.userdata?.jwt;
        },
        gridIcon(state) {
            switch (state.currentGridSize) {
                case 1:
                    return icons.mdiGrid;
                case 2:
                    return icons.mdiSquareOutline;
                default:
                    return icons.mdiGridLarge;
            }
        },
    },
    mutations: {
        // other
        setShowUpdatesDetail(state, payload) {
            state.showUpdateDetails = payload;
        },
        resetState(state) {
            Object.assign(state, defaultState());
        },
        setCurrentOrg(state, val) {
            if (!ORGS.find((org) => org === val)) return;
            state.currentOrg = val;
        },
        setIsMobile(state, val) {
            state.isMobile = val;
        },
        setNavDrawer(state, val) {
            state.navDrawer = val;
        },
        setReportVideo(state, val) {
            state.reportVideo = val;
        },
        // login
        setUser(state, { user, jwt }) {
            Vue.set(state.userdata, "user", user);
            state.userdata.jwt = jwt;
        },
        setVisited(state) {
            state.firstVisit = false;
        },
        setVisitedMugen(state) {
            state.firstVisitMugen = false;
        },
        setCurrentGridSize(state, size) {
            state.currentGridSize = size;
        },
        installPromptShown(state) {
            state.lastShownInstallPrompt = new Date().getTime();
        },
        incrementActiveSockets(state) {
            state.activeSockets += 1;
        },
        decrementActiveSockets(state) {
            state.activeSockets -= 1;
        },
        setTPCookieEnabled(state, enabled) {
            state.TPCookieEnabled = enabled;
        },
        setTPCookieAlertDismissed(state, dismissed) {
            state.TPCookieAlertDismissed = dismissed;
        },
        setShowExtension(state, show) {
            state.showExtension = show;
        },
        setVideoCardMenu(state, obj) {
            state.videoCardMenu = obj;
        },
        setShowVideoCardMenu(state, show) {
            state.showVideoCardMenu = show;
        },
        toggleFavoriteOrg(state, org) {
            const favIndex = state.orgFavorites.indexOf(org);
            if (favIndex >= 0) {
                state.orgFavorites.splice(favIndex, 1);
            } else {
                state.orgFavorites.push(org);
            }
        },
        shiftOrgFavorites(state, { org, up = true }) {
            const favIndex = state.orgFavorites.indexOf(org);
            if (up && favIndex === 0) return;
            if (!up && favIndex === state.orgFavorites.length - 1) return;
            const replaceIndex = up ? favIndex - 1 : favIndex + 1;
            const temp = state.orgFavorites[replaceIndex];
            state.orgFavorites.splice(replaceIndex, 1, org);
            state.orgFavorites.splice(favIndex, 1, temp);
        },
    },
    actions: {
        checkActiveSockets({ state }) {
            const context = this;
            setTimeout(() => {
                if (state.activeSockets === 0) {
                    // eslint-disable-next-line no-underscore-dangle
                    context._vm.$socket.client.disconnect();
                }
            }, 10000);
        },
        async navigate({ commit }, { from = undefined }) {
            if (from) {
                commit("historyPush", { from });
            } else {
                commit("historyPop");
            }
        },
        async logout({ dispatch, commit }) {
            commit("setUser", { user: null, jwt: null });
            dispatch("favorites/resetFavorites");
        },
        async loginCheck({ state, dispatch }) {
            if (state.userdata.jwt) {
                const { exp } = jwtDecode(state.userdata.jwt);
                const dist = exp - Date.now() / 1000;
                console.log(`Login token expiring in ${dist} s`);
                if (dist < 0) {
                    // already expired
                    await dispatch("logout");
                } else {
                    sendTokenToExtension(state.userdata.jwt);
                }
            }
            // do nothing.
        },
        async loginVerify({ state, dispatch }) {
            dispatch("loginCheck");
            if (state.userdata && state.userdata.jwt) {
                const valid = await backendApi.loginIsValid(state.userdata.jwt);
                if (valid) {
                    console.log("Login credentials validated, OK");
                } else {
                    await dispatch("logout");
                }
            }
        },
        // eslint-disable-next-line no-unused-vars
        async reloadCurrentPage({ commit }, consumed) {
            return consumed;
        },
    },
    modules: {
        home,
        channel,
        channels,
        watch,
        settings,
        favorites,
        music,
        multiview,
        playlist,
        history,
        // socket,
    },
});
