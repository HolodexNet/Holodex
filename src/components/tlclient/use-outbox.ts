import { useCallback, useState } from "react"
import { toast } from "sonner"

import { api } from "@/lib/api"
import { getT } from "@/lib/i18n"
import {
  CHAT_LIMITS,
  chatLength,
  chatLine,
  composeLine,
  ownCopies,
  type OwnLine,
  type RoomDelivery,
  type Speaker,
} from "@/lib/tlclient/lines"
import {
  relayKey,
  roomKey,
  type ChatRelay,
  type TlRoom,
} from "@/lib/tlclient/session"
import { chatRegistry } from "./chat-registry"

export interface SendRequest {
  lang: string
  body: string
  speaker: Speaker | null
  timestamp: number
  rooms: TlRoom[]
  relays: ChatRelay[]
  chatTag: string
}

/** "merged": none of the line's copies turned out to be ours to change. */
export type EditResult = "ok" | "merged" | "failed"

export interface Outbox {
  lines: OwnLine[]
  send: (request: SendRequest) => void
  retry: (localId: string) => void
  edit: (
    localId: string,
    body: string,
    speaker: Speaker | null
  ) => Promise<EditResult>
  remove: (localId: string) => Promise<void>
}

/** Copies the server said are not ours; edits and deletion leave them be. */
function markMerged(line: OwnLine, merged: RoomDelivery[]): OwnLine {
  if (!merged.length) return line
  const rooms = { ...line.rooms }
  for (const delivery of merged) {
    const key = roomKey(delivery.room)
    rooms[key] = { ...rooms[key], merged: true }
  }
  return { ...line, rooms }
}

const newId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

const errorText = (error: unknown) =>
  error instanceof Error ? error.message : String(error)

/** Failures in a row replace one toast rather than stacking up. */
function reportFailure(error: unknown) {
  toast.error(getT().t("tlClient.errors.sendFailed"), {
    id: "tlclient-send",
    description: errorText(error),
    position: "top-center",
  })
}

/**
 * Lines this session sent, and their delivery to every room. A room that fails
 * leaves the line failed but kept, so the translator can retry rather than
 * retype it; edits and deletion apply to every room that saved a copy.
 */
