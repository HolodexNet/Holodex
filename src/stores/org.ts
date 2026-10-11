import { create } from "zustand"
import { persist } from "zustand/middleware"

import { DEFAULT_ORG, DEFAULT_ORG_FAVORITES } from "@/lib/consts"
import type { Org } from "@/lib/types"
import { readLegacyState } from "./legacy"
import { syncAcrossTabs } from "./sync"

interface OrgStore {
  currentOrg: Org
  /** Starred organizations, shown in the quick switcher in this order. */
  orgFavorites: Org[]
  setCurrentOrg: (org: Org) => void
  toggleFavorite: (org: Org) => void
  moveFavorite: (name: string, direction: -1 | 1) => void
  reset: () => void
}

const slim = ({ name, short, name_jp, icon }: Org): Org => ({
  name,
  short,
  name_jp,
  icon,
})

function initial(): Pick<OrgStore, "currentOrg" | "orgFavorites"> {
  const legacy = readLegacyState()
  return {
    currentOrg: legacy?.currentOrg?.name ? slim(legacy.currentOrg) : DEFAULT_ORG,
    orgFavorites: legacy?.orgFavorites?.length
      ? legacy.orgFavorites.map(slim)
      : DEFAULT_ORG_FAVORITES,
  }
}

export const useOrgStore = create<OrgStore>()(
  persist(
    (set) => ({
      ...initial(),
      setCurrentOrg: (org) => set({ currentOrg: slim(org) }),
      toggleFavorite: (org) =>
        set((state) => ({
          orgFavorites: state.orgFavorites.some((o) => o.name === org.name)
            ? state.orgFavorites.filter((o) => o.name !== org.name)
            : [...state.orgFavorites, slim(org)],
        })),
      moveFavorite: (name, direction) =>
        set((state) => {
          const from = state.orgFavorites.findIndex((o) => o.name === name)
          const to = from + direction
          if (from < 0 || to < 0 || to >= state.orgFavorites.length) return state
          const next = [...state.orgFavorites]
          ;[next[from], next[to]] = [next[to], next[from]]
          return { orgFavorites: next }
        }),
      reset: () =>
        set({ currentOrg: DEFAULT_ORG, orgFavorites: DEFAULT_ORG_FAVORITES }),
    }),
    { name: "holodex-v3/org", version: 1 }
  )
)

syncAcrossTabs(useOrgStore)
