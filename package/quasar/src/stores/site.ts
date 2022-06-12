
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

    guide: {
        firstVisit: boolean;
        shownUpdateDetails: boolean;
        lastShownInstallPrompt: number;
    }

    /**
     * Settings are directly modified and read.
     */
    settings: {
        redirectMode: boolean,
        autoplayVideo: boolean,
        scrollMode: boolean,
        hideThumbnail: boolean,
        hidePlaceholder: boolean,
        hideCollabStreams: boolean,
        ignoredTopics: string[],
        blockedChannels: [],
        homeViewMode: "grid" | "list" | "denseList",
        gridDensity: 0 | 1 | 2,
    }
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

        guide: {
            firstVisit: true,
            shownUpdateDetails: false,
            lastShownInstallPrompt: 0,
        },

        settings: {
            redirectMode: false,
            autoplayVideo: false,
            scrollMode: false,
            hideThumbnail: false,
            hidePlaceholder: false,
            hideCollabStreams: false,
            ignoredTopics: [],
            blockedChannels: [],
            homeViewMode: "grid",
            gridDensity: 0,
        }
    }),
    getters: {
        isEditorOrUp: (state) => {
            const role = state.userdata?.user?.role
            return role === USER_ROLES.EDITOR || role === USER_ROLES.ADMIN
        },
    },
    actions: {
    },
    share: {
        enable: true,
        initialize: true, // when initializing, fetch from another tab.
    },
    persistedState: {
        persist: true,
    }
});
