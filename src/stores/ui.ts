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
      // Keep discovery focused on thumbnails; the full navigation is one click away.
      sidebarOpen: false,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    }),
    { name: "holodex-v3/ui", version: 1 }
  )
)
