import { useT } from "@/lib/i18n"
import { findCenterCell, screenPositions } from "@/lib/multiview/director"
import { compactKey, SWAP_SHORTCUTS } from "@/lib/multiview/shortcuts"
import type { VideoCell } from "@/lib/multiview/types"
import { useMultiview } from "@/stores/multiview"
import { useMultiviewUi } from "@/stores/multiview-ui"
import { OverCell } from "./audio-focus-layer"
import { swapToCenter } from "./media-actions"
import { IS_MAC, useShortcutKey } from "./shortcut-hint"
import { useStreamName } from "./stream-badge"

/**
 * Marks the big screen and numbers the other videos, each number being the key for
 * it and a button for anyone not using one. The keys work on any layout with a big
 * screen, but the numbers only stay up in director mode, or while the list of keys
 * is open to explain them.
 */
export function DirectorLayer() {
  const cells = useMultiview((s) => s.cells)
  const director = useMultiview((s) => s.directorMode)
  const editing = useMultiview((s) => s.editing)
  const helpOpen = useMultiviewUi((s) => s.helpOpen)
  const center = findCenterCell(cells, { force: director })

  if (editing || !center || !(director || helpOpen)) return null
  return (
    <>
      {director && (
        <OverCell cellId={center.id} className="z-10">
          <div className="size-full rounded-[3px] ring-2 ring-primary ring-inset" />
        </OverCell>
      )}
      {screenPositions(cells, center)
        .slice(0, SWAP_SHORTCUTS.length)
        .map((cell, index) => (
          <OverCell key={cell.id} cellId={cell.id} className="z-10">
            <SwapButton cell={cell} position={index} />
          </OverCell>
        ))}
    </>
  )
}

function SwapButton({ cell, position }: { cell: VideoCell; position: number }) {
  const { t } = useT()
  const name = useStreamName(cell.content.video)
  const key = useShortcutKey(SWAP_SHORTCUTS[position])
  const label = t("views.multiview.director.swap", [name])
  return (
    <button
      type="button"
      data-swap-button=""
      aria-label={label}
      title={key ? `${label} (${key})` : label}
      className="pointer-events-auto absolute top-1 left-1 flex h-6 min-w-6 cursor-pointer items-center justify-center rounded-md bg-black/75 px-1 text-xs font-medium text-white ring-1 ring-white/25 outline-none hover:bg-primary hover:text-primary-foreground focus-ring-sm"
      onClick={() => swapToCenter(cell.id)}
    >
      {key ? compactKey(key, IS_MAC) : position + 1}
    </button>
  )
}
