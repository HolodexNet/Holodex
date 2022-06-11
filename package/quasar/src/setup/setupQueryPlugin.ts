import type { QueryClientConfig, QueryObserverOptions } from "react-query/types/core";
import type { VueQueryPluginOptions } from "vue-query";
import { QueryClient } from "vue-query";
import { broadcastQueryClient } from './vue-query/broadcastQueryClient'
import { createWebStoragePersistor } from 'react-query/createWebStoragePersistor-experimental'
import { persistQueryClient } from 'react-query/persistQueryClient-experimental'

import { VueQueryDevTools } from "vue-query/devtools";

export const REGULAR_QUERY_OPTIONS: QueryObserverOptions = {
    refetchOnMount: true,
    staleTime: 3 * 60 * 1000, // 3 mins
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
}

export const STATIC_QUERY_OPTIONS: QueryObserverOptions = {
    refetchOnMount: true,
    staleTime: 60 * 60 * 1000, // 1 hr
    cacheTime: 60 * 60 * 1000, // 1 hr
    refetchOnWindowFocus: false,
}


const queryClientConfig: QueryClientConfig = {
    defaultOptions: { queries: REGULAR_QUERY_OPTIONS },
}

export const queryClient = new QueryClient(queryClientConfig);

broadcastQueryClient({ queryClient: queryClient, broadcastChannel: 'hQC' })

if (typeof (Storage) !== "undefined") {
    // Code for localStorage
    const lsPersistor = createWebStoragePersistor({ storage: window.localStorage, key: 'hQCdb' })
    persistQueryClient({ queryClient: queryClient, persistor: lsPersistor, buster: 'v0', maxAge: 1000 * 60 * 60 * 2 })
}

export function getVueQueryPluginOptions(): VueQueryPluginOptions {

    return {
        queryClient: queryClient
    }
}