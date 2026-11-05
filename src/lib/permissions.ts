import type { User } from "./types"

export type Capability =
  | "mention.add"
  | "mention.remove-any"
  | "topic.set"
  | "topic.clear"
  | "topic.replace-any"
  | "song.add"
  | "song.edit-any"
  | "smart.edit"

/** What any logged-in account may do. Ownership checks are below. */
const CONTRIBUTOR: readonly Capability[] = [
  "mention.add",
  "topic.set",
  "song.add",
]
const CURATOR: readonly Capability[] = [
  ...CONTRIBUTOR,
  "mention.remove-any",
  "topic.clear",
  "topic.replace-any",
  "song.edit-any",
  "smart.edit",
]

const ROLE_CAPABILITIES: Record<User["role"], ReadonlySet<Capability>> = {
  user: new Set(CONTRIBUTOR),
  editor: new Set(CURATOR),
  admin: new Set(CURATOR),
}

export function can(user: User | null, capability: Capability): boolean {
  return user !== null && !!ROLE_CAPABILITIES[user.role]?.has(capability)
}

/** IDs arrive as numbers or as strings (SQL bigint), so compare them as text. */
function sameId(
  a: string | number | null | undefined,
  b: string | number | null | undefined
): boolean {
  return a !== null && a !== undefined && b !== null && b !== undefined
    ? String(a) === String(b)
    : false
}

/** A song can be changed or removed by whoever added it, or by a curator. */
export function canEditSong(
  user: User | null,
  song: { creator_id?: string | number | null }
): boolean {
  if (!user) return false
  return can(user, "song.edit-any") || sameId(user.id, song.creator_id)
}

/** A topic can be set if there is none, or changed by whoever set it or a curator. */
export function canChangeTopic(
  user: User | null,
  current: {
    topic_id?: string | null
    topic_approver_id?: string | number | null
  }
): boolean {
  if (!user || !can(user, "topic.set")) return false
  return (
    can(user, "topic.replace-any") ||
    !current.topic_id ||
    sameId(user.id, current.topic_approver_id)
  )
}
