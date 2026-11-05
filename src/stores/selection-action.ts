import { create } from "zustand"

import type { SelectedVideo } from "@/lib/selection"
import type { MutationActionId } from "@/lib/selection-actions"
import {
  smartPageContext,
  type SmartPageContext,
} from "@/lib/selection-actions/smart"
import { can } from "@/lib/permissions"
import { useAuth } from "@/stores/auth"

interface SelectionActionRequest {
  id: string
  entries: readonly SelectedVideo[]
  userId: string
  action: MutationActionId
  page: SmartPageContext
}

export const useSelectionAction = create<{
  request: SelectionActionRequest | null
  open: (entries: readonly SelectedVideo[], action?: MutationActionId) => void
  close: () => void
}>((set) => ({
  request: null,
  open: (entries, action = "add-mentions") => {
    const user = useAuth.getState().user
    if (
      user &&
      entries.length &&
      can(
        user,
        action === "add-mentions"
          ? "mention.add"
          : action === "set-topic"
            ? "topic.set"
            : "smart.edit"
      )
    )
      set({
        request: {
          id: crypto.randomUUID(),
          entries: entries.map((entry) => ({
            ...entry,
            video: { ...entry.video },
          })),
          userId: String(user.id),
          action,
          page: Object.freeze(smartPageContext(window.location.pathname)),
        },
      })
  },
  close: () => set({ request: null }),
}))

export type { SelectionActionRequest }
