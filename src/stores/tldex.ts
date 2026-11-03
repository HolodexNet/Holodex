import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { TlMessage } from "@/lib/tldex/messages"
import { defined, readLegacyState } from "./legacy"
import { syncAcrossTabs } from "./sync"

export interface TlSettings {
  /** Puts the TL box under the chat instead of over it. */
  stickBottom: boolean
  fontSize: number
  showVerified: boolean
  showModerator: boolean
  showVtuber: boolean
  showLocalTime: boolean
  /** Share of a chat cell's height for TLs. 0 leaves it automatic. */
  windowSize: number
  showSubtitle: boolean
  /** Hides archive messages from later than the current position. */
  hideSpoiler: boolean
  blocked: string[]
}

interface TldexStore extends TlSettings {
  set: <K extends keyof TlSettings>(key: K, value: TlSettings[K]) => void
  toggleBlocked: (name: string) => void
}

function defaults(): TlSettings {
  return {
    stickBottom: false,
    fontSize: 14,
    showVerified: true,
    showModerator: true,
    showVtuber: true,
    showLocalTime: false,
    windowSize: 0,
    showSubtitle: true,
    hideSpoiler: false,
    blocked: [],
  }
}

function fromLegacy(): Partial<TlSettings> {
  const s = readLegacyState()?.settings
  if (!s) return {}
  return defined<Partial<TlSettings>>({
    stickBottom: s.liveTlStickBottom,
    fontSize: s.liveTlFontSize,
    showVerified: s.liveTlShowVerified,
    showModerator: s.liveTlShowModerator,
    showVtuber: s.liveTlShowVtuber,
    showLocalTime: s.liveTlShowLocalTime,
    windowSize: s.liveTlWindowSize,
    showSubtitle: s.liveTlShowSubtitle,
    hideSpoiler: s.liveTlHideSpoiler,
    blocked: s.liveTlBlocked,
  })
}

export const useTldex = create<TldexStore>()(
  persist(
    (set) => ({
      ...defaults(),
      ...fromLegacy(),
      set: (key, value) =>
        set({ [key]: value } as Pick<TlSettings, typeof key>),
      toggleBlocked: (name) =>
        set((state) => ({
          blocked: state.blocked.includes(name)
            ? state.blocked.filter((n) => n !== name)
            : [...state.blocked, name],
        })),
    }),
    { name: "holodex-v3/tldex", version: 1 }
  )
)

syncAcrossTabs(useTldex)

interface TlSubtitleStore {
  /** Stream id -> the subtitle lines its TL panel wants shown over the video. */
  byVideo: Record<string, TlMessage[]>
  setSubtitles: (videoId: string, messages: TlMessage[]) => void
}

/**
 * The TL panel knows what to show but sits in a chat cell; the video frame sits
 * elsewhere in the tree. This carries the lines between them.
 */
export const useTlSubtitles = create<TlSubtitleStore>()((set) => ({
  byVideo: {},
  setSubtitles: (videoId, messages) =>
    set((state) => {
      const current = state.byVideo[videoId]
      if (!current?.length && !messages.length) return state
      return { byVideo: { ...state.byVideo, [videoId]: messages } }
    }),
}))
