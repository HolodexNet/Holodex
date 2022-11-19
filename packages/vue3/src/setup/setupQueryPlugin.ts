import type {
  QueryClientConfig,
  QueryObserverOptions,
} from "@tanstack/query-core";
import type { VueQueryPluginOptions } from "@tanstack/vue-query";
import { QueryClient } from "@tanstack/vue-query";
import { broadcastQueryClient } from "./vue-query/broadcastQueryClient";
import { createWebStoragePersister } from "./vue-query/createWebStoragePersister";
import { persistQueryClient } from "./vue-query/persistQueryClient";

export const REGULAR_QUERY_OPTIONS: QueryObserverOptions = {
  refetchOnMount: true,
  staleTime: 3 * 60 * 1000, // 3 mins
  cacheTime: 10 * 60 * 1000, // 12 minutes
  refetchOnWindowFocus: false,
  keepPreviousData: false,
};

export const STATIC_QUERY_OPTIONS: QueryObserverOptions = {
  refetchOnMount: true,
  staleTime: 5 * 60 * 1000, // 5 mins
  cacheTime: 60 * 60 * 1000, // 1 hr
  refetchOnWindowFocus: false,
};

const queryClientConfig: QueryClientConfig = {
  defaultOptions: { queries: REGULAR_QUERY_OPTIONS },
};

export const queryClient = new QueryClient(queryClientConfig);

broadcastQueryClient({ queryClient: queryClient, broadcastChannel: "hQC" });

if (typeof Storage !== "undefined") {
  // Code for localStorage
  const lsPersistor = createWebStoragePersister({
    storage: window.localStorage,
    key: "hQCdb",
  });
  persistQueryClient({
    queryClient: queryClient,
    persister: lsPersistor,
    buster: "v0",
    maxAge: 1000 * 60 * 60 * 2,
  });
}

export function getVueQueryPluginOptions(): VueQueryPluginOptions {
  return {
    queryClient: queryClient,
  };
}
