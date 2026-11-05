import { lazy, Suspense } from "react"
import { create } from "zustand"

import { PencilSimpleIcon } from "@/components/icons"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useT } from "@/lib/i18n"
import { can } from "@/lib/permissions"
import type { Video } from "@/lib/types"
import { useAuth } from "@/stores/auth"

/**
 * The editors' shortcut: fix a video's topic and participants right from its card,
 * without leaving the feed. Selecting the video and opening the editor gets to the
 * same place in a few more clicks, so this is a convenience and nothing depends on
 * it: this file, quick-edit-dialog.tsx, and one line each in the video menu and the
 * app shell are all there is.
 */

const useQuickEdit = create<{
  video: Video | null
  open: (video: Video) => void
  close: () => void
}>((set) => ({
  video: null,
  open: (video) => set({ video }),
  close: () => set({ video: null }),
}))

const QuickEditDialog = lazy(() =>
  import("./quick-edit-dialog").then((module) => ({
    default: module.QuickEditDialog,
  }))
)

export function QuickEditItem({ video }: { video: Video }) {
  const { t } = useT()
  const user = useAuth((state) => state.user)
  if (!can(user, "smart.edit")) return null
  return (
    <DropdownMenuItem onClick={() => useQuickEdit.getState().open(video)}>
      <PencilSimpleIcon className="text-muted-foreground" />
      {t("videoEdit.quick.menu")}
    </DropdownMenuItem>
  )
}

export function QuickEditHost() {
  const video = useQuickEdit((state) => state.video)
  const close = useQuickEdit((state) => state.close)
  if (!video) return null
  return (
    <Suspense fallback={null}>
      <QuickEditDialog key={video.id} video={video} onClose={close} />
    </Suspense>
  )
}
