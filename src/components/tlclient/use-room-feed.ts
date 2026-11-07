import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import { useInfiniteQuery } from "@tanstack/react-query"

import { api } from "@/lib/api"
import {
  parseMessage,
  shouldShowLive,
  type TlMessage,
  type TlWireMessage,
} from "@/lib/tldex/messages"
import type { ConnectionState } from "@/lib/tldex/rooms"
import { getTlRooms } from "@/lib/tldex/socket"
import { roomSocketId, type TlRoom } from "@/lib/tlclient/session"
import { useTldex } from "@/stores/tldex"

const PAGE = 50

export interface VideoUpdate {
  status?: string
  start_actual?: string | null
  live_viewers?: number | null
}

export interface RoomFeed {
  messages: TlMessage[]
  loading: boolean
  /** Nothing older is left to load. */
  complete: boolean
  loadOlder: () => void
  connection: ConnectionState
  /** Why the room is not delivering, from the server: ended, refused, ... */
  notice: string | null
  retry: () => void
}

/**
 * The main room as everyone else sees it: recent history, then live messages
 * over the shared TLdex socket. After a reconnect the history is fetched again,
 * since whatever arrived in between was missed; the two are merged by key.
 */
export function useRoomFeed({
  room,
  lang,
  joinable,
  onVideoUpdate,
}: {
  room: TlRoom
  lang: string
  joinable: boolean
  onVideoUpdate?: (update: VideoUpdate) => void
}): RoomFeed {
  const showVerified = useTldex((s) => s.showVerified)
  const showModerator = useTldex((s) => s.showModerator)
  const showVtuber = useTldex((s) => s.showVtuber)
  const socketId = roomSocketId(room)
  const custom = room.kind === "custom"
  const roomId = `${socketId}/${lang}`
  // Live messages, kept per room so that switching rooms starts afresh.
  const [live, setLive] = useState<{ roomId: string; messages: TlMessage[] }>({
    roomId,
    messages: [],
  })
  const [notice, setNotice] = useState<{ roomId: string; text: string } | null>(
    null
  )

  const history = useInfiniteQuery({
    queryKey: [
      "tlclient-history",
      socketId,
      custom,
      lang,
      showVerified,
      showModerator,
      showVtuber,
    ],
    queryFn: ({ pageParam, signal }) =>
      api.chatHistory(
        custom ? "custom" : socketId,
        {
          lang,
          verified: showVerified,
          moderator: showModerator,
          vtuber: showVtuber,
          limit: PAGE,
          before: pageParam,
          custom_video_id: custom ? socketId : undefined,
        },
        signal
      ),
    initialPageParam: undefined as number | undefined,
    // Pages run backwards in time: each is older than the one before.
    getNextPageParam: (page) =>
      page.length < PAGE ? undefined : Number(page[0]?.timestamp),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })

  // Read by socket handlers that outlive a render.
  const latest = useRef({ onVideoUpdate, refetch: history.refetch })
  useEffect(() => {
    latest.current = { onVideoUpdate, refetch: history.refetch }
  })

  const rooms = getTlRooms()
  const connection = useSyncExternalStore(
    rooms.subscribeConnection,
    rooms.getConnection
  )

  useEffect(() => {
    if (!joinable) return
    const id = `${socketId}/${lang}`
    const handle = (message: TlWireMessage) => {
      if (!message.type) {
        const settings = useTldex.getState()
        if (!shouldShowLive(message, new Set(settings.blocked), settings))
          return
        const parsed = parseMessage(message, null)
        parsed.receivedAt = Date.now()
        setLive((current) => ({
          roomId: id,
          messages: [
            ...(current.roomId === id ? current.messages : []),
            parsed,
          ],
        }))
      } else if (message.type === "update") {
        latest.current.onVideoUpdate?.(message as unknown as VideoUpdate)
      } else if (message.type === "end" || message.type === "error") {
        setNotice({ roomId: id, text: message.message || message.type })
      }
    }
    return rooms.join(socketId, lang, {
      onMessage: handle,
      onJoined: () => setNotice(null),
      onError: (text) => setNotice({ roomId: id, text: text || "error" }),
      onConnected: () => void latest.current.refetch(),
    })
  }, [rooms, socketId, lang, joinable])

  const messages = useMemo(() => {
    const seen = new Set<string>()
    const merged: TlMessage[] = []
    const pages = history.data?.pages ?? []
    for (let i = pages.length - 1; i >= 0; i--) {
      for (const row of pages[i]) {
        const parsed = parseMessage(row, null)
        if (seen.has(parsed.key)) continue
        seen.add(parsed.key)
        merged.push(parsed)
      }
    }
    if (live.roomId === roomId) {
      for (const message of live.messages) {
        // A reconnect's history can overlap what the socket already gave.
        if (seen.has(message.key)) continue
        seen.add(message.key)
        merged.push(message)
      }
    }
    return merged.sort((a, b) => a.timestamp - b.timestamp)
  }, [history.data, live, roomId])

  return {
    messages,
    loading: history.isFetching,
    complete: history.isSuccess && !history.hasNextPage,
    loadOlder: () => void history.fetchNextPage(),
    connection,
    notice: notice?.roomId === roomId ? notice.text : null,
    retry: () => rooms.retry(),
  }
}
