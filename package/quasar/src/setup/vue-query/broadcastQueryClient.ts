import { BroadcastChannel } from 'broadcast-channel'
import { QueryClient } from 'vue-query'

interface BroadcastQueryClientOptions {
    queryClient: QueryClient
    broadcastChannel?: string
}

export function broadcastQueryClient({
    queryClient,
    broadcastChannel = 'react-query',
}: BroadcastQueryClientOptions) {
    let transaction = false
    const tx = (cb: () => void) => {
        transaction = true
        cb()
        transaction = false
    }

    const channel = new BroadcastChannel(broadcastChannel, {
        webWorkerSupport: false,
    })

    const queryCache = queryClient.getQueryCache()

    queryClient.getQueryCache().subscribe(queryEvent => {
        if (!queryEvent) return
        if (transaction) {
            return
        }

        const {
            query: { queryHash, queryKey, state },
        } = queryEvent

        if (queryEvent.type === 'queryUpdated' && queryEvent.action.type === 'success') {
            channel.postMessage({
                type: 'updated',
                queryHash,
                queryKey: JSON.parse(JSON.stringify(queryKey)), // strip proxy
                state: JSON.parse(JSON.stringify(state)), // strip proxy
            })
        }

        if (queryEvent.type === 'queryRemoved') {
            channel.postMessage({
                type: 'removed',
                queryHash,
                queryKey: JSON.parse(JSON.stringify(queryKey)), // strip proxy
            })
        }
    })

    channel.onmessage = action => {
        if (!action?.type) {
            return
        }

        tx(() => {
            const { type, queryHash, queryKey, state } = action

            if (type === 'updated') {
                const query = queryCache.get(queryHash)

                if (query) {
                    query.setState(state)
                    return
                }

                queryCache.build(
                    queryClient,
                    {
                        queryKey,
                        queryHash,
                    },
                    state
                )
            } else if (type === 'removed') {
                const query = queryCache.get(queryHash)

                if (query) {
                    queryCache.remove(query)
                }
            }
        })
    }
}