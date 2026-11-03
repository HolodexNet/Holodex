import { create } from "zustand"
import { persist } from "zustand/middleware"

import {
  defaultAutoLayout,
  type AutoLayoutTable,
  type SavedPreset,
} from "@/lib/multiview/presets"
import { readLegacyState } from "./legacy"
import { syncAcrossTabs } from "./sync"

interface MultiviewPresetStore {
  /** The viewer's own saved layouts. */
  custom: SavedPreset[]
  /** Video count -> the layout auto-layout uses for it. */
  auto: AutoLayoutTable
  addCustom: (preset: SavedPreset) => void
  removeCustom: (name: string) => void
  setAuto: (videoCount: number, encoded: string | null) => void
  resetAuto: () => void
}

function initial(): Pick<MultiviewPresetStore, "custom" | "auto"> {
  const legacy = readLegacyState()?.multiview
  return {
    custom: legacy?.presetLayout ?? [],
    auto: legacy?.autoLayout ?? defaultAutoLayout(),
  }
}

/**
 * Separate from the working layout because presets are shared between tabs,
 * while each tab keeps its own layout rather than having it pulled out from
 * under the players it is running.
 */
export const useMultiviewPresets = create<MultiviewPresetStore>()(
  persist(
    (set) => ({
      ...initial(),
      addCustom: (preset) =>
        set((state) => ({ custom: [...state.custom, preset] })),
      removeCustom: (name) =>
        set((state) => {
          const removed = state.custom.find((p) => p.name === name)
          return {
            custom: state.custom.filter((p) => p.name !== name),
            // A deleted preset cannot stay in charge of auto-layout.
            auto: removed
              ? state.auto.map((layout) =>
                  layout === removed.layout ? null : layout
                )
              : state.auto,
          }
        }),
      setAuto: (videoCount, encoded) =>
        set((state) => {
          const auto = [...state.auto]
          auto[videoCount] = encoded
          return { auto }
        }),
      resetAuto: () => set({ auto: defaultAutoLayout() }),
    }),
    { name: "holodex-v3/multiview-presets", version: 1 }
  )
)

syncAcrossTabs(useMultiviewPresets)
