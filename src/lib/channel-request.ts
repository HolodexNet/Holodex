/**
 * What a channel request says and how it travels. Free of React and the DOM.
 *
 * The server (holoapi `POST /v2/reports/channel`) relays the body to the
 * moderators' Discord as-is, which shapes everything here:
 * - It reads the channel URL from `embeds[0].fields[1].value`, so the link is
 *   always the second field, and suppresses the same URL for three days.
 * - It routes on the text "Add a Vtuber" / "add a clipping" in the request
 *   type, so those values are the previous UI's, verbatim.
 * - Discord rejects empty field values and caps each at 1024 characters, and
 *   a rejection still looks like a success, so fields are omitted or capped.
 * Field names match the previous UI too, as moderators are used to them.
 */
import type { ChannelType } from "./types.ts"

export type RequestKind = "vtuber" | "clipper" | "update" | "remove"

export const REQUEST_KINDS: readonly RequestKind[] = [
  "vtuber",
  "clipper",
  "update",
  "remove",
]

export function parseRequestKind(value: string | null): RequestKind | null {
  return REQUEST_KINDS.find((kind) => kind === value) ?? null
}

/** Adding wants a channel Holodex lacks; the others want one it has. */
export const isAddKind = (kind: RequestKind) =>
  kind === "vtuber" || kind === "clipper"

const REQUEST_TYPE_VALUES: Record<RequestKind, string> = {
  vtuber: "Add a Vtuber ▶️ for Holodex to track the channel and clips.",
  clipper: "I'd like to ➕ add a clipping/subbing channel to Holodex.",
  update: "I'd like to modify existing channel",
  remove: "I'd like to delete my channel",
}

/** The languages a clipper's channel can be tagged with. */
export const CHANNEL_LANGS = [
  { text: "English", value: "en" },
  { text: "日本語", value: "ja" },
  { text: "中文", value: "zh" },
  { text: "한국어", value: "ko" },
  { text: "Español", value: "es" },
  { text: "Français", value: "fr" },
  { text: "ไทย", value: "th" },
  { text: "Bahasa Indonesia / Melayu", value: "id" },
  { text: "Русский язык", value: "ru" },
  { text: "Tiếng Việt", value: "vi" },
] as const

// -- What the channel box holds ----------------------------------------------

export type ChannelInput =
  | { kind: "empty" }
  | { kind: "id"; id: string; link: string }
  | { kind: "handle"; handle: string; link: string }
  /** A video, short or stream link rather than the channel's own. */
  | { kind: "video" }
  /** A `/c/` or `/user/` vanity link, which can't be looked up. */
  | { kind: "vanity" }
  /** A link to somewhere that isn't a YouTube channel. */
  | { kind: "invalid" }
  /** Plain text: a name to search Holodex for. */
  | { kind: "name"; query: string }

