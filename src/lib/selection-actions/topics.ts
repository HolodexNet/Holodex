export const TOPIC_VIDEO_LIMIT = 2000

export interface TopicPlan {
  readonly videoIds: readonly string[]
  readonly topicId: string | null
}
export interface TopicItemResult {
  id: string
  state: "confirmed" | "skipped" | "unverified" | "failed" | "notAttempted"
}
export interface TopicOutcome {
  items: TopicItemResult[]
  attempted: boolean
  error?: string
}
export interface TopicServices {
  execute: (plan: TopicPlan, signal: AbortSignal) => Promise<unknown>
  read: (
    id: string,
    signal: AbortSignal
  ) => Promise<{ topic_id: string | null }>
  allowed: () => boolean
  forbidden: () => Promise<void>
}

export function planTopicEdit(
  ids: readonly string[],
  topicId: string | null
): TopicPlan {
  const videoIds = [...new Set(ids)]
  if (
    !videoIds.length ||
    videoIds.length > TOPIC_VIDEO_LIMIT ||
    videoIds.some((id) => !id.trim())
  )
    throw new Error("videoLimit")
  if (topicId !== null && !topicId.trim()) throw new Error("topicRequired")
  return Object.freeze({ videoIds: Object.freeze(videoIds), topicId })
}

function topicResponse(value: unknown, ids: readonly string[]) {
  if (!value || typeof value !== "object")
    throw new Error("Invalid topic response")
  const { updated_video_ids: updated, skipped_video_ids: skipped } =
    value as Record<string, unknown>
  if (!Array.isArray(updated) || !Array.isArray(skipped))
    throw new Error("Invalid topic response")
  const all = [...updated, ...skipped]
  if (
    all.length !== ids.length ||
    new Set(all).size !== ids.length ||
    all.some((id) => typeof id !== "string" || !ids.includes(id))
  )
    throw new Error("Invalid topic response")
  return new Set<string>(skipped)
}

// Each read is independent: a missing video or exhausted read budget must not
// discard the results already verified for the rest of a bulk edit.
export async function checkTopicPlan(
  plan: TopicPlan,
  services: TopicServices,
  outcome: TopicOutcome,
  signal: AbortSignal
): Promise<TopicOutcome> {
  const items = outcome.items.map((item) => ({ ...item }))
  const pending = items.filter((item) => item.state === "unverified")
  let next = 0
  await Promise.all(
    Array.from({ length: Math.min(3, pending.length) }, async () => {
      while (next < pending.length && !signal.aborted && services.allowed()) {
        const item = pending[next++]
        try {
          const current = await services.read(item.id, signal)
          signal.throwIfAborted()
          if (services.allowed() && current.topic_id === plan.topicId)
            item.state = "confirmed"
        } catch {
          // Unknown and mismatched topics remain selected; Check results only reads.
        }
      }
    })
  )
  return {
    ...outcome,
    items,
    error:
      outcome.error === "unknown" &&
      items.every((item) => item.state === "confirmed")
        ? undefined
        : outcome.error,
  }
}

export async function runTopicPlan(
  plan: TopicPlan,
  services: TopicServices,
  signal: AbortSignal
): Promise<TopicOutcome> {
  let outcome: TopicOutcome = {
    items: plan.videoIds.map((id) => ({ id, state: "notAttempted" })),
    attempted: false,
  }
  if (signal.aborted || !services.allowed())
    return { ...outcome, error: "stopped" }
  outcome.attempted = true
  outcome.items.forEach((item) => {
    item.state = "unverified"
  })
  try {
    const skipped = topicResponse(
      await services.execute(
        plan,
        AbortSignal.any([signal, AbortSignal.timeout(30_000)])
      ),
      plan.videoIds
    )
    outcome.items.forEach((item) => {
      if (skipped.has(item.id)) item.state = "skipped"
    })
  } catch (failure) {
    const status =
      failure && typeof failure === "object" && "status" in failure
        ? failure.status
        : undefined
    if (typeof status === "number" && status >= 400 && status < 500) {
      outcome.items.forEach((item) => {
        item.state = "failed"
      })
      outcome.error =
        status === 403
          ? "forbidden"
          : status === 401
            ? "sessionChanged"
            : status === 429
              ? "rateLimited"
              : "rejected"
      if (status === 403) {
        try {
          await services.forbidden()
        } catch {
          /* Never replay a mutation after refresh. */
        }
      }
      return outcome
    }
    outcome = { ...outcome, error: "unknown" }
  }
  // Stop cancels the write, then uses a separate bounded read-back signal.
  return checkTopicPlan(plan, services, outcome, AbortSignal.timeout(20_000))
}
