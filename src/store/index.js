import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";
import createMutationsSharer from "vuex-shared-mutations";
import jwtDecode from "jwt-decode";
import { ORGS } from "@/utils/consts";
import * as icons from "@/utils/icons";

// import { dayjs } from "@/utils/time";

import backendApi from "@/utils/backend-api";
import home from "./home.module";
import channel from "./channel.module";
import channels from "./channels.module";
import library from "./library.module";
import watch from "./watch.module";
import settings from "./settings.module";
import favorites from "./favorites.module";
import music from "./music.module";
import multiview from "./multiview.module";
// import socket from "./socket.module";

Vue.use(Vuex);

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
        navDrawer: false,
        currentOrg: "Hololive",
        currentGridSize: 0,
        // navigation history tracking
        routerHistory: [],

        activeSockets: 0,
    };
}

/**--------------------------------------------
 *               Put Migrations Here
 *---------------------------------------------* */

const syncedModules = /^(?:library|settings)/;
// eslint-disable-next-line max-len
const syncedMutations = /^(?:resetState|setUser|setShowUpdatesDetail|firstVisit|firstVisitMugen|favorites\/setFavorites|favorites\/resetFavorites|favorites\/setLive|music\/(?:addSong|removeSong|resetState|clearPlaylist))/;

export default new Vuex.Store({
    plugins: [
        createPersistedState({
            key: "holodex-v2",
            // eslint-disable-next-line no-unused-vars
            reducer: (state, paths) => {
                const o = { ...state };
                o.music = { ...o.music };
                // don't want to persist router history across tabs/sessions.
                o.routerHistory = [];
                o.activeSockets = 0;
                // o.music.state = MUSIC_PLAYER_STATE.PLAYING; // don't start new tab playing music.
                o.music.isOpen = false; // hide it
                return o;
            },
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
        // login
        setUser(state, { user, jwt }) {
            Vue.set(state.userdata, "user", user);
            state.userdata.jwt = jwt;
        },
        historyPop(state) {
            state.routerHistory.splice(-1, 1);
        },
        historyPush(state, { from }) {
            state.routerHistory.push(from);
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
            if (from) commit("historyPush", { from });
            else commit("historyPop");
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
                }
            }
            // do nothing.
        },
        async loginVerify({ state, dispatch }) {
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
        library,
        watch,
        settings,
        favorites,
        music,
        multiview,
        // socket,
    },
});
