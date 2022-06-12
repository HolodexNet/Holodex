
// responsible for site-level globals:

interface Org {
    name: string;
    short?: string;
}

interface User { id: string, role: string, username: string, discord_id?: string, api_key?: string, yt_channel_key?: string, twitter_id?: string, google_id?: string }

interface UserData {
    user: User;
    jwt: string;
}
/**
 * Persistent (and X-Tab Shared) Long Term Storage for Site-wide State
 */
interface SiteStatePersistentShared {
    key: number;
    currentOrg: Org;
    starredOrgs: Org[];

    userdata?: UserData;

    firstVisit: boolean;
    shownUpdateDetails: boolean;
}

interface SiteStateTransient {
    // Socket counter, if it is zero, then close the shared WebSocket
    activeSockets: number;
    // Open/Close main Nav drawer
    navDrawer: boolean;
}


export const useSiteStore = defineStore("site", {
    // convert to a function
    state: (): SiteStatePersistentShared => ({
        //TODO impl
        key: 0,
        currentOrg: { name: "Hololive", short: "Holo" },
        starredOrgs: [
            { name: "All Vtubers", short: "Vtuber" },
            { name: "Hololive", short: "Holo" },
            { name: "Nijisanji", short: "Niji" },
            { name: "Independents", short: "Indie" },
        ],

        firstVisit: true,
        shownUpdateDetails: false
    }),
    getters: {
        // fullName: (state) => `${state.firstName} ${state.lastName}`,
        // loggedIn: (state) => state.userId !== null,
    },
    actions: {
        // no context as first argument, use `this` instead
        // async loadUser(id: number) {
        //   if (this.userId !== null) throw new Error("Already logged in");
        //   const res = await api.user.load(id);
        //   this.updateUser(res);
        // },
        // mutations can now become actions, instead of `state` as first argument use `this`
        // updateUser(payload: State) {
        //   this.firstName = payload.firstName;
        //   this.lastName = payload.lastName;
        //   this.userId = payload.userId;
        // },
        // // easily reset state using `$reset`
        // clearUser() {
        //   this.$reset();
        // },
    },
    share: {
        enable: true,
        initialize: true, // when initializing, fetch from another tab.
    },
    persistedState: {
        persist: true,
    }
});
