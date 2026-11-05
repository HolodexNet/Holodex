import assert from "node:assert/strict"
import test from "node:test"
import {
  checkTopicPlan,
  planTopicEdit,
  runTopicPlan,
} from "../src/lib/selection-actions/topics.ts"
import { can } from "../src/lib/permissions.ts"
import {
  rememberVideoEdit,
  withMentionAdditions,
  patchMentionLists,
  MENTION_OVERRIDE_MS,
} from "../src/lib/mention-cache.ts"

function service(overrides = {}) {
  const writes = [],
    reads = []
  return {
    writes,
    reads,
    execute: async (plan) => {
      writes.push(plan)
      return { updated_video_ids: [...plan.videoIds], skipped_video_ids: [] }
    },
    read: async (id) => {
      reads.push(id)
      return { topic_id: "gaming" }
    },
    allowed: () => true,
    forbidden: async () => {},
    ...overrides,
  }
}
const signal = () => new AbortController().signal
const states = (outcome) => outcome.items.map((item) => item.state)

test("topic permissions allow contributors to set and only editors/admins to clear", () => {
  for (const role of ["user", "editor", "admin"]) {
    assert.equal(can({ role }, "topic.set"), true)
    assert.equal(can({ role }, "topic.clear"), role !== "user")
  }
  assert.equal(can(null, "topic.set"), false)
  assert.equal(can({ role: "unexpected" }, "topic.set"), false)
})

test("topic plan freezes distinct IDs, accepts clear, and rejects invalid or oversized selections", () => {
  const ids = ["a", "a", "b"]
  const plan = planTopicEdit(ids, null)
  ids.push("c")
  assert.deepEqual(plan.videoIds, ["a", "b"])
  assert.equal(plan.topicId, null)
  assert.ok(Object.isFrozen(plan) && Object.isFrozen(plan.videoIds))
  for (const ids of [
    [],
    [" "],
    Array.from({ length: 2001 }, (_, i) => String(i)),
  ])
    assert.throws(() => planTopicEdit(ids, "gaming"), /videoLimit/)
  assert.equal(
    planTopicEdit(Array(2001).fill("a"), "gaming").videoIds.length,
    1
  )
  assert.throws(() => planTopicEdit(["a"], " "), /topicRequired/)
})

test("bulk topic edit uses one write and verifies only updated IDs, preserving explicit skips", async () => {
  const svc = service({
    execute: async (plan) => {
      svc.writes.push(plan)
      return {
        updated_video_ids: ["a"],
        skipped_video_ids: ["denied", "missing"],
      }
    },
  })
  const plan = planTopicEdit(["a", "denied", "missing"], "gaming")
  const result = await runTopicPlan(plan, svc, signal())
  assert.deepEqual(svc.writes, [plan])
  assert.deepEqual(svc.reads, ["a"])
  assert.deepEqual(states(result), ["confirmed", "skipped", "skipped"])
  assert.deepEqual(
    states(await checkTopicPlan(plan, svc, result, signal())),
    states(result)
  )
  assert.equal(svc.writes.length, 1)
})

test("already-matching updated topics still require canonical read-back", async () => {
  const svc = service()
  assert.deepEqual(
    states(await runTopicPlan(planTopicEdit(["a"], "gaming"), svc, signal())),
    ["confirmed"]
  )
  assert.deepEqual(svc.reads, ["a"])
})

test("a lost write response is verified without replaying the mutation", async () => {
  let writes = 0
  const svc = service({
    execute: async () => {
      writes++
      throw new TypeError("lost response")
    },
  })
  const result = await runTopicPlan(
    planTopicEdit(["a"], "gaming"),
    svc,
    signal()
  )
  assert.deepEqual(states(result), ["confirmed"])
  assert.equal(writes, 1)
  assert.equal(result.error, undefined)
})

test("unreadable, missing, or mismatched topics stay selected, while independent reads succeed", async () => {
  const plan = planTopicEdit(["a", "b", "c", "d"], "gaming")
  const svc = service({
    read: async (id) => {
      if (id === "b") throw new Error("missing")
      return id === "c" ? {} : { topic_id: id === "d" ? "talk" : "gaming" }
    },
  })
  const result = await runTopicPlan(plan, svc, signal())
  assert.deepEqual(states(result), [
    "confirmed",
    "unverified",
    "unverified",
    "unverified",
  ])
  const checks = service()
  const checked = await checkTopicPlan(plan, checks, result, signal())
  assert.deepEqual(states(checked), Array(4).fill("confirmed"))
  assert.deepEqual(checks.reads.sort(), ["b", "c", "d"])
  assert.equal(checks.writes.length, 0)
})

