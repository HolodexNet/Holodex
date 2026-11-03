import { Manager } from "socket.io-client"

import { TlRooms } from "./rooms"

const RECONNECTION_ATTEMPTS = 10

let rooms: TlRooms | undefined

/** The page's shared connection. Nothing connects until a room is joined. */
export function getTlRooms(): TlRooms {
  if (rooms) return rooms
  const manager = new Manager(window.location.origin, {
    path: "/api/socket.io/",
    transports: ["websocket"],
    upgrade: false,
    reconnectionAttempts: RECONNECTION_ATTEMPTS,
    autoConnect: false,
  })
  const created = new TlRooms(manager.socket("/"))
  manager.on("reconnect_attempt", (attempt) =>
    created.reportReconnecting(attempt)
  )
  manager.on("reconnect_failed", () => created.reportReconnectFailed())
  rooms = created
  return created
}
