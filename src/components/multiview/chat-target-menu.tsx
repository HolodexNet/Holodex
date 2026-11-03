import { useState } from "react"
import { cn } from "cn"

import {
  CaretDownIcon,
  CheckIcon,
  MagnifyingGlassIcon,
} from "@/components/icons"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useT } from "@/lib/i18n"
import { isVideoCell } from "@/lib/multiview/cells"
import { sortCells } from "@/lib/multiview/grid"
import type { CellId } from "@/lib/multiview/types"
import { useMultiview } from "@/stores/multiview"
import { useMultiviewUi } from "@/stores/multiview-ui"
import { accentColor, useAccents, useResolvedChat } from "./selectors"
import { StreamAvatar, useStreamName } from "./stream-badge"

/**
 * Says which video a chat serves, and changes it. Pointing at the chip outlines
 * the video itself, so the link between the two is visible wherever they are on
 * the grid.
 */
export function ChatTargetMenu({
  cellId,
  compact,
}: {
  cellId: CellId
  compact?: boolean
}) {
  const { t } = useT()
  const [open, setOpen] = useState(false)
  const resolved = useResolvedChat(cellId)
  const setUi = useMultiviewUi((s) => s.set)
  const name = useStreamName(resolved?.video)
  const video = resolved?.video
  const offGrid = !!video && !resolved?.sourceCellId
  const source = resolved?.sourceCellId ?? null

  const close = () => {
    setOpen(false)
    setUi({ highlightedCell: null })
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setUi({ highlightedCell: null })
      }}
    >
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label={t("views.multiview.chatTarget.change")}
            title={
              offGrid
                ? t("views.multiview.chatTarget.offGridHint", [name])
                : name || t("views.multiview.chatTarget.change")
            }
            onPointerEnter={() => setUi({ highlightedCell: source })}
            onPointerLeave={() => {
              if (!open) setUi({ highlightedCell: null })
            }}
            className="flex h-6 min-w-0 flex-1 items-center gap-1.5 rounded-md bg-muted/60 pr-1 pl-1.5 text-xs outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
          />
        }
      >
        {video && <StreamAvatar video={video} size={16} />}
        {!compact && (
          <span className="min-w-0 flex-1 truncate text-left">
            {name || t("views.multiview.chatTarget.none")}
          </span>
        )}
        {offGrid && !compact && (
          <span className="shrink-0 rounded-sm bg-background/70 px-1 text-[10px] text-muted-foreground">
            {t("views.multiview.chatTarget.offGrid")}
          </span>
        )}
        <CaretDownIcon className="size-3 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 gap-0 p-1">
        <TargetOptions cellId={cellId} onDone={close} />
      </PopoverContent>
    </Popover>
  )
}

function TargetOptions({
  cellId,
  onDone,
}: {
  cellId: CellId
  onDone: () => void
}) {
  const { t } = useT()
  const cells = useMultiview((s) => s.cells)
  const setChatTarget = useMultiview((s) => s.setChatTarget)
  const setUi = useMultiviewUi((s) => s.set)
  const resolved = useResolvedChat(cellId)
  const accents = useAccents()
  const videos = sortCells(cells.filter(isVideoCell))
  const isAuto = resolved?.target.kind === "auto"

  const rowClass =
    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none hover:bg-muted focus-visible:bg-muted"

  return (
    <div className="flex flex-col">
      <div className="px-2 pt-1 pb-1 text-xs font-medium text-muted-foreground">
        {t("views.multiview.chatTarget.onGrid")}
      </div>
      {videos.length === 0 && (
        <div className="px-2 py-1.5 text-sm text-muted-foreground">
          {t("views.multiview.mediaControlsEmpty")}
        </div>
      )}
      {videos.map((cell) => (
        <VideoOption
          key={cell.id}
          cellId={cell.id}
          className={rowClass}
          hue={accents.get(cell.id)}
          selected={!isAuto && resolved?.sourceCellId === cell.id}
          onHover={(hovering) =>
            setUi({ highlightedCell: hovering ? cell.id : null })
          }
          onSelect={() => {
            setChatTarget(cellId, { kind: "cell", cellId: cell.id })
            onDone()
          }}
        />
      ))}
      <div className="my-1 h-px bg-border" />
      <button
        type="button"
        className={rowClass}
        onClick={() => {
          setChatTarget(cellId, { kind: "auto" })
          onDone()
        }}
      >
        <span className="flex size-5 items-center justify-center">
          {isAuto && <CheckIcon className="size-4" />}
        </span>
        <span className="min-w-0 flex-1">
          {t("views.multiview.chatTarget.auto")}
          <span className="block text-xs text-muted-foreground">
            {t("views.multiview.chatTarget.autoHint")}
          </span>
        </span>
      </button>
      <button
        type="button"
        className={rowClass}
        onClick={() => {
          onDone()
          setUi({ picker: { kind: "chat", cellId } })
        }}
      >
        <span className="flex size-5 items-center justify-center">
          <MagnifyingGlassIcon className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          {t("views.multiview.chatTarget.other")}
          <span className="block text-xs text-muted-foreground">
            {t("views.multiview.chatTarget.otherHint")}
          </span>
        </span>
      </button>
    </div>
  )
}

function VideoOption({
  cellId,
  className,
  hue,
  selected,
  onHover,
  onSelect,
}: {
  cellId: CellId
  className: string
  hue: number | undefined
  selected: boolean
  onHover: (hovering: boolean) => void
  onSelect: () => void
}) {
  const video = useMultiview((s) => {
    const cell = s.cells.find((c) => c.id === cellId)
    return cell?.content?.type === "video" ? cell.content.video : null
  })
  const name = useStreamName(video)
  if (!video) return null
  return (
    <button
      type="button"
      className={cn(className, selected && "bg-muted/60")}
      onClick={onSelect}
      onPointerEnter={() => onHover(true)}
      onPointerLeave={() => onHover(false)}
    >
      <span
        aria-hidden="true"
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: accentColor(hue) }}
      />
      <StreamAvatar video={video} size={20} />
      <span className="min-w-0 flex-1 truncate">{name}</span>
      {selected && <CheckIcon className="size-4 shrink-0" />}
    </button>
  )
}
