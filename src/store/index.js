/* eslint-disable func-names */
import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";
import createMutationsSharer from "vuex-shared-mutations";
import createMigrate from "vuex-persistedstate-migrate";
import jwtDecode from "jwt-decode";
import { sendTokenToExtension } from "@/utils/messaging";

// import { dayjs } from "@/utils/time";

import backendApi from "@/utils/backend-api";
import debounce from "lodash-es/debounce";
import home from "./home.module";
import channel from "./channel.module";
import channels from "./channels.module";
import watch from "./watch.module";
import settings from "./settings.module";
import favorites from "./favorites.module";
import multiview from "./multiview.module";
import playlist from "./playlist.module";
import history from "./history.module";
import orgs from "./orgs.module";
import { migrations, VUEX_STATE_VERSION } from "./migrations";
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

        // authorization
        userdata: {
            user: null,
            jwt: null,
        },
        isMobile: true,
        currentGridSize: 0,

        currentOrg: { name: "Hololive", short: "Holo" },
        orgFavorites: [
            { name: "All Vtubers", short: "Vtuber" },
            { name: "Hololive", short: "Holo" },
            { name: "Nijisanji", short: "Niji" },
            { name: "Independents", short: "Indie" },
        ],

        // Migration: prevent migrating initial state.
        migration: { version: VUEX_STATE_VERSION },

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

        // Document.visiblityState (eg. backgrounded)
        visibilityState: null,
    };
}

/**-----------------------
 *     Configure Synchronized Modules & Mutations across tabs
 *------------------------* */
const syncedModules = /^(?:playlist|settings|history)/;
const syncedMutations = new Set(["resetState", "setUser", "setShowUpdatesDetail", "firstVisit", "firstVisitMugen", "favorites/setFavorites", "favorites/resetFavorites", "favorites/setLive", "multiview/addPresetLayout", "multiview/removePresetLayout", "multiview/togglePresetAutoLayout", "multiview/setAutoLayout"]);

const persistedPaths = ["orgs", "playlist", "settings", "history", "migration", "multiview", "channels.cardView", "channels.sort", "currentOrg", "favorites.favorites", "lastShownInstallPrompt", "firstVisit", "firstVisitMugen", "orgFavorites", "showUpdateDetails", "userdata", "watch.showLiveChat", "watch.showTL", "watch.theaterMode", "currentGridSize"];
export default new Vuex.Store({
    plugins: [
        createPersistedState({
            key: "holodex-v2",
            paths: persistedPaths,
            getState: createMigrate(migrations, "migration.version"),
            setState: debounce((key, state, storage) => {
                storage.setItem(key, JSON.stringify(state));
                // wait next tick
            }),
        }),
        createMutationsSharer({
            predicate: (mutation /* state */) => mutation.type.match(syncedModules) || syncedMutations.has(mutation.type), // channel & channels
        }), // Share all mutations except historyPop/Push across tabs.
    ],
    state: defaultState(),
    getters: {
        isLoggedIn(state) {
            return state.userdata?.jwt;
        },
        isSuperuser(state) {
            const role = state.userdata?.user?.role;
            return role === "admin" || role === "editor";
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
            // if (!ORGS.find((org) => org === val)) return;
            state.currentOrg = val;
            state.home.lastLiveUpdate = 0;
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
            const favIndex = state.orgFavorites.findIndex((x) => x.name === org.name);
            if (favIndex >= 0) {
                state.orgFavorites.splice(favIndex, 1);
            } else {
                state.orgFavorites.push(org);
            }
        },
        shiftOrgFavorites(state, { org, up = true }) {
            const favIndex = state.orgFavorites.findIndex((x) => x.name === org.name);
            if (up && favIndex === 0) return;
            if (!up && favIndex === state.orgFavorites.length - 1) return;
            const replaceIndex = up ? favIndex - 1 : favIndex + 1;
            const temp = state.orgFavorites[replaceIndex];
            state.orgFavorites.splice(replaceIndex, 1, org);
            state.orgFavorites.splice(favIndex, 1, temp);
        },
        setVisiblityState(state, val) {
            state.visibilityState = val;
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
                    // Set cookie for all holodex sub domains
                    document.cookie = `HOLODEX_JWT=${state.userdata.jwt};expires=${(new Date(exp * 1000)).toUTCString()};domain=.holodex.net;path=/`;
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
        multiview,
        playlist,
        history,
        orgs,
        // socket,
    },
});
