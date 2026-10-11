import { PRIMARY_PRESETS } from "@/lib/consts"
import type { ChannelSummary, Org, User } from "@/lib/types"

/**
 * The previous (Vue) UI persisted its whole Vuex state under `holodex-v2`.
 * On the first run of this UI we carry over what still applies, so nobody
 * loses their login, organization, filters or theme.
 */
interface LegacyState {
  settings?: {
    lang?: string
    clipLangs?: string[]
    darkMode?: boolean
    defaultOpen?: string
    redirectMode?: boolean
    scrollMode?: boolean
    hideThumbnail?: boolean
    hidePlaceholder?: boolean
    hideMissing?: boolean
    nameProperty?: string
    hideCollabStreams?: boolean
    hiddenGroups?: Record<string, string[]>
    ignoredTopics?: string[]
    homeViewMode?: string
    liveTlLang?: string
    blockedChannels?: ChannelSummary[]
  }
  currentOrg?: Org
  orgFavorites?: Org[]
  currentGridSize?: number
  userdata?: { user?: User | null; jwt?: string | null }
}

let cached: LegacyState | null | undefined

export function readLegacyState(): LegacyState | null {
  if (cached !== undefined) return cached
  try {
    const raw = localStorage.getItem("holodex-v2")
    cached = raw ? (JSON.parse(raw) as LegacyState) : null
  } catch {
    cached = null
  }
  return cached
}

/** The old UI stored the picked talent theme as an index in `theme`. */
export function readLegacyPrimary(): string | null {
  try {
    const raw = localStorage.getItem("theme")
    if (raw === null) return null
    return PRIMARY_PRESETS[Number(raw)]?.color ?? null
  } catch {
    return null
  }
}

/** Drops `undefined` entries so they do not shadow defaults when spread. */
export function defined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null)
  ) as Partial<T>
}
