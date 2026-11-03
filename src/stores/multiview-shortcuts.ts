import { create } from "zustand"
import { persist } from "zustand/middleware"

import {
  rebind,
  resetShortcut,
  type ShortcutId,
  type ShortcutOverrides,
} from "@/lib/multiview/shortcuts"
import { syncAcrossTabs } from "./sync"

interface MultiviewShortcutStore {
  /** Keys the viewer has changed from the defaults. */
  overrides: ShortcutOverrides
  /** Whether keys with no Ctrl, Alt or Command to them do anything at all. */
  characterKeys: boolean
  /** The local day the lost-keyboard tab last explained itself. */
  focusAdvertDay: string | null
  /** Returns the command that lost this key to make way, if any did. */
  rebind: (id: ShortcutId, key: string | null) => ShortcutId | null
  reset: (id: ShortcutId) => void
  resetAll: () => void
  setCharacterKeys: (enabled: boolean) => void
  setFocusAdvertDay: (day: string) => void
}

/** Shared between tabs: how someone's keyboard works is not per layout. */
export const useMultiviewShortcuts = create<MultiviewShortcutStore>()(
  persist(
    (set, get) => ({
      overrides: {},
      characterKeys: true,
      focusAdvertDay: null,
      rebind: (id, key) => {
        const { overrides, displaced } = rebind(get().overrides, id, key)
        set({ overrides })
        return displaced
      },
      reset: (id) =>
        set((state) => ({
          overrides: resetShortcut(state.overrides, id).overrides,
        })),
      resetAll: () => set({ overrides: {} }),
      setCharacterKeys: (characterKeys) => set({ characterKeys }),
      setFocusAdvertDay: (focusAdvertDay) => set({ focusAdvertDay }),
    }),
    { name: "holodex-v3/multiview-shortcuts", version: 1 }
  )
)

syncAcrossTabs(useMultiviewShortcuts)
