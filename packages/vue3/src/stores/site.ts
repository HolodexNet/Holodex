// responsible for site-level globals:

import { User } from "@/hooks/auth/user";

interface Org {
  name: string;
  short?: string;
}
/**
 * Persistent (and X-Tab Shared) Long Term Storage for Site-wide State
 */
interface SiteStatePersistentShared {
  key: number;

  currentOrg: Org;
  starredOrgs: Org[];

  user: User | null;
  jwtToken: string | null;

  guide: {
    firstVisit: boolean;
    shownUpdateDetails: boolean;
    lastShownInstallPrompt: number;
  };
}

/**
 * User roles, such as ADMIN and EDITOR, are used to determine if a user has editor-level access or higher.
 * Actions like logging out, toggling favorite organizations, and shifting organization favorites can be performed on the stored state.
 *
 * In summary, the Global Storage Component is designed to efficiently manage site-wide state, making it easier to handle
 * user-related data, organizational settings, and other key aspects of the application.
 */
export const useSiteStore = defineStore("site", {
  state: (): SiteStatePersistentShared => ({
    key: 0,
    user: null,
    jwtToken: null,
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
  }),
  getters: {
    isEditorOrUp: (state) => {
      const role = state?.user?.role;
      return role === USER_ROLES.EDITOR || role === USER_ROLES.ADMIN;
    },
  },
  actions: {
    logout() {
      this.user = null;
      this.jwtToken = null;
    },
    toggleFavoriteOrg(org: Org) {
      const favIndex = this.starredOrgs.findIndex((x) => x.name === org.name);
      if (favIndex >= 0) {
        this.starredOrgs.splice(favIndex, 1);
      } else {
        this.starredOrgs.push(org);
      }
    },
    shiftOrgFavorites({ org, up = true }: { org: Org; up: boolean }) {
      const favIndex = this.starredOrgs.findIndex((x) => x.name === org.name);
      if (up && favIndex === 0) return;
      if (!up && favIndex === this.starredOrgs.length - 1) return;
      const replaceIndex = up ? favIndex - 1 : favIndex + 1;
      const temp = this.starredOrgs[replaceIndex];
      this.starredOrgs.splice(replaceIndex, 1, org);
      this.starredOrgs.splice(favIndex, 1, temp);
    },
  },
  share: {
    enable: true,
    initialize: true, // when initializing, fetch from another tab.
  },
  persistedState: {
    persist: true,
  },
});
