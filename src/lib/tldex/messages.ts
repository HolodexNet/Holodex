/** Translated chat messages from TLdex, as the API and socket deliver them. */

export interface TlWireMessage {
  name: string
  message: string
  timestamp: number | string
  /** Control frames have a type; ordinary messages do not. */
  type?: string
  channel_id?: string | null
  duration?: number | string | null
  is_tl?: boolean
  is_owner?: boolean
  is_vtuber?: boolean
  is_moderator?: boolean
  is_verified?: boolean
}

export type TlToken =
  { kind: "text"; text: string } | { kind: "emoji"; src: string; alt: string }

export interface TlMessage extends Omit<TlWireMessage, "timestamp" | "type"> {
  key: string
  timestamp: number
  /** Milliseconds after the video's scheduled start. */
  relativeMs: number
  tokens: TlToken[]
  /** Live messages only: when it arrived, to pace subtitle display. */
  receivedAt?: number
}

export interface TlFilterSettings {
  showVerified: boolean
  showModerator: boolean
  showVtuber: boolean
}

/** `:HUMU:https://<url>`, the way the backend writes custom emoji. */
const EMOJI =
  /(\S+?)(https:\/\/(?:yt\d+\.ggpht\.com\/[a-zA-Z0-9_\-=/]+-c-k-nd|www\.youtube\.com\/[a-zA-Z0-9_\-=/]+\.svg))/gi

/**
 * Splits a message into text and emoji images. Only the URL shapes matched above
 * ever become an image, so a message can never inject anything into the page.
 */
export function tokenizeMessage(message: string): TlToken[] {
  const tokens: TlToken[] = []
  let cursor = 0
  for (const match of message.matchAll(EMOJI)) {
    if (match.index > cursor) {
      tokens.push({ kind: "text", text: message.slice(cursor, match.index) })
    }
    tokens.push({ kind: "emoji", src: match[2], alt: match[1] })
    cursor = match.index + match[0].length
  }
  if (cursor < message.length) {
    tokens.push({ kind: "text", text: message.slice(cursor) })
  }
  return tokens
}

export function parseMessage(
  wire: TlWireMessage,
  startMs: number | null
): TlMessage {
  const timestamp = Number(wire.timestamp)
  return {
    ...wire,
    timestamp,
    relativeMs: startMs ? timestamp - startMs : 0,
    key: `${wire.name}${timestamp}${wire.message}`,
    tokens: tokenizeMessage(wire.message),
  }
}

/** Which people's messages a live room should show, per the viewer's choices. */
export function shouldShowLive(
  message: TlWireMessage,
  blocked: ReadonlySet<string>,
  settings: TlFilterSettings
): boolean {
  if (blocked.has(message.name)) return false
  return Boolean(
    message.is_tl ||
    message.is_owner ||
    (message.is_vtuber && settings.showVtuber) ||
    (message.is_moderator && settings.showModerator) ||
    (message.is_verified && settings.showVerified)
  )
}

/** How long a line of subtitle stays up. */
export function displayMs(message: TlMessage): number {
  return Number(message.duration) || message.message.length * 65 + 1800
}

/** The latest messages still within their display time, on a live stream. */
export function liveSubtitles(
  messages: readonly TlMessage[],
  startMs: number | null,
  now: number
): TlMessage[] {
  if (!startMs) return []
  const elapsed = now - startMs
  return messages.slice(-2).filter((message) => {
    const shownAt = message.receivedAt
      ? message.receivedAt - startMs
      : message.relativeMs
    return elapsed >= shownAt && elapsed < shownAt + displayMs(message)
  })
}

/** Index of the message current at `ms` into the video, or 0. */
export function activeMessageIndex(
  messages: readonly TlMessage[],
  ms: number
): number {
  let low = 0
  let high = messages.length - 1
  let found = 0
  while (low <= high) {
    const mid = (low + high) >> 1
    if (messages[mid].relativeMs <= ms) {
      found = mid
      low = mid + 1
    } else {
      high = mid - 1
    }
  }
  return found
}

/** The current and previous messages, if they are still within display time. */
export function archiveSubtitles(
  messages: readonly TlMessage[],
  index: number,
  ms: number
): TlMessage[] {
  const start = Math.max(index - 1, 0)
  return messages
    .slice(start, start + 2)
    .filter(
      (message) =>
        ms >= message.relativeMs && ms < message.relativeMs + displayMs(message)
    )
}

/** Runs of messages from one person only show the name on the first. */
export function showsAuthor(
  messages: readonly TlMessage[],
  index: number
): boolean {
  return index === 0 || messages[index].name !== messages[index - 1].name
}

/** Rooms open 15 minutes before a stream; earlier joins would simply fail. */
export function canJoinRoom(
  status: string | undefined,
  startScheduled: string | number | null | undefined,
  now: number
): boolean {
  if (!status || status === "live") return true
  if (!startScheduled) return true
  return now >= new Date(startScheduled).getTime() - 15 * 60_000
}
