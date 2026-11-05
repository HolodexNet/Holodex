import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import type { SongApproach } from "@/lib/video-edit/routes"
import type { ChannelSummary } from "@/lib/types"

const RECENT_MENTION_LIMIT = 8

interface VideoEditPrefs {
  /** The approach `/music` opens, so that people stay with the one they like. */
  approach: SongApproach | null
  /** Collabs come in series, so the next video often has the same guests. */
  recentMentions: ChannelSummary[]
  setApproach: (approach: SongApproach) => void
  rememberMention: (channel: ChannelSummary) => void
}

export const useVideoEditPrefs = create<VideoEditPrefs>()(
  persist(
    (set) => ({
      approach: null,
      recentMentions: [],
      setApproach: (approach) => set({ approach }),
      rememberMention: (channel) =>
        set((state) => ({
          recentMentions: [
            channel,
            ...state.recentMentions.filter((item) => item.id !== channel.id),
          ].slice(0, RECENT_MENTION_LIMIT),
        })),
    }),
    { name: "holodex-v3/video-edit", version: 1 }
  )
)

interface EditQueue {
  /** Videos to work through, in the order they were selected. */
  ids: string[]
  /** Where to go back to when finished. */
  returnTo: string | null
  start: (ids: string[], returnTo: string) => void
  clear: () => void
}

/**
 * Editing several selected videos one at a time. It lives apart from the
 * selection basket so that stepping through never changes what is selected.
 */
export const useEditQueue = create<EditQueue>()(
  persist(
    (set) => ({
      ids: [],
      returnTo: null,
      start: (ids, returnTo) => set({ ids, returnTo }),
      clear: () => set({ ids: [], returnTo: null }),
    }),
    {
      name: "holodex-v3/video-edit-queue",
      version: 1,
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
