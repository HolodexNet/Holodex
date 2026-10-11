import { create } from "zustand"
import { persist } from "zustand/middleware"

interface UiStore {
  /** Desktop sidebar: expanded, or collapsed to an icon rail. */
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export const useUi = create<UiStore>()(
  persist(
    (set) => ({
      // Start expanded only where there is room for it next to the feed.
      sidebarOpen: window.matchMedia("(min-width: 1200px)").matches,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    }),
    { name: "holodex-v3/ui", version: 1 }
  )
)
