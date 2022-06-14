import { KVSIndexedDB, kvsIndexedDB } from "@kvs/indexeddb";

try { indexedDB.deleteDatabase('kvidb'); } catch (e) {
    console.debug("Trying to clean up old kvidb, probably already gone.")
}
//migrating old db.

let storage: KVSIndexedDB<Record<string, number>> | undefined = undefined;

(async () => storage = await kvsIndexedDB<Record<string, number>>({
    name: "watch-history",
    version: 1,
}))();

type State = { time: number }
export const useWatchHistoryStore = defineStore("watchHistory", {
    // convert to a function
    state: (): State => {
        return {
            time: Date.now()
        }
    },
    getters: {
        hasWatched: (state) => ([state.time
            , (async (videoId: string) => {
                return storage?.get(videoId)
            })]as const)[1],
    },
    actions: {
        async addWatchedVideo(videoId: string) {
            await storage?.set(videoId, 1);
            this.time = Date.now();
        },
        resetWatchHistory() {
            storage?.dropInstance();
        },
    },
    share: {
        enable: false,
    },
    persistedState: {
        persist: false,
    }
});