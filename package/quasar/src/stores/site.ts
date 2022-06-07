
// responsible for site-level globals:

interface Org {
  name: String;
  short?: String;
}

/**
 * Persistent (and X-Tab Shared) Long Term Storage for Site-wide State
 */
interface SiteStatePersistentShared {
  key: number;
  currentOrg: Org;
  starredOrgs: Org[];

  userdata: Any;

  currentGridSize: number;

  firstVisit: boolean;
  shownUpdateDetails: boolean;
  lastShownInstallPrompt: number;
}

interface SiteStateTransient {
  activeSockets: number,
}


export const useSitePersistentSharedStore = defineStore("site", {
  // convert to a function
  state: (): SiteStatePersistentShared => ({
    //TODO impl
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
