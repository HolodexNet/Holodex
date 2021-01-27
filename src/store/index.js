import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";
import createMutationsSharer from "vuex-shared-mutations";
import { ORGS } from "@/utils/consts";
import * as icons from "@/utils/icons";

// import { dayjs } from "@/utils/time";

import home from "./home.module";
import channel from "./channel.module";
import channels from "./channels.module";
import library from "./library.module";
import watch from "./watch.module";
import settings from "./settings.module";
import favorites from "./favorites.module";

Vue.use(Vuex);

function defaultState() {
    return {
        // other
        firstVisit: true,
        showUpdateDetails: false,
        firstVisitMugen: true,
        // authorization
        userdata: {
            user: null,
            jwt: null,
        },
        isMobile: true,
        currentOrg: "Hololive",
        currentGridSize: 0,
        // navigation history tracking
        routerHistory: [],
    };
}

/**--------------------------------------------
 *               Put Migrations Here
 *---------------------------------------------* */

const syncedModules = /^(?:library|settings|favorites|home)/;
const syncedMutations = /^(?:resetState|setUser|setCurrentOrg|setShowUpdatesDetail)/;

export default new Vuex.Store({
    plugins: [
        createPersistedState({
            key: "holodex-v2",
            // eslint-disable-next-line no-unused-vars
            reducer: (state, paths) => {
                const o = { ...state };
                // don't want to persist router history across tabs/sessions.
                o.routerHistory = [];

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
    },
    actions: {
        async navigate({ commit }, { from = undefined }) {
            if (from) commit("historyPush", { from });
            else commit("historyPop");
        },
        async logout({ dispatch, commit }) {
            commit("setUser", { user: null, jwt: null });
            dispatch("favorites/resetFavorites");
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
    },
});
