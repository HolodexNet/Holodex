import type { ChannelSummary, Video, VideoRef } from "./types"

export type RelationshipField = "simulcasts" | "refers" | "sources" | "clips"
export interface VideoCurationEdit {
  topicId?: string | null
  addMentions?: ChannelSummary[]
  removeMentions?: string[]
  relationships?: Partial<
    Record<RelationshipField, { add?: VideoRef[]; remove?: string[] }>
  >
}
const confirmedEdits = new Map<
  string,
  { edit: VideoCurationEdit; expires: number }
>()
export const MENTION_OVERRIDE_MS = 5 * 60_000

function mergeChanges<Entity extends { id: string }>(
  previous: { add?: Entity[]; remove?: string[] },
  next: { add?: Entity[]; remove?: string[] }
): { add: Entity[]; remove: string[] } {
  const additions = new Map(previous.add?.map((entity) => [entity.id, entity]))
  const removals = new Set(previous.remove)
  for (const id of next.remove ?? []) {
    additions.delete(id)
    removals.add(id)
  }
  for (const entity of next.add ?? []) {
    removals.delete(entity.id)
    additions.set(entity.id, { ...additions.get(entity.id), ...entity })
  }
  return { add: [...additions.values()], remove: [...removals] }
}

export function rememberVideoEdit(
  id: string,
  edit: VideoCurationEdit,
  now = Date.now()
): void {
  const stored = confirmedEdits.get(id)
  const previous = stored && stored.expires > now ? stored.edit : {}
  const mentions = mergeChanges(
    { add: previous.addMentions, remove: previous.removeMentions },
    { add: edit.addMentions, remove: edit.removeMentions }
  )
  const relationships = { ...previous.relationships }
  for (const field of Object.keys(
    edit.relationships ?? {}
  ) as RelationshipField[])
    relationships[field] = mergeChanges(
      previous.relationships?.[field] ?? {},
      edit.relationships![field]!
    )
  confirmedEdits.set(id, {
    edit: {
      ...("topicId" in edit
        ? { topicId: edit.topicId }
        : "topicId" in previous
          ? { topicId: previous.topicId }
          : {}),
      addMentions: mentions.add,
      removeMentions: mentions.remove,
      relationships,
    },
    expires: now + MENTION_OVERRIDE_MS,
  })
}

export function rememberMentionAdditions(
  id: string,
  channels: ChannelSummary[],
  now = Date.now()
): void {
  rememberVideoEdit(id, { addMentions: channels }, now)
}

function applyChanges<Entity extends { id: string }>(
  existing: Entity[],
  changes: { add?: Entity[]; remove?: string[] }
): Entity[] {
  const removed = new Set(changes.remove)
  const entities = new Map(
    existing
      .filter((entity) => !removed.has(entity.id))
      .map((entity) => [entity.id, entity])
  )
  for (const entity of changes.add ?? [])
    entities.set(entity.id, { ...entity, ...entities.get(entity.id) })
  return [...entities.values()]
}

export function withMentionAdditions(video: Video, now = Date.now()): Video {
  const stored = confirmedEdits.get(video.id)
  if (!stored) return video
  if (stored.expires <= now) {
    confirmedEdits.delete(video.id)
    return video
  }
  const edit = stored.edit
  const next = { ...video }
  if ("topicId" in edit) next.topic_id = edit.topicId
  if (Array.isArray(video.mentions) || edit.addMentions?.length)
    next.mentions = applyChanges(video.mentions ?? [], {
      add: edit.addMentions,
      remove: edit.removeMentions,
    })
  for (const field of Object.keys(
    edit.relationships ?? {}
  ) as RelationshipField[]) {
    const existing = video[field]
    const changes = edit.relationships![field]!
    if (typeof existing === "number") continue
    if (Array.isArray(existing) || changes.add?.length)
      next[field] = applyChanges(existing ?? [], changes)
  }
  return next
}

export function patchMentionLists(data: unknown): unknown {
  if (Array.isArray(data))
    return data.map((video: Video) => withMentionAdditions(video))
  if (!data || typeof data !== "object") return data
  if ("pages" in data && Array.isArray(data.pages)) {
    return {
      ...data,
      pages: data.pages.map((page: unknown) => patchMentionLists(page)),
    }
  }
  if ("items" in data && Array.isArray(data.items)) {
    return {
      ...data,
      items: data.items.map((video: Video) => withMentionAdditions(video)),
    }
  }
  if ("id" in data && "channel" in data)
    return withMentionAdditions(data as Video)
  return data
}
