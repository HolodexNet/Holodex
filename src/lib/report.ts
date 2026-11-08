/**
 * What a video report says and how it travels. Free of React and the DOM so
 * `node --test` can exercise it.
 *
 * The server (holoapi `POST /v2/reports/video/:id`) relays the fields verbatim
 * into one Discord message, which shapes everything here:
 * - `Reason` and `Comments` must be present, and a comment of 3 characters or
 *   fewer is acknowledged with a 200 and then dropped, so the form must not let
 *   one through.
 * - Discord caps a message's text at about 4000 characters and the server
 *   swallows the rejection, so an oversized report would look sent and vanish.
 *   Comments and mention lists are capped well under that.
 * - Topic ids in backticks are what the moderators' "Quick Change Topic" menu
 *   picks up, so suggested topics keep that form.
 */
import type { ChannelSummary, VideoType } from "./types.ts"

export interface ReportField {
  name: string
  value: string
}

export type ReasonId =
  "topic" | "mentions" | "org" | "quality" | "guidelines" | "other"

export interface ReportReason {
  id: ReasonId
  /** What moderators read and the server routes on; keep these stable. */
  value: string
  /** `component.reportDialog.reasons.N`, already translated in every locale. */
  labelKey: string
  /** The video types it applies to; all of them when absent. */
  types?: readonly VideoType[]
  /** Only offered when the video showed up in a feed for another org. */
  needsOrg?: boolean
}

export const REPORT_REASONS: readonly ReportReason[] = [
  {
    id: "topic",
    value: "Incorrect video topic",
    labelKey: "component.reportDialog.reasons.4",
    types: ["stream", "placeholder", "legacy-placeholder"],
  },
  {
    id: "mentions",
    value: "Incorrect channel mentions",
    labelKey: "component.reportDialog.reasons.5",
  },
  {
    id: "org",
    value: "This video does not belong to the org",
    labelKey: "component.reportDialog.reasons.6",
    needsOrg: true,
  },
  {
    id: "quality",
    value: "Low Quality/Misleading Content",
    labelKey: "component.reportDialog.reasons.1",
    types: ["clip"],
  },
  {
    id: "guidelines",
    value: "Violates the org's derivative work guidelines or inappropriate",
    labelKey: "component.reportDialog.reasons.2",
    types: ["clip"],
  },
  {
    id: "other",
    value: "Other",
    labelKey: "component.reportDialog.reasons.3",
  },
]

export function availableReasons(
  type: VideoType,
  hasOrgContext: boolean
): ReportReason[] {
  return REPORT_REASONS.filter(
    (reason) =>
      (!reason.types || reason.types.includes(type)) &&
      (!reason.needsOrg || hasOrgContext)
  )
}

/**
 * Channels whose videos draw reports about disagreement rather than harm, so
 * the dialog reminds people what a report is for before they write one.
 */
export const DISPUTED_CHANNELS: ReadonlySet<string> = new Set([
  "UCF4-I8ZQL6Aa-iHfdz-B9KQ",
])

export function showDisputeNotice(
  channelId: string,
  type: VideoType,
  reasons: ReadonlySet<ReasonId>
): boolean {
  return (
    DISPUTED_CHANNELS.has(channelId) ||
    (type === "clip" && reasons.has("quality"))
  )
}

/** Shorter than this, the server acknowledges the report and discards it. */
export const COMMENT_MIN = 4
export const COMMENT_MAX = 1000
/** Mentions listed per field; the rest are summarised, to stay under Discord's cap. */
export const MENTION_LIST_MAX = 10
const NAME_MAX = 40

export type CommentIssue = "short" | "long" | "missing" | null

/**
 * A comment is needed unless the report already carries a concrete suggestion,
 * in which case the suggestion speaks for itself. A short one is never sent.
 */
export function commentIssue(
  comment: string,
  hasSuggestion: boolean
): CommentIssue {
  const length = comment.trim().length
  if (length > COMMENT_MAX) return "long"
  if (length === 0) return hasSuggestion ? null : "missing"
  return length < COMMENT_MIN ? "short" : null
}

export interface TopicSuggestion {
  original: string | null
  /** `null` asks for the topic to be removed. */
  suggested: string | null
}

export interface MentionSuggestion {
  add: readonly ChannelSummary[]
  remove: readonly ChannelSummary[]
}

export interface ReportDraft {
  reasons: readonly ReasonId[]
  comment: string
  topic?: TopicSuggestion | null
  mentions?: MentionSuggestion | null
}

export function hasSuggestion(draft: Omit<ReportDraft, "comment">): boolean {
  const topic =
    draft.reasons.includes("topic") &&
    !!draft.topic &&
    draft.topic.suggested !== draft.topic.original
  const mentions =
    draft.reasons.includes("mentions") &&
    !!draft.mentions &&
    draft.mentions.add.length + draft.mentions.remove.length > 0
  return topic || mentions
}

const code = (id: string) => `\`${id.replace(/`/g, "")}\``

function shortName(channel: ChannelSummary): string {
  const name = channel.english_name || channel.name
  return name.length > NAME_MAX ? `${name.slice(0, NAME_MAX - 1)}…` : name
}

function channelList(channels: readonly ChannelSummary[]): string {
  const shown = channels
    .slice(0, MENTION_LIST_MAX)
    .map((channel) => `${shortName(channel)} (${code(channel.id)})`)
  const rest = channels.length - shown.length
  return rest > 0
    ? [...shown, `…and ${rest} more`].join("\n")
    : shown.join("\n")
}

/** No comment, but a suggestion: say so in a way that clears the server's minimum. */
export const SUGGESTION_ONLY_COMMENT =
  "(No comment, see the suggested changes.)"

export function buildReportFields(draft: ReportDraft): ReportField[] {
  const values = REPORT_REASONS.filter((reason) =>
    draft.reasons.includes(reason.id)
  ).map((reason) => reason.value)
  const fields: ReportField[] = [{ name: "Reason", value: values.join("\n") }]

  if (draft.reasons.includes("topic") && draft.topic) {
    const { original, suggested } = draft.topic
    fields.push({
      name: "Original Topic",
      value: original ? code(original) : "None",
    })
    if (suggested !== original)
      fields.push({
        name: "Suggested Topic",
        value: suggested ? code(suggested) : "None",
      })
  }

  if (draft.reasons.includes("mentions") && draft.mentions) {
    if (draft.mentions.remove.length)
      fields.push({
        name: "Remove Mentions",
        value: channelList(draft.mentions.remove),
      })
    if (draft.mentions.add.length)
      fields.push({
        name: "Add Mentions",
        value: channelList(draft.mentions.add),
      })
  }

  const comment = draft.comment.trim().slice(0, COMMENT_MAX)
  fields.push({
    name: "Comments",
    value: comment || SUGGESTION_ONLY_COMMENT,
  })
  return fields
}
