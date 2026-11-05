import { can } from "@/lib/permissions"
import type { User } from "@/lib/types"
import { MENTION_VIDEO_LIMIT } from "./mentions"
import { TOPIC_VIDEO_LIMIT } from "./topics"
import { SMART_ACTIONS, smartActionIssue, type SmartActionId } from "./smart"
import type { Video } from "@/lib/types"

export type MutationActionId = "add-mentions" | "set-topic" | SmartActionId

export const VIDEO_ACTIONS = [
  { id: "copy-links", label: "selection.copyLinks", minimum: 1, maximum: 200 },
  {
    id: "add-mentions",
    label: "curation.addMentions",
    maximum: MENTION_VIDEO_LIMIT,
    minimum: 1,
    capability: "mention.add",
  },
  {
    id: "set-topic",
    label: "curation.topics.title",
    maximum: TOPIC_VIDEO_LIMIT,
    minimum: 1,
    capability: "topic.set",
  },
  ...SMART_ACTIONS.map((action) => ({
    ...action,
    capability: "smart.edit" as const,
  })),
] as const

export function videoActionIssue(
  action: (typeof VIDEO_ACTIONS)[number],
  videos: readonly Video[]
): string | null {
  if (videos.length < action.minimum) return "tooFew"
  if (videos.length > action.maximum) return "tooMany"
  return action.id === "copy-links" ||
    action.id === "add-mentions" ||
    action.id === "set-topic"
    ? null
    : smartActionIssue(action.id, videos)
}

export function availableVideoActions(user: User | null) {
  return VIDEO_ACTIONS.filter(
    (action) => !("capability" in action) || can(user, action.capability)
  )
}
