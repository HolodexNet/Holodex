import type { TlWireMessage } from "./messages.ts"

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- socket.io's own signature
type SocketListener = (...args: any[]) => void

/** The slice of socket.io this needs, which also lets tests stand in for it. */
export interface SocketLike {
  connected: boolean
  connect(): unknown
  emit(event: string, payload: unknown): unknown
  on(event: string, listener: SocketListener): unknown
  off(event: string, listener: SocketListener): unknown
}

export type ConnectionState =
  | { kind: "idle" }
  | { kind: "connected" }
  | { kind: "reconnecting"; attempt: number }
  | { kind: "failed" }

export interface RoomListener {
  onMessage: (message: TlWireMessage) => void
  /** The server accepted the subscription; metadata about the video may follow. */
  onJoined: () => void
  onError: (message: string) => void
  /** The connection came back: fetch whatever was missed while it was down. */
  onConnected: () => void
}

interface SubscribeReply {
  id: string
  lang?: string
  message?: string
}

interface Room {
  videoId: string
  lang: string
  listeners: Set<RoomListener>
  dispatch: (message: TlWireMessage) => void
}

const roomKey = (videoId: string, lang: string) => `${videoId}/${lang}`

/**
 * One socket carries every TL room on the page. Two chats on the same stream
 * and language share a subscription, and it is only given up when the last of
 * them leaves.
 */
export class TlRooms {
  private readonly socket: SocketLike
  private readonly rooms = new Map<string, Room>()
  private readonly connectionListeners = new Set<() => void>()
  private connection: ConnectionState = { kind: "idle" }

  constructor(socket: SocketLike) {
    this.socket = socket
    socket.on("connect", () => {
      this.setConnection({ kind: "connected" })
      for (const room of this.rooms.values()) {
        this.subscribe(room)
        for (const listener of room.listeners) listener.onConnected()
      }
    })
    socket.on("disconnect", () => {
      for (const room of this.rooms.values()) this.unbind(room)
      this.setConnection({ kind: "reconnecting", attempt: 0 })
    })
    socket.on("connect_error", () => {
      if (this.connection.kind !== "reconnecting") {
        this.setConnection({ kind: "failed" })
      }
    })
    socket.on("subscribeSuccess", (reply: SubscribeReply) => {
      for (const room of this.rooms.values()) {
        if (room.videoId !== reply.id) continue
        for (const listener of room.listeners) listener.onJoined()
      }
    })
    socket.on("subscribeError", (reply: SubscribeReply) => {
      for (const room of this.rooms.values()) {
        if (room.videoId !== reply.id) continue
        for (const listener of room.listeners) {
          listener.onError(reply.message ?? "")
        }
      }
    })
  }

  /** Manager-level events; socket.io reports these separately from the socket. */
  reportReconnecting(attempt: number) {
    this.setConnection({ kind: "reconnecting", attempt })
  }

  reportReconnectFailed() {
    this.setConnection({ kind: "failed" })
  }

  join(videoId: string, lang: string, listener: RoomListener): () => void {
    const key = roomKey(videoId, lang)
    let room = this.rooms.get(key)
    if (!room) {
      const listeners = new Set<RoomListener>()
      room = {
        videoId,
        lang,
        listeners,
        dispatch: (message) => {
          for (const member of listeners) member.onMessage(message)
        },
      }
      this.rooms.set(key, room)
      if (this.socket.connected) this.subscribe(room)
    } else if (this.socket.connected) {
      listener.onJoined()
    }
    room.listeners.add(listener)
    if (!this.socket.connected) this.socket.connect()

    return () => {
      const current = this.rooms.get(key)
      if (!current) return
      current.listeners.delete(listener)
      if (current.listeners.size) return
      this.unbind(current)
      this.rooms.delete(key)
      if (this.socket.connected) {
        this.socket.emit("unsubscribe", { video_id: videoId, lang })
      }
    }
  }

  retry() {
    if (!this.socket.connected) this.socket.connect()
  }

  subscribeConnection = (listener: () => void) => {
    this.connectionListeners.add(listener)
    return () => {
      this.connectionListeners.delete(listener)
    }
  }

  getConnection = () => this.connection

  private subscribe(room: Room) {
    const event = roomKey(room.videoId, room.lang)
    this.socket.off(event, room.dispatch)
    this.socket.on(event, room.dispatch)
    this.socket.emit("subscribe", { video_id: room.videoId, lang: room.lang })
  }

  private unbind(room: Room) {
    this.socket.off(roomKey(room.videoId, room.lang), room.dispatch)
  }

  private setConnection(connection: ConnectionState) {
    this.connection = connection
    for (const listener of this.connectionListeners) listener()
  }
}
