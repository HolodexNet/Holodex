import { lazy, Suspense } from "react"
import { useLocation } from "react-router"
import { create } from "zustand"

import { FlagIcon } from "@/components/icons"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { ALL_VTUBERS } from "@/lib/consts"
import { useT } from "@/lib/i18n"
import type { Video } from "@/lib/types"
import { useOrgStore } from "@/stores/org"

/**
 * Reporting a video to the moderators. Open to everyone, signed in or not; the
 * dialog loads on demand and lives once in the app shell.
 */

interface ReportTarget {
  video: Video
  /** The org whose feed the video turned up in, when it isn't the channel's own. */
  org: string | null
}

const useReport = create<{
  target: ReportTarget | null
  open: (target: ReportTarget) => void
  close: () => void
}>((set) => ({
  target: null,
  open: (target) => set({ target }),
  close: () => set({ target: null }),
}))

const ReportDialog = lazy(() =>
  import("./report-dialog").then((module) => ({
    default: module.ReportDialog,
  }))
)

export function ReportItem({ video }: { video: Video }) {
  const { t } = useT()
  const { pathname } = useLocation()
  const orgName = useOrgStore((state) => state.currentOrg.name)
  // Only the org feed on Home mixes in other orgs' videos (as collabs).
  const org =
    pathname === "/" && orgName !== ALL_VTUBERS && video.channel.org !== orgName
      ? orgName
      : null
  return (
    <DropdownMenuItem onClick={() => useReport.getState().open({ video, org })}>
      <FlagIcon className="text-muted-foreground" />
      {t("component.reportDialog.title")}
    </DropdownMenuItem>
  )
}

export function ReportHost() {
  const target = useReport((state) => state.target)
  const close = useReport((state) => state.close)
  if (!target) return null
  return (
    <Suspense fallback={null}>
      <ReportDialog
        key={target.video.id}
        video={target.video}
        org={target.org}
        onClose={close}
      />
    </Suspense>
  )
}
