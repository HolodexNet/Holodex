import { useMemo } from "react"
import { Link } from "react-router"
import { cn } from "cn"

import {
  ArrowClockwiseIcon,
  FastForwardIcon,
  PauseIcon,
  PlayIcon,
  SpeakerHighIcon,
  SpeakerSlashIcon,
  TrashIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { useT } from "@/lib/i18n"
import { videoCells } from "@/lib/multiview/cells"
import type { VideoCell } from "@/lib/multiview/types"
import { useMultiview } from "@/stores/multiview"
import { playbackHub, usePlayerStatus } from "@/stores/multiview-playback"
import { useMultiviewUi } from "@/stores/multiview-ui"
import {
  catchUp,
  FAST_RATE,
  pauseAll,
  playAll,
  reloadAll,
} from "./media-actions"
import { ShortcutBadge, ShortcutKeys, useShortcutLabel } from "./shortcut-hint"
import { StreamAvatar, useStreamName } from "./stream-badge"
import { useMultiviewCommands } from "./use-commands"

function VolumeSlider({
  value,
  onChange,
  label,
}: {
  value: number
  onChange: (value: number) => void
  label: string
}) {
  return (
    <input
      type="range"
      min={0}
      max={100}
      value={value}
      aria-label={label}
      onChange={(event) => onChange(Number(event.target.value))}
      className="h-1 min-w-16 flex-1 cursor-pointer accent-primary"
    />
  )
}

/** Playback for every stream at once, and for each one separately. */
export function MediaControls() {
  const { t } = useT()
  const open = useMultiviewUi((s) => s.mediaControlsOpen)
  const setUi = useMultiviewUi((s) => s.set)
  const allCells = useMultiview((s) => s.cells)
  const setAllMuted = useMultiview((s) => s.setAllMuted)
  const muteOthers = useMultiview((s) => s.muteOthers)
  const setMuteOthers = useMultiview((s) => s.setMuteOthers)
  const cells = useMemo(() => videoCells(allCells), [allCells])
  const playHint = useShortcutLabel("play-pause", t("views.multiview.playAll"))
  const pauseHint = useShortcutLabel(
    "play-pause",
    t("views.multiview.pauseAll")
  )
  const catchUpHint = useShortcutLabel("catch-up", t("views.multiview.syncAll"))
  const reloadHint = useShortcutLabel(
    "reload-all",
    t("views.multiview.reloadAll")
  )
  const unmuteHint = useShortcutLabel(
    "unmute-all",
    t("views.multiview.unmuteAll")
  )
  const muteHint = useShortcutLabel("mute", t("views.multiview.muteAll"))

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => setUi({ mediaControlsOpen: next })}
    >
      <SheetContent className="gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t("views.multiview.mediaControls")}</SheetTitle>
          <SheetDescription className="sr-only">
            {t("views.multiview.mediaControls")}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-wrap items-center gap-0.5 border-b px-4 pb-3">
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative"
            aria-label={t("views.multiview.playAll")}
            {...playHint}
            onClick={playAll}
          >
            <PlayIcon />
            <ShortcutBadge id="play-pause" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative"
            aria-label={t("views.multiview.syncAll")}
            {...catchUpHint}
            onClick={catchUp}
          >
            <FastForwardIcon />
            <ShortcutBadge id="catch-up" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative"
            aria-label={t("views.multiview.pauseAll")}
            {...pauseHint}
            onClick={pauseAll}
          >
            <PauseIcon />
            <ShortcutBadge id="play-pause" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative"
            aria-label={t("views.multiview.reloadAll")}
            {...reloadHint}
            onClick={reloadAll}
          >
            <ArrowClockwiseIcon />
            <ShortcutBadge id="reload-all" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative"
            aria-label={t("views.multiview.unmuteAll")}
            {...unmuteHint}
            disabled={muteOthers}
            onClick={() => setAllMuted(false)}
          >
            <SpeakerHighIcon />
            <ShortcutBadge id="unmute-all" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative"
            aria-label={t("views.multiview.muteAll")}
            {...muteHint}
            onClick={() => setAllMuted(true)}
          >
            <SpeakerSlashIcon />
            <ShortcutBadge id="mute" />
          </Button>
          <MasterVolume cells={cells} />
        </div>
        {cells.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">
            {t("views.multiview.mediaControlsEmpty")}
          </p>
        ) : (
          <ul className="divide-y">
            {cells.map((cell) => (
              <CellControls key={cell.id} cell={cell} />
            ))}
          </ul>
        )}
        <div className="flex items-start justify-between gap-3 border-t p-4">
          <Label
            htmlFor="mv-mute-others"
            className="flex-col items-start gap-0.5"
          >
            <span className="flex items-center gap-1.5">
              {t("views.multiview.muteOthers")}
              <ShortcutKeys id="audio-focus" />
            </span>
            <span className="text-xs font-normal text-muted-foreground">
              {t("views.multiview.muteOthersDetail")}
            </span>
          </Label>
          <Switch
            id="mv-mute-others"
            checked={muteOthers}
            onCheckedChange={setMuteOthers}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}

