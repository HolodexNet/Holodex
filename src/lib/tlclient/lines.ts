/**
 * Composing, timing and reconciling the lines a translator sends. Free of React
 * and the DOM so `node --test` can exercise it.
 */
import type { TlMessage } from "../tldex/messages.ts"
import type { ChatRelay, TlRoom } from "./session.ts"

/** Who is talking, as a prefix (and optional suffix) around the line. */
export interface Speaker {
  id: string
  name: string
  prefix: string
  suffix: string
}

/** The default prefix for a speaker, `Name: `. */
export const speakerPrefix = (name: string) =>
  name.trim() ? `${name.trim()}: ` : ""

/** The line as TLdex receives it: the speaker's affixes around the text. */
export function composeLine(body: string, speaker: Speaker | null): string {
  const text = body.trim()
  if (!speaker) return text
  return `${speaker.prefix}${text}${speaker.suffix}`
}

/**
 * The tag that marks a chat message as a translation, so that viewers and
 * TLdex's own listener can recognise it: `[EN] `.
 */
export const defaultChatTag = (lang: string) => `[${lang.toUpperCase()}] `

export function chatLine(line: string, tag: string): string {
  return `${tag}${line}`
}

/** The longest message each chat accepts. */
export const CHAT_LIMITS: Record<ChatRelay["provider"], number> = {
  youtube: 200,
  twitch: 500,
}

/** Counts what the chats count: code points, not UTF-16 units. */
export const chatLength = (text: string) => [...text].length

/**
 * A line is stamped with when the translator started typing it, which is
 * closer to when it was said than when it was sent, so archived subtitles line
 * up with speech. A draft left sitting is not backdated, though.
 */
export const MAX_BACKDATE_MS = 60_000

export function lineTimestamp(
  startedAt: number | null,
  now: number,
  stampOnType: boolean
): number {
  if (!stampOnType || startedAt === null) return now
  const age = now - startedAt
  return age >= 0 && age <= MAX_BACKDATE_MS ? startedAt : now
}

/** Speakers that fit on the number row, after Alt+1 for "no speaker". */
export const MAX_SPEAKERS = 8

/**
 * The number key that picks a slot. Slot 0, "no speaker", sits on 1 at the
 * left of the number row; the speakers follow on 2 to 9.
 */
export const slotKey = (slot: number) => slot + 1

/**
 * The slot a number key picks, or null when no speaker is on it. 0 clears the
 * speaker too, which is where the old client kept it.
 */
export function slotForKey(digit: number, count: number): number | null {
  if (digit <= 1) return 0
  return digit - 1 <= count ? digit - 1 : null
}

/**
 * Speaker slots: 0 is "no speaker", 1..n are the configured speakers. Tab
 * cycles the speakers and skips slot 0, so a dialogue between two people is
 * one key; Shift+Tab goes back the other way.
 */
export function cycleSpeaker(
  current: number,
  count: number,
  direction: 1 | -1
): number {
  if (count === 0) return 0
  if (current === 0) return direction === 1 ? 1 : count
  const next = current + direction
  if (next > count) return 1
  if (next < 1) return count
  return next
}

/**
 * A short name for a participant. Talent names are usually "Family Given", and
 * chat prefixes want the short given name; anything else is used as is.
 */
export function shortSpeakerName(name: string): string {
  const words = name.trim().split(/\s+/)
  return words.length === 2 ? words[1] : name.trim()
}

// -- Delivery ----------------------------------------------------------------

export type DeliveryState = "sending" | "sent" | "failed"

export interface RoomDelivery {
  room: TlRoom
  state: DeliveryState
  /**
   * The id the server answered with. Usually our new message; but TLdex folds
   * a line into an identical one posted within five seconds and answers with
   * that one's id, which may well be another translator's.
   */
  id?: string
  /** The server confirmed that `id` is not ours: there is nothing to change. */
  merged?: boolean
  error?: string
}

/** The languages TLdex accepts posts in; the viewer's list has a few more. */
export const POSTABLE_LANGS = [
  "en",
  "ja",
  "ko",
  "zh",
  "es",
  "ru",
  "id",
  "tl",
  "tc",
]

/** A line this session sent, and where it got to. */
export interface OwnLine {
  localId: string
  /** The room language it was sent in, which edits must repeat. */
  lang: string
  speakerId: string | null
  /** What was typed, without the speaker's affixes. */
  body: string
  /** What TLdex holds now. */
  message: string
  /** Every text this line has had, to recognise older copies of it. */
  texts: string[]
  timestamp: number
  rooms: Record<string, RoomDelivery>
  /** Chats the line was typed into, and those it was too long for. */
  relays: { sent: string[]; tooLong: string[] }
  edited: boolean
  deleted: boolean
  /** An edit or deletion is in flight. */
  busy: boolean
}

export function lineState(line: OwnLine): DeliveryState {
  const states = Object.values(line.rooms).map((delivery) => delivery.state)
  if (states.includes("sending")) return "sending"
  if (states.includes("failed")) return "failed"
  return "sent"
}

/** The copies of a line that edits and deletion can act on. */
export const ownCopies = (line: OwnLine) =>
  Object.values(line.rooms).filter(
    (delivery) => delivery.id && !delivery.merged
  )

/** Edits and deletion act on saved copies, so the line must be saved somewhere. */
export function canChangeLine(line: OwnLine): boolean {
  return (
    !line.deleted &&
    !line.busy &&
    lineState(line) !== "sending" &&
    ownCopies(line).length > 0
  )
}

// -- Feed --------------------------------------------------------------------

export type FeedItem =
  | { kind: "remote"; message: TlMessage; mine: boolean }
  | { kind: "own"; line: OwnLine }

/** Copies of a line come back from the room within this window. */
const ECHO_WINDOW_MS = 2 * 60_000

/**
 * The room's messages with this session's own lines folded in. A line the room
 * has echoed back is shown once, as the local copy, because only that copy can
 * be edited and knows whether it reached every room. Deleted lines hide their
 * echo too.
 */
export function mergeFeed(
  remote: readonly TlMessage[],
  own: readonly OwnLine[],
  username: string | null
): FeedItem[] {
  const byText = new Map<string, OwnLine[]>()
  for (const line of own) {
    for (const text of line.texts) {
      const list = byText.get(text) ?? []
      list.push(line)
      byText.set(text, list)
    }
  }

  const claimed = new Set<OwnLine>()
  const items: FeedItem[] = []
  for (const message of remote) {
    const mine = !!username && message.name === username
    if (mine) {
      const echo = byText
        .get(message.message)
        ?.find(
          (line) =>
            !claimed.has(line) &&
            Math.abs(line.timestamp - message.timestamp) < ECHO_WINDOW_MS
        )
      if (echo) {
        claimed.add(echo)
        continue
      }
    }
    items.push({ kind: "remote", message, mine })
  }
  for (const line of own) {
    if (!line.deleted) items.push({ kind: "own", line })
  }
  return items.sort((a, b) => itemTime(a) - itemTime(b))
}

const itemTime = (item: FeedItem) =>
  item.kind === "remote" ? item.message.timestamp : item.line.timestamp

/** People who translated in the room recently, not counting the viewer. */
export function activeTranslators(
  messages: readonly TlMessage[],
  username: string | null,
  now: number,
  windowMs = 10 * 60_000
): number {
  const names = new Set<string>()
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i]
    if (now - message.timestamp > windowMs) break
    if (message.is_tl && message.name !== username) names.add(message.name)
  }
  return names.size
}
