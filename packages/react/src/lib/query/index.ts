import {
  experimental_createPersister,
  type PersistedQuery,
  type AsyncStorage,
} from "@tanstack/query-persist-client-core";
import { QueryClient } from "@tanstack/react-query";
import { get, set, del, createStore, type UseStore } from "idb-keyval";

function newIdbStorage(idbStore: UseStore): AsyncStorage<PersistedQuery> {
  return {
    getItem: async (key) => await get(key, idbStore),
    setItem: async (key, value) => await set(key, value, idbStore),
    removeItem: async (key) => await del(key, idbStore),
  };
}

export const globalQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // refetchOnMount: false,
      // refetchOnWindowFocus: false,
      retry: 0,
      staleTime: 120 * 1000, // usually stale after 2 minutes
      gcTime: 1000 * 60 * 60 * 6, // 6 hours garbage collection
      persister: experimental_createPersister<PersistedQuery>({
        storage: newIdbStorage(createStore("holodex_queries", "qskvdb")),
        maxAge: 1000 * 60 * 60 * 12, // 12 hours
        serialize: (persistedQuery) => persistedQuery,
        deserialize: (cached) => cached,
      }),
    },
  },
});
