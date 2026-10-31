import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import {
  removeCompletedSelections,
  setSelectedVideos,
  videoRange,
  type SelectedVideo,
  type VideoSelection,
} from "@/lib/selection"
import type { Video } from "@/lib/types"

interface SelectionStore {
  items: VideoSelection
  selecting: boolean
  anchor: { scope: string; id: string } | null
  enter: (initial?: { video: Video; scope: string }) => void
  exit: () => void
  /** Selection actions return true when the limit refused a video. */
  toggle: (video: Video, scope: string) => boolean
  set: (videos: readonly Video[], selected: boolean) => boolean
  range: (scope: string, videos: readonly Video[], target: string) => boolean
  clear: () => void
  removeCompleted: (entries: readonly SelectedVideo[]) => void
}

function refused(items: VideoSelection, videos: readonly Video[]): boolean {
  return videos.some((video) => !items[video.id])
}

export const useSelection = create<SelectionStore>()(
  persist(
    (set, get) => ({
      items: {},
      selecting: false,
      anchor: null,
      enter: (initial) =>
        set((state) => ({
          selecting: true,
          items: initial
            ? setSelectedVideos(state.items, [initial.video], true)
            : state.items,
          anchor: initial
            ? { scope: initial.scope, id: initial.video.id }
            : state.anchor,
        })),
      exit: () => set({ selecting: false, items: {}, anchor: null }),
      toggle: (video, scope) => {
        const { items } = get()
        const selected = !items[video.id]
        const next = setSelectedVideos(items, [video], selected)
        set({ items: next, anchor: { scope, id: video.id } })
        return selected && refused(next, [video])
      },
      set: (videos, selected) => {
        const items = setSelectedVideos(get().items, videos, selected)
        set({ items })
        return selected && refused(items, videos)
      },
      range: (scope, videos, target) => {
        const { items, anchor } = get()
        const sameScope = anchor?.scope === scope
        const targets = videoRange(
          videos,
          sameScope ? anchor.id : undefined,
          target
        )
        const next = setSelectedVideos(items, targets, true)
        set({ items: next, anchor: sameScope ? anchor : { scope, id: target } })
        return refused(next, targets)
      },
      clear: () => set({ items: {}, anchor: null }),
      removeCompleted: (entries) =>
        set((state) => ({
          items: removeCompletedSelections(state.items, entries),
        })),
    }),
    {
      name: "holodex-v3/selection",
      version: 1,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
)

interface SelectionScopes {
  scopes: Record<string, readonly Video[]>
  active: string | null
  register: (id: string, videos: readonly Video[]) => void
  unregister: (id: string) => void
  activate: (id: string) => void
}

export const useSelectionScopes = create<SelectionScopes>((set) => ({
  scopes: {},
  active: null,
  register: (id, videos) =>
    set((state) => ({
      scopes: { ...state.scopes, [id]: videos },
      active: state.active ?? id,
    })),
  unregister: (id) =>
    set((state) => {
      const scopes = { ...state.scopes }
      delete scopes[id]
      return {
        scopes,
        active:
          state.active === id ? (Object.keys(scopes)[0] ?? null) : state.active,
      }
    }),
  activate: (id) =>
    set((state) => (state.active === id ? state : { active: id })),
}))
