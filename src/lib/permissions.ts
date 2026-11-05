import type { User } from "./types"

export type Capability =
  "mention.add" | "topic.set" | "topic.clear" | "smart.edit"

const ROLE_CAPABILITIES: Record<User["role"], ReadonlySet<Capability>> = {
  user: new Set(["mention.add", "topic.set"]),
  editor: new Set(["mention.add", "topic.set", "topic.clear", "smart.edit"]),
  admin: new Set(["mention.add", "topic.set", "topic.clear", "smart.edit"]),
}

export function can(user: User | null, capability: Capability): boolean {
  return user !== null && !!ROLE_CAPABILITIES[user.role]?.has(capability)
}