test("clearing requires explicit null in canonical data; omitted topic is unknown", async () => {
  const result = await runTopicPlan(
    planTopicEdit(["a", "b"], null),
    service({ read: async (id) => (id === "a" ? { topic_id: null } : {}) }),
    signal()
  )
  assert.deepEqual(states(result), ["confirmed", "unverified"])
})

test("403 refreshes once without replay or read-back; 400 and 429 remain failed", async () => {
  for (const status of [400, 401, 403, 429]) {
    let writes = 0,
      refreshes = 0
    const svc = service({
      execute: async () => {
        writes++
        throw Object.assign(new Error("rejected"), { status })
      },
      forbidden: async () => {
        refreshes++
      },
    })
    const result = await runTopicPlan(
      planTopicEdit(["a"], "gaming"),
      svc,
      signal()
    )
    assert.deepEqual(states(result), ["failed"])
    assert.equal(writes, 1)
    assert.equal(refreshes, status === 403 ? 1 : 0)
    assert.equal(svc.reads.length, 0)
  }
})

test("Stop before send prevents writes; Stop during send uses a separate read signal", async () => {
  const abort = new AbortController()
  abort.abort()
  const svc = service()
  assert.deepEqual(
    states(
      await runTopicPlan(planTopicEdit(["a"], "gaming"), svc, abort.signal)
    ),
    ["notAttempted"]
  )
  assert.equal(svc.writes.length, 0)
  const active = new AbortController()
  const stopped = service({
    execute: async () => {
      active.abort()
      throw new Error("aborted")
    },
    read: async (_id, readSignal) => {
      assert.equal(readSignal.aborted, false)
      return { topic_id: "gaming" }
    },
  })
  assert.deepEqual(
    states(
      await runTopicPlan(planTopicEdit(["a"], "gaming"), stopped, active.signal)
    ),
    ["confirmed"]
  )
})

test("account changes stop verification and invalid responses cannot hide unresolved IDs", async () => {
  let allowed = true
  const svc = service({
    execute: async () => {
      allowed = false
      return { updated_video_ids: ["a"], skipped_video_ids: [] }
    },
    allowed: () => allowed,
  })
  assert.deepEqual(
    states(await runTopicPlan(planTopicEdit(["a"], "gaming"), svc, signal())),
    ["unverified"]
  )
  assert.equal(svc.reads.length, 0)
  for (const response of [
    {},
    { updated_video_ids: ["a", "a"], skipped_video_ids: [] },
    { updated_video_ids: ["a"], skipped_video_ids: ["alien"] },
  ]) {
    const result = await runTopicPlan(
      planTopicEdit(["a", "b"], "gaming"),
      service({
        execute: async () => response,
        read: async () => ({ topic_id: "old" }),
      }),
      signal()
    )
    assert.deepEqual(states(result), ["unverified", "unverified"])
    assert.equal(result.error, "unknown")
  }
})

test("topic overlays replace and clear stale topics across cache shapes and preserve other edits", () => {
  const video = {
    id: "topic-cache",
    channel: { id: "uploader" },
    topic_id: "old",
    mentions: [{ id: "existing" }],
  }
  const now = Date.now()
  rememberVideoEdit(
    video.id,
    { topicId: "gaming", addMentions: [{ id: "guest" }] },
    now
  )
  rememberVideoEdit(video.id, { removeMentions: ["existing"] }, now + 1)
  assert.equal(withMentionAdditions(video, now + 2).topic_id, "gaming")
  rememberVideoEdit(video.id, { topicId: null }, now + 3)
  const result = patchMentionLists({ pages: [{ items: [video] }] }).pages[0]
    .items[0]
  assert.equal(result.topic_id, null)
  assert.deepEqual(
    result.mentions.map((channel) => channel.id),
    ["guest"]
  )
  assert.equal(
    withMentionAdditions(video, now + 4 + MENTION_OVERRIDE_MS).topic_id,
    "old"
  )
})
