import { useEffect, type ReactNode } from "react"
import { cn } from "cn"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"

import {
  CircleNotchIcon,
  MonitorPlayIcon,
  SpeakerHighIcon,
  SpeakerSlashIcon,
} from "@/components/icons"
import { useT } from "@/lib/i18n"
import { soleAudibleCell } from "@/lib/multiview/cells"
import type { Cell, CellId, MultiviewVideo } from "@/lib/multiview/types"
import { useMultiview } from "@/stores/multiview"
import { useMuteSettling, usePlayerStatus } from "@/stores/multiview-playback"
import {
  useMultiviewUi,
  type AudioHandoff,
  type CellNotice,
} from "@/stores/multiview-ui"
import { cellMotion } from "./cell-motion"
import { rectStyle } from "./frame-layer"
import { StreamAvatar, useStreamName } from "./stream-badge"

const NOTICE_ICONS = {
  sound: SpeakerHighIcon,
  muted: SpeakerSlashIcon,
  screen: MonitorPlayIcon,
}

/** How long the result stays up once the player has obeyed. */
const LINGER_MS = 1800
/** A player that never finishes loading should not hold the notice up for ever. */
const LONGEST_MS = 6000

/** Draws over a cell, following it through a swap, and never takes pointer input. */
export function OverCell({
  cellId,
  className,
  children,
}: {
  cellId: CellId
  className?: string
  children: ReactNode
}) {
  const rect = useMultiview(
    (s) => s.cells.find((cell) => cell.id === cellId)?.rect
  )
  if (!rect) return null
  const motion = cellMotion(cellId)
  return (
    <m.div
      className={cn("pointer-events-none absolute overflow-hidden", className)}
      style={{ ...rectStyle(rect), x: motion.x, y: motion.y }}
    >
      {children}
    </m.div>
  )
}

function videoIn(cells: readonly Cell[], id: CellId | null) {
  const content = cells.find((cell) => cell.id === id)?.content
  return content?.type === "video" ? content.video : null
}

/**
 * Who has the sound under Audio Focus, and the moment it changes hands. With a
 * dozen players on screen the player's own speaker icon is no help in telling.
 */
export function AudioFocusLayer() {
  const editing = useMultiview((s) => s.editing)
  const audioFocus = useMultiview((s) => s.muteOthers)
  const cells = useMultiview((s) => s.cells)
  const handoff = useMultiviewUi((s) => s.audioHandoff)
  const notice = useMultiviewUi((s) => s.notice)
  const heard = audioFocus ? soleAudibleCell(cells) : null
  const incoming = videoIn(cells, handoff?.to ?? null)

  if (editing) return null
  return (
    <>
      {heard && (
        <OverCell cellId={heard} className="z-10">
          <span className="absolute right-1 bottom-12 flex size-6 items-center justify-center rounded-full bg-black/80 text-sm text-primary">
            <SpeakerHighIcon />
          </span>
        </OverCell>
      )}
      <AnimatePresence>
        {handoff && incoming && (
          <HandoffNotice key={handoff.id} handoff={handoff} video={incoming} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {notice && <Notice key={notice.id} notice={notice} />}
      </AnimatePresence>
    </>
  )
}

function Notice({ notice }: { notice: CellNotice }) {
  const { id, cellId, icon, text } = notice

  useEffect(() => {
    const timer = setTimeout(() => {
      const ui = useMultiviewUi.getState()
      if (ui.notice?.id === id) ui.set({ notice: null })
    }, LINGER_MS)
    return () => clearTimeout(timer)
  }, [id])

  const Icon = NOTICE_ICONS[icon]
  const pill = (
    <m.div
      role="status"
      className="flex max-w-full items-center gap-2 rounded-full bg-black/80 px-3 py-1.5 text-sm text-white shadow-lg"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <Icon className="size-4 shrink-0" />
      <span className="truncate">{text}</span>
    </m.div>
  )
  return cellId ? (
    <OverCell cellId={cellId} className="z-10 flex justify-center p-2">
      <div className="max-w-full">{pill}</div>
    </OverCell>
  ) : (
    <div className="pointer-events-none absolute inset-x-0 top-4 z-10 flex justify-center px-2">
      {pill}
    </div>
  )
}

function HandoffNotice({
  handoff,
  video,
}: {
  handoff: AudioHandoff
  video: MultiviewVideo
}) {
  const { t } = useT()
  const { id, to, from } = handoff
  const name = useStreamName(video)
  const status = usePlayerStatus(to)
  const settling = useMuteSettling(to)
  const pending = settling || status.state === "loading"

  useEffect(() => {
    const clear = () => {
      const ui = useMultiviewUi.getState()
      if (ui.audioHandoff?.id === id) ui.set({ audioHandoff: null })
    }
    const timer = setTimeout(clear, pending ? LONGEST_MS : LINGER_MS)
    return () => clearTimeout(timer)
  }, [id, pending])

  const message = pending
    ? t("views.multiview.audioFocus.unmuting", [name])
    : status.state === "paused"
      ? t("views.multiview.audioFocus.paused", [name])
      : t("views.multiview.audioFocus.hearing", [name])

  return (
    <>
      <OverCell
        cellId={to}
        className="z-10 flex items-center justify-center p-2"
      >
        <m.div
          role="status"
          className="flex max-w-full items-center gap-2 rounded-full bg-black/80 py-1 pr-3 pl-1.5 text-sm text-white shadow-lg ring-1 ring-primary"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
        >
          <StreamAvatar video={video} size={24} className="shrink-0" />
          {pending ? (
            <CircleNotchIcon className="size-4 shrink-0 animate-spin" />
          ) : (
            <SpeakerHighIcon className="size-4 shrink-0 text-primary" />
          )}
          <span className="truncate">{message}</span>
        </m.div>
      </OverCell>
      {from && (
        <OverCell
          cellId={from}
          className="z-10 flex items-center justify-center p-2"
        >
          <m.div
            className="flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-xs text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SpeakerSlashIcon className="size-3.5 shrink-0" />
            <span className="truncate">
              {t("views.multiview.audioFocus.silenced")}
            </span>
          </m.div>
        </OverCell>
      )}
    </>
  )
}
