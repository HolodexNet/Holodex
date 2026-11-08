import assert from "node:assert/strict"
import test from "node:test"

import {
  availableReasons,
  buildReportFields,
  COMMENT_MAX,
  commentIssue,
  hasSuggestion,
  MENTION_LIST_MAX,
  showDisputeNotice,
  SUGGESTION_ONLY_COMMENT,
} from "../src/lib/report.ts"

const field = (fields, name) => fields.find((f) => f.name === name)?.value
const channel = (n) => ({ id: `UC${n}`, name: `Talent ${n}` })

test("reasons: clips get clip reasons, streams get topic, org needs a feed", () => {
  const ids = (type, org) => availableReasons(type, org).map((r) => r.id)
  assert.deepEqual(ids("stream", false), ["topic", "mentions", "other"])
  assert.deepEqual(ids("clip", false), [
    "mentions",
    "quality",
    "guidelines",
    "other",
  ])
  assert.ok(ids("placeholder", true).includes("org"))
  assert.ok(ids("placeholder", true).includes("topic"))
})

test("comments: never send one the server would silently drop", () => {
  assert.equal(commentIssue("", false), "missing")
  assert.equal(commentIssue("   ", false), "missing")
  assert.equal(commentIssue("", true), null)
  // ≤3 characters is acknowledged and discarded server-side, suggestion or not.
  assert.equal(commentIssue("pls", true), "short")
  assert.equal(commentIssue(" ok ", false), "short")
  assert.equal(commentIssue("wrong", false), null)
  assert.equal(commentIssue("x".repeat(COMMENT_MAX + 1), true), "long")
})

test("suggestions only count for the reasons that are ticked", () => {
  const topic = { original: "minecraft", suggested: "singing" }
  assert.equal(hasSuggestion({ reasons: ["topic"], topic }), true)
  assert.equal(hasSuggestion({ reasons: ["other"], topic }), false)
  assert.equal(
    hasSuggestion({
      reasons: ["topic"],
      topic: { original: "art", suggested: "art" },
    }),
    false
  )
  assert.equal(
    hasSuggestion({
      reasons: ["mentions"],
      mentions: { add: [], remove: [channel(1)] },
    }),
    true
  )
})

test("fields: the names and topic format the server and moderators rely on", () => {
  const fields = buildReportFields({
    reasons: ["other", "topic"],
    comment: "  It's a karaoke stream.  ",
    topic: { original: "minecraft", suggested: "singing" },
  })
  // Reasons in canonical order, using the legacy wire values.
  assert.equal(field(fields, "Reason"), "Incorrect video topic\nOther")
  assert.equal(field(fields, "Original Topic"), "`minecraft`")
  assert.equal(field(fields, "Suggested Topic"), "`singing`")
  assert.equal(field(fields, "Comments"), "It's a karaoke stream.")
  assert.equal(fields.at(-1).name, "Comments")
})

test("fields: suggesting no topic, and no suggestion when unchanged", () => {
  const none = buildReportFields({
    reasons: ["topic"],
    comment: "",
    topic: { original: "art", suggested: null },
  })
  assert.equal(field(none, "Suggested Topic"), "None")
  assert.equal(field(none, "Comments"), SUGGESTION_ONLY_COMMENT)
  assert.ok(SUGGESTION_ONLY_COMMENT.length > 3)

  const same = buildReportFields({
    reasons: ["topic"],
    comment: "check this",
    topic: { original: null, suggested: null },
  })
  assert.equal(field(same, "Original Topic"), "None")
  assert.equal(field(same, "Suggested Topic"), undefined)
})

test("fields: unticked reasons leave their suggestions out", () => {
  const fields = buildReportFields({
    reasons: ["other"],
    comment: "something else",
    topic: { original: "a", suggested: "b" },
    mentions: { add: [channel(1)], remove: [] },
  })
  assert.deepEqual(
    fields.map((f) => f.name),
    ["Reason", "Comments"]
  )
})

test("fields: mention lists are named, coded and capped", () => {
  const many = Array.from({ length: MENTION_LIST_MAX + 3 }, (_, i) =>
    channel(i)
  )
  const fields = buildReportFields({
    reasons: ["mentions"],
    comment: "",
    mentions: {
      add: [{ id: "UCx`y", name: "名前", english_name: "Namae" }],
      remove: many,
    },
  })
  assert.equal(field(fields, "Add Mentions"), "Namae (`UCxy`)")
  const removed = field(fields, "Remove Mentions").split("\n")
  assert.equal(removed.length, MENTION_LIST_MAX + 1)
  assert.equal(removed.at(-1), "…and 3 more")
})

test("fields: the whole report stays well under Discord's message cap", () => {
  const many = Array.from({ length: 40 }, (_, i) => ({
    id: `UC${"x".repeat(22)}${i}`,
    name: "n".repeat(60),
  }))
  const fields = buildReportFields({
    reasons: ["topic", "mentions", "org", "other"],
    comment: "c".repeat(COMMENT_MAX + 500),
    topic: { original: "a".repeat(40), suggested: "b".repeat(40) },
    mentions: { add: many, remove: many },
  })
  const text = fields.map((f) => `**${f.name}:** ${f.value}`).join("\n")
  assert.ok(text.length < 3400, `report text is ${text.length} characters`)
})

test("dispute notice: listed channels always, clips when reported as low quality", () => {
  assert.equal(
    showDisputeNotice("UCF4-I8ZQL6Aa-iHfdz-B9KQ", "clip", new Set()),
    true
  )
  assert.equal(showDisputeNotice("UCother", "clip", new Set(["quality"])), true)
  assert.equal(showDisputeNotice("UCother", "clip", new Set(["other"])), false)
  assert.equal(
    showDisputeNotice("UCother", "stream", new Set(["quality"])),
    false
  )
})
