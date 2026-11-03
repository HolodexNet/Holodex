import { cn } from "cn"

import { ArrowsClockwiseIcon, SlidersHorizontalIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { useT } from "@/lib/i18n"
import { toggleControlPanel } from "@/lib/multiview/control"
import type { ControlPanels } from "@/lib/multiview/types"
import { Mixer } from "./media-controls"
import { SyncControls } from "./sync-bar"

/**
 * Audio, playback and archive sync as one thing, which does not mind where it is
 * put. Showing the sync half starts the clock, which then moves every archive to
 * the shared timeline, so that half only ever shows because someone asked for it.
 */
export function ControlPanel({ panels }: { panels: ControlPanels }) {
  return (
    <div className="flex flex-col divide-y">
      {panels.media && <Mixer />}
      {panels.sync && <SyncControls stacked />}
    </div>
  )
}

export function ControlPanelToggles({
  panels,
  onChange,
}: {
  panels: ControlPanels
  onChange: (panels: ControlPanels) => void
}) {
  const { t } = useT()
  const items = [
    {
      panel: "media",
      label: t("views.multiview.mediaControls"),
      icon: <SlidersHorizontalIcon />,
    },
    {
      panel: "sync",
      label: t("views.multiview.archiveSync"),
      icon: <ArrowsClockwiseIcon />,
    },
  ] as const
  return items.map(({ panel, label, icon }) => (
    <Button
      key={panel}
      variant="ghost"
      size="icon-xs"
      aria-label={label}
      aria-pressed={panels[panel]}
      title={label}
      className={cn(panels[panel] && "text-primary")}
      onClick={() => onChange(toggleControlPanel(panels, panel))}
    >
      {icon}
    </Button>
  ))
}