const CHANNEL_ID = /^UC[\w-]{22}$/
/** YouTube allows letters of any script, digits, `_`, `-` and `.`. */
const HANDLE = /^[\p{L}\p{M}\p{N}._-]{3,30}$/u
const LOOKS_LIKE_URL = /^(?:https?:\/\/)?(?:[\w-]+\.)+[a-z]{2,}(?:[/?#]|$)/i

const channelLink = (id: string) => `https://www.youtube.com/channel/${id}`

const byId = (id: string): ChannelInput =>
  CHANNEL_ID.test(id)
    ? { kind: "id", id, link: channelLink(id) }
    : { kind: "invalid" }

function byHandle(raw: string): ChannelInput {
  let handle = raw
  try {
    handle = decodeURIComponent(raw)
  } catch {
    // keep it as typed
  }
  return HANDLE.test(handle)
    ? { kind: "handle", handle, link: `https://www.youtube.com/@${handle}` }
    : { kind: "invalid" }
}

/**
 * Reads whatever was pasted or typed: a YouTube or Holodex channel link, an
 * `@handle`, a bare `UC…` id, or else a name to search for.
 */
export function parseChannelInput(input: string): ChannelInput {
  const text = input.trim()
  if (!text) return { kind: "empty" }
  if (CHANNEL_ID.test(text)) return byId(text)
  if (text.startsWith("@") && !/\s/.test(text)) {
    const handle = byHandle(text.slice(1))
    // Still typing the first few characters: search by name meanwhile.
    return handle.kind === "handle"
      ? handle
      : { kind: "name", query: text.slice(1) }
  }
  if (/\s/.test(text) || !LOOKS_LIKE_URL.test(text))
    return { kind: "name", query: text }

  let url: URL
  try {
    url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`)
  } catch {
    return { kind: "invalid" }
  }
  const host = url.hostname.toLowerCase().replace(/^(?:www|m)\./, "")
  const [first = "", second = ""] = url.pathname.split("/").filter(Boolean)

  if (host === "youtu.be") return { kind: "video" }
  if (host === "youtube.com" || host === "music.youtube.com") {
    if (first.startsWith("@")) return byHandle(first.slice(1))
    if (first === "channel") return byId(second)
    if (["watch", "shorts", "live", "embed", "playlist"].includes(first))
      return { kind: "video" }
    return first ? { kind: "vanity" } : { kind: "invalid" }
  }
  // A Holodex channel page, from this site or any of its deployments.
  if (/(?:^|\.)holodex\.net$/.test(host) && first === "channel")
    return second.startsWith("@") ? byHandle(second.slice(1)) : byId(second)
  return { kind: "invalid" }
}

/** The key `GET /v2/channels/:id` takes; handles are matched in lower case. */
export function lookupKey(input: ChannelInput): string {
  if (input.kind === "id") return input.id
  if (input.kind === "handle") return `@${input.handle.toLowerCase()}`
  return ""
}

/** What the channel box holds after picking a listed channel. */
export const listedChannelInput = channelLink

// -- The rest of the form ----------------------------------------------------

export interface RequestDetails {
  englishName: string
  lang: string
  org: string
  twitter: string
  contact: string
  comments: string
}

export type DetailField = keyof RequestDetails

export const EMPTY_DETAILS: RequestDetails = {
  englishName: "",
  lang: "",
  org: "",
  twitter: "",
  contact: "",
  comments: "",
}

/** Short answers; with the comment, they stay under Discord's field cap. */
export const SHORT_MAX = 100
export const COMMENT_MAX = 900

/**
 * The fields a request asks for. An update only offers what applies to the
 * channel: a group for VTubers, a language for clippers.
 */
export function requestFields(
  kind: RequestKind,
  channelType?: ChannelType
): DetailField[] {
  switch (kind) {
    case "vtuber":
      return ["englishName", "org", "twitter", "contact", "comments"]
    case "clipper":
      return ["lang", "twitter", "contact", "comments"]
    case "update":
      return [
        "englishName",
        ...(channelType === "subber" ? [] : (["org"] as const)),
        ...(channelType === "vtuber" ? [] : (["lang"] as const)),
        "twitter",
        "contact",
        "comments",
      ]
    case "remove":
      return ["contact", "comments"]
  }
}

/**
 * `@handle` from a handle typed with or without the `@`, or an x.com /
 * twitter.com link; `""` when empty and `null` when it isn't one.
 */
export function normalizeTwitter(input: string): string | null {
  const text = input.trim()
  if (!text) return ""
  const fromUrl =
    /^(?:https?:\/\/)?(?:www\.|mobile\.)?(?:twitter|x)\.com\/@?(\w+)\/?(?:[?#].*)?$/i.exec(
      text
    )?.[1]
  const handle = (fromUrl ?? text).replace(/^@/, "")
  return /^\w{1,15}$/.test(handle) ? `@${handle}` : null
}

export type DetailIssue =
  | "langMissing"
  | "twitterInvalid"
  | "contactMissing"
  | "nothingToChange"
  | "commentsLong"

export function detailIssues(
  kind: RequestKind,
  details: RequestDetails,
  channelType?: ChannelType
): Partial<Record<DetailField, DetailIssue>> {
  const fields = requestFields(kind, channelType)
  const filled = (field: DetailField) =>
    fields.includes(field) && details[field].trim() !== ""
  const issues: Partial<Record<DetailField, DetailIssue>> = {}

  if (kind === "clipper" && !filled("lang")) issues.lang = "langMissing"
  if (filled("twitter") && normalizeTwitter(details.twitter) === null)
    issues.twitter = "twitterInvalid"
  if (kind === "remove" && !filled("contact")) issues.contact = "contactMissing"
  if (details.comments.trim().length > COMMENT_MAX)
    issues.comments = "commentsLong"
  else if (
    kind === "update" &&
    !(["englishName", "org", "lang", "twitter", "comments"] as const).some(
      filled
    )
  )
    issues.comments = "nothingToChange"
  return issues
}

// -- The message -------------------------------------------------------------

export interface RequestField {
  name: string
  value: string
  inline: false
}

export interface ChannelRequestBody {
  content: string
  embeds: {
    title: string
    color: number
    fields: RequestField[]
    footer: { text: string }
  }[]
}

export interface ChannelRequestDraft {
  kind: RequestKind
  /** The channel's YouTube link. */
  link: string
  /** For updates and removals, the listed channel's name, for context. */
  currentName?: string
  channelType?: ChannelType
  details: RequestDetails
}

const cap = (value: string, max: number) => value.trim().slice(0, max)

export function buildChannelRequest(
  draft: ChannelRequestDraft
): ChannelRequestBody {
  const fields = requestFields(draft.kind, draft.channelType)
  const value = (field: DetailField) =>
    fields.includes(field)
      ? cap(
          draft.details[field],
          field === "comments" ? COMMENT_MAX : SHORT_MAX
        )
      : ""
  const entries: [string, string][] = [
    ["Request Type", REQUEST_TYPE_VALUES[draft.kind]],
    ["Channel Link", draft.link],
    [
      "Current Name",
      draft.currentName ? cap(draft.currentName, SHORT_MAX) : "",
    ],
    ["Alternate Channel Name (optional)", value("englishName")],
    ["What language is your channel?", value("lang")],
    ["Twitter Handle (optional)", normalizeTwitter(value("twitter")) ?? ""],
    ["Direct contact", value("contact")],
    [
      "Comments",
      value("org")
        ? `[${value("org")}] ${value("comments")}`.trim()
        : value("comments"),
    ],
  ]
  return {
    content: "Look what the cat dragged in...",
    embeds: [
      {
        title: "Holodex New Subber Request",
        color: 1955806,
        fields: entries
          .filter(([, text]) => text !== "")
          .map(([name, text]) => ({ name, value: text, inline: false })),
        footer: { text: "Holodex UI" },
      },
    ],
  }
}

/** The server's answer to the same channel within three days of a request. */
export const isDuplicateRequest = (status: number, message: string) =>
  status === 400 && /already requested/i.test(message)
