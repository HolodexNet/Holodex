interface PersistedStore {
  persist: {
    getOptions: () => { name?: string }
    rehydrate: () => Promise<void> | void
  }
}

/**
 * Keeps a persisted store consistent between open tabs: changing a setting,
 * the organization or the login in one tab applies to the others.
 */
export function syncAcrossTabs(store: PersistedStore) {
  window.addEventListener("storage", (event) => {
    if (event.storageArea !== localStorage) return
    if (event.key !== store.persist.getOptions().name) return
    void store.persist.rehydrate()
  })
}