export function useOutbox(username: string | null): Outbox {
  const [lines, setLines] = useState<OwnLine[]>([])

  const update = useCallback(
    (localId: string, change: (line: OwnLine) => OwnLine) =>
      setLines((current) =>
        current.map((line) => (line.localId === localId ? change(line) : line))
      ),
    []
  )

  const setDelivery = useCallback(
    (localId: string, delivery: RoomDelivery) =>
      update(localId, (line) => ({
        ...line,
        rooms: { ...line.rooms, [roomKey(delivery.room)]: delivery },
      })),
    [update]
  )

  const deliver = useCallback(
    async (
      localId: string,
      room: TlRoom,
      lang: string,
      message: string,
      timestamp: number
    ) => {
      if (!username) return
      setDelivery(localId, { room, state: "sending" })
      try {
        const result = await api.postTranslation(room, lang, {
          name: username,
          message,
          timestamp,
        })
        setDelivery(localId, {
          room,
          state: "sent",
          id: result && typeof result === "object" ? result.id : undefined,
        })
      } catch (error) {
        setDelivery(localId, { room, state: "failed", error: errorText(error) })
        reportFailure(error)
      }
    },
    [username, setDelivery]
  )

  const send = useCallback(
    (request: SendRequest) => {
      const message = composeLine(request.body, request.speaker)
      if (!message) return
      const { lang } = request
      const localId = newId()

      // Chats only take so much; an over-long copy is not sent at all rather
      // than cut mid-sentence or split into pieces TLdex would count twice.
      const chatText = chatLine(message, request.chatTag)
      const sent: string[] = []
      const tooLong: string[] = []
      for (const relay of request.relays) {
        const key = relayKey(relay)
        if (chatLength(chatText) > CHAT_LIMITS[relay.provider])
          tooLong.push(key)
        else if (chatRegistry.relay(key, chatText)) sent.push(key)
      }

      const line: OwnLine = {
        localId,
        lang,
        speakerId: request.speaker?.id ?? null,
        body: request.body.trim(),
        message,
        texts: [message],
        timestamp: request.timestamp,
        rooms: Object.fromEntries(
          request.rooms.map((room) => [
            roomKey(room),
            { room, state: "sending" as const },
          ])
        ),
        relays: { sent, tooLong },
        edited: false,
        deleted: false,
        busy: false,
      }
      setLines((current) => [...current, line])
      for (const room of request.rooms) {
        void deliver(localId, room, lang, message, request.timestamp)
      }
    },
    [deliver]
  )

  const retry = useCallback(
    (localId: string) => {
      const line = lines.find((l) => l.localId === localId)
      if (!line) return
      // Same text, same time: if an earlier attempt did land after all, TLdex
      // folds this one into it rather than storing it twice (catalog rooms).
      for (const delivery of Object.values(line.rooms)) {
        if (delivery.state === "failed")
          void deliver(
            localId,
            delivery.room,
            line.lang,
            line.message,
            line.timestamp
          )
      }
    },
    [lines, deliver]
  )

  const edit = useCallback(
    async (localId: string, body: string, speaker: Speaker | null) => {
      const line = lines.find((l) => l.localId === localId)
      const message = composeLine(body, speaker)
      if (!line || !message) return "failed"
      if (message === line.message) return "ok"
      const copies = ownCopies(line)
      update(localId, (current) => ({ ...current, busy: true }))
      try {
        // Each room says how many rows it changed; 0 means the id was not ours.
        const counts = await Promise.all(
          copies.map((delivery) =>
            api.editTranslation(delivery.room, line.lang, {
              id: delivery.id!,
              message,
              // The route rewrites the time too; keep the original.
              timestamp: line.timestamp,
            })
          )
        )
        const merged = copies.filter((_, i) => counts[i] === 0)
        const changed = counts.some((count) => count > 0)
        update(localId, (current) => ({
          ...markMerged(current, merged),
          ...(changed && {
            body: body.trim(),
            speakerId: speaker?.id ?? null,
            message,
            texts: [...current.texts, message],
            edited: true,
          }),
          busy: false,
        }))
        return changed ? "ok" : "merged"
      } catch (error) {
        update(localId, (current) => ({ ...current, busy: false }))
        toast.error(getT().t("tlClient.errors.editFailed"), {
          description: errorText(error),
          position: "top-center",
        })
        return "failed"
      }
    },
    [lines, update]
  )

  const remove = useCallback(
    async (localId: string) => {
      const line = lines.find((l) => l.localId === localId)
      if (!line) return
      const copies = ownCopies(line)
      update(localId, (current) => ({ ...current, busy: true }))
      try {
        // The delete route does not check whose line an id is, and the id may
        // be another translator's identical line. An edit that changes nothing
        // does check, so only ids it confirms as ours are deleted.
        const owned = await Promise.all(
          copies.map((delivery) =>
            api.editTranslation(delivery.room, line.lang, {
              id: delivery.id!,
              message: line.message,
              timestamp: line.timestamp,
            })
          )
        )
        const mine = copies.filter((_, i) => owned[i] > 0)
        await Promise.all(
          mine.map((delivery) =>
            api.deleteTranslation(delivery.room, delivery.id!)
          )
        )
        if (copies.length && !mine.length) {
          toast.info(getT().t("tlClient.errors.deleteMerged"), {
            position: "top-center",
          })
        }
        update(localId, (current) => ({
          ...current,
          deleted: true,
          busy: false,
        }))
      } catch (error) {
        update(localId, (current) => ({ ...current, busy: false }))
        toast.error(getT().t("tlClient.errors.deleteFailed"), {
          description: errorText(error),
          position: "top-center",
        })
      }
    },
    [lines, update]
  )

  return { lines, send, retry, edit, remove }
}
