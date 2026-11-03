import { ChatbubblesIcon, TldexIcon, VideoCameraIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { useT } from "@/lib/i18n"
import type { CellId } from "@/lib/multiview/types"
import { useMultiviewUi } from "@/stores/multiview-ui"
import { makeChatCell } from "./use-commands"

/** What a cell can become: a stream, or a chat for one. */
export function EmptyCellActions({ cellId }: { cellId: CellId }) {
  const { t } = useT()
  const setUi = useMultiviewUi((s) => s.set)
  return (
    <div className="flex max-w-full flex-col items-stretch gap-1.5">
      <Button
        size="sm"
        onClick={() => setUi({ picker: { kind: "cell", cellId } })}
      >
        <VideoCameraIcon data-icon="inline-start" />
        <span className="truncate">
          {t("views.multiview.video.selectLive")}
        </span>
      </Button>
      <div className="flex gap-1.5">
        <Button
          size="sm"
          variant="secondary"
          className="min-w-0 flex-1 font-normal"
          onClick={() => makeChatCell(cellId, false)}
        >
          <ChatbubblesIcon data-icon="inline-start" />
          {t("views.multiview.chat")}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="min-w-0 flex-1 font-normal"
          onClick={() => makeChatCell(cellId, true)}
        >
          <TldexIcon data-icon="inline-start" className="size-7.5" />
          {t("views.multiview.tl")}
        </Button>
      </div>
    </div>
  )
}

export function EmptyCell({ cellId }: { cellId: CellId }) {
  return (
    <div className="flex size-full items-center justify-center overflow-hidden border border-dashed border-border bg-muted/30 p-2">
      <EmptyCellActions cellId={cellId} />
    </div>
  )
}
