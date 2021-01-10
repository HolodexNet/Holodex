import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";
import createMutationsSharer from "vuex-shared-mutations";
import api from "@/utils/backend-api";
import { ORGS } from "@/utils/consts";

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
        showUpdateDetails: false,
        // authorization
        userdata: {
            user: null,
            jwt: null,
        },
        isMobile: true,
        currentOrg: "Hololive",
        // navigation history tracking
        routerHistory: [],
    };
}

/**--------------------------------------------
 *               Put Migrations Here
 *---------------------------------------------* */

export default new Vuex.Store({
    plugins: [
        createPersistedState({
            key: "holodex",
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
                console.info(mutation);
                return !mutation.type.match("^history") && !mutation.type.match("^watch");
            },
        }), // Share all mutations except historyPop/Push across tabs.
    ],
    state: defaultState(),
    getters: {
        isLoggedIn(state) {
            return state.userdata?.jwt;
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
    },
    actions: {
        async navigate({ commit }, { from = undefined }) {
            if (from) commit("historyPush", { from });
            else commit("historyPop");
        },
        async tryUpdatingLive({ state, commit, dispatch }, payload) {
            // will only trigger after user visits the first page that triggers a tryUpdatingLive dispatch.
            // currently only the Home component does this.

            const currentTime = new Date().getTime();
            const firstTimeInvoked = !window.liveDispatchSetup;
            if (firstTimeInvoked) {
                // use a global variable to ensure we generate a single dispatch loop every tab
                window.liveDispatchSetup = true;
                setInterval(() => {
                    dispatch("tryUpdatingLive");
                }, 1000 * 30);
            }

            if (
                firstTimeInvoked ||
                (payload && payload.forced) ||
                currentTime - state.liveLastUpdated >= 1000 * 60 * 5
            ) {
                // only update every 5 minutes
                commit("private_startUpdateLive");
                try {
                    commit("private_setLive", await api.live());
                } catch (err) {
                    console.error(err);
                    commit("private_liveUpdateError", err);
                }
            }
        },
        async logout({ commit }) {
            commit("setUser", { user: null, jwt: null });
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
