import { PictureInPictureIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { useT } from "@/lib/i18n"
import type { CellId, ControlContent } from "@/lib/multiview/types"
import { useMultiview } from "@/stores/multiview"
import { useMultiviewUi } from "@/stores/multiview-ui"
import { ControlPanel, ControlPanelToggles } from "./control-panel"

/** The control panel living on the grid, moved and resized like anything else. */
export function ControlFrame({
  cellId,
  content,
}: {
  cellId: CellId
  content: ControlContent
}) {
  const { t } = useT()
  const setControlPanels = useMultiview((s) => s.setControlPanels)
  const removeCell = useMultiview((s) => s.removeCell)
  const setUi = useMultiviewUi((s) => s.set)
  const { panels } = content

  return (
    <div className="flex size-full flex-col bg-card text-sm">
      <div className="flex shrink-0 items-center gap-0.5 border-b p-1 pl-2">
        <span className="min-w-0 flex-1 truncate text-xs font-medium">
          {t("views.multiview.mediaControls")}
        </span>
        <ControlPanelToggles
          panels={panels}
          onChange={(next) => setControlPanels(cellId, next)}
        />
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={t("views.multiview.control.float")}
          title={t("views.multiview.control.float")}
          onClick={() => {
            removeCell(cellId)
            setUi({ mediaControlsOpen: true, controlWindowPanels: panels })
          }}
        >
          <PictureInPictureIcon />
        </Button>
      </div>
      <div className="@container min-h-0 flex-1 overflow-y-auto">
        <ControlPanel panels={panels} />
      </div>
    </div>
  )
}
