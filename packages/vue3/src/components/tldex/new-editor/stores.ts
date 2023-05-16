export interface ProfileStore {
  profiles: {
    name: string;
    prefix: string;
    suffix: string;
  }[];
  activeProfileIdx: number;
}

export const useProfileStore = defineStore("profiles", {
  state: (): ProfileStore => {
    const profiles = [
      {
        name: "Default",
        prefix: "",
        suffix: "",
      },
    ];
    const activeProfileIdx = 0;
    return { profiles, activeProfileIdx };
  },
  getters: {
    activeProfile: (state) => {
      return state.profiles[state.activeProfileIdx];
    },
  },
  actions: {
    addProfile(name: string) {
      this.profiles.push({
        name,
        prefix: "",
        suffix: "",
      });
    },
    shiftActiveProfileUp() {
      const prevIndex = this.activeProfileIdx - 1;
      if (prevIndex < 0) return;
      [this.profiles[this.activeProfileIdx], this.profiles[prevIndex]] = [
        this.profiles[prevIndex],
        this.profiles[this.activeProfileIdx],
      ];
      this.activeProfileIdx = prevIndex;
    },
    shiftActiveProfileDown() {
      const nextIndex = this.activeProfileIdx + 1;
      if (nextIndex >= this.profiles.length) return;
      [this.profiles[this.activeProfileIdx], this.profiles[nextIndex]] = [
        this.profiles[nextIndex],
        this.profiles[this.activeProfileIdx],
      ];
      this.activeProfileIdx = nextIndex;
    },
    activeProfileDown() {
      this.activeProfileIdx =
        (this.activeProfileIdx + 1) % this.profiles.length;
    },
    activeProfileUp() {
      this.activeProfileIdx =
        (this.activeProfileIdx - 1) % this.profiles.length;
    },
    deleteProfile(id: number) {
      this.profiles.splice(id, 1);
      if (this.activeProfileIdx >= this.profiles.length) {
        this.activeProfileIdx = this.profiles.length - 1;
      }
    },
  },
  persistedState: {
    persist: true,
  },
  share: {
    enable: false,
  },
});