/** Shows the shared volume, or 0 while the streams disagree. */
function MasterVolume({ cells }: { cells: VideoCell[] }) {
  const { t } = useT()
  const first = usePlayerStatus(cells[0]?.id ?? "")
  const allSame = cells.every(
    (cell) => playbackHub.getStatus(cell.id)?.volume === first.volume
  )
  return (
    <VolumeSlider
      label={t("views.multiview.volumeAll")}
      value={cells.length && allSame ? first.volume : 0}
      onChange={(value) => {
        for (const cell of cells) {
          playbackHub.controller(cell.id)?.setVolume(value)
          playbackHub.refresh(cell.id)
        }
      }}
    />
  )
}

function CellControls({ cell }: { cell: VideoCell }) {
  const { t } = useT()
  const status = usePlayerStatus(cell.id)
  const setMuted = useMultiview((s) => s.setMuted)
  const muteAllExcept = useMultiview((s) => s.muteAllExcept)
  const muteOthers = useMultiview((s) => s.muteOthers)
  const reload = useMultiviewUi((s) => s.reload)
  const { removeCell } = useMultiviewCommands()
  const { video, muted } = cell.content
  const name = useStreamName(video)
  const player = playbackHub.controller(cell.id)
  const playing = status.state === "playing" || status.state === "buffering"
  const channelId = video.channel.id
  const fast = status.playbackRate !== 1

  return (
    <li className="flex gap-2 px-4 py-2">
      {channelId?.startsWith("UC") ? (
        <Link to={`/channel/${channelId}`} className="shrink-0">
          <StreamAvatar video={video} size={36} />
        </Link>
      ) : (
        <StreamAvatar video={video} size={36} />
      )}
      <div className="min-w-0 flex-1">
        <div
          className="truncate text-sm text-primary"
          title={video.title ?? name}
        >
          {video.title || name}
        </div>
        <div className="flex flex-wrap items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={
              playing ? t("views.multiview.pause") : t("views.multiview.play")
            }
            onClick={() => (playing ? player?.pause() : player?.play())}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </Button>
          {player?.supportsPlaybackRate && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t("views.multiview.fastForward")}
              aria-pressed={fast}
              className={cn(fast && "text-primary")}
              onClick={() => player.setPlaybackRate(fast ? 1 : FAST_RATE)}
            >
              <FastForwardIcon />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("views.multiview.edit.reload")}
            onClick={() => reload([cell.id])}
          >
            <ArrowClockwiseIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("views.multiview.edit.delete")}
            onClick={() => removeCell(cell.id)}
          >
            <TrashIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={
              muted ? t("views.multiview.unmute") : t("views.multiview.mute")
            }
            onClick={() => {
              if (muted && muteOthers) muteAllExcept(cell.id)
              else setMuted(cell.id, !muted)
            }}
          >
            {muted ? <SpeakerSlashIcon /> : <SpeakerHighIcon />}
          </Button>
          <VolumeSlider
            label={t("views.multiview.volume")}
            value={status.volume}
            onChange={(value) => {
              player?.setVolume(value)
              playbackHub.refresh(cell.id)
            }}
          />
        </div>
      </div>
    </li>
  )
}
