import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import type { ChannelSummary } from "@/lib/types"

const RECENT_MENTION_LIMIT = 8

interface VideoEditPrefs {
  /** Collabs come in series, so the next video often has the same guests. */
  recentMentions: ChannelSummary[]
  rememberMention: (channel: ChannelSummary) => void
}

export const useVideoEditPrefs = create<VideoEditPrefs>()(
  persist(
    (set) => ({
      recentMentions: [],
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
