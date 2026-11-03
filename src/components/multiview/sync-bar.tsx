import { useState } from "react"
import { toast } from "sonner"

import {
  CheckIcon,
  GearSixIcon,
  LinkSimpleIcon,
  PauseIcon,
  PlayIcon,
  RewindIcon,
  FastForwardIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useT } from "@/lib/i18n"
import { permalinkPath } from "@/lib/multiview/codec"
import {
  barSegments,
  encodeOffsets,
  PLAYBACK_RATES,
  percentForTime,
  timeForPercent,
  videoProgress,
} from "@/lib/multiview/sync"
import { videoCells } from "@/lib/multiview/cells"
import { formatDuration } from "@/lib/time"
import { useMultiview } from "@/stores/multiview"
import { usePlayerStatus } from "@/stores/multiview-playback"
import { SEEK_SECONDS } from "./media-actions"
import { ShortcutBadge, useShortcutLabel } from "./shortcut-hint"
import { StreamAvatar } from "./stream-badge"
import { useArchiveSync } from "./use-archive-sync"

/** A shared timeline for watching overlapping archives together. */
export function SyncBar() {
  const { t } = useT()
  const sync = useArchiveSync()
  const cells = useMultiview((s) => s.cells)
  const setSyncOffset = useMultiview((s) => s.setSyncOffset)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [hover, setHover] = useState<number | null>(null)
  const { timeline, currentTs, paused, rate } = sync
  const backHint = useShortcutLabel("sync-back", `-${SEEK_SECONDS}s`)
  const forwardHint = useShortcutLabel("sync-forward", `+${SEEK_SECONDS}s`)
  const playHint = useShortcutLabel(
    "sync-play-pause",
    paused ? t("views.multiview.play") : t("views.multiview.pause")
  )
  const rateHint = useShortcutLabel(
    "sync-faster",
    t("views.multiview.sync.playbackRate")
  )

  const share = async () => {
    if (!timeline) return
    const params = new URLSearchParams()
    if (currentTs) params.set("t", String(Math.round(currentTs)))
    const offsets = encodeOffsets(timeline, sync.offsets)
    if (offsets) params.set("offsets", offsets)
    const query = params.toString()
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${permalinkPath(cells)}${query ? `?${query}` : ""}`
      )
      toast.success(t("component.videoCard.copiedToClipboard"))
    } catch {
      toast.error(t("component.videoCard.copyFailed"))
    }
  }

  const total = timeline ? (timeline.maxTs - timeline.minTs) * 1000 : 0
  const elapsed = timeline
    ? Math.max(Math.round(currentTs - timeline.minTs), 0) * 1000
    : 0
  const percent = timeline ? percentForTime(timeline, currentTs) : 0
  const videoCellOf = (videoId: string) =>
    videoCells(cells).find((cell) => cell.content.video.id === videoId)?.id

  return (
    <div className="relative flex h-25 shrink-0 items-stretch gap-2 border-t bg-card p-2 pb-[max(env(safe-area-inset-bottom),0.5rem)]">
      <div className="flex w-30 shrink-0 flex-col items-center justify-center gap-0.5">
        {timeline && (
          <div className="text-center text-xs tabular-nums">
            {formatDuration(elapsed)} / {formatDuration(total)}
          </div>
        )}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon-xs"
            className="relative"
            aria-label={`-${SEEK_SECONDS}s`}
            {...backHint}
            onClick={() => sync.seek(currentTs - SEEK_SECONDS)}
          >
            <RewindIcon />
            <ShortcutBadge id="sync-back" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative"
            aria-label={
              paused ? t("views.multiview.play") : t("views.multiview.pause")
            }
            {...playHint}
            onClick={() => sync.setPaused(!paused)}
          >
            {paused ? <PlayIcon /> : <PauseIcon />}
            <ShortcutBadge id="sync-play-pause" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            className="relative"
            aria-label={`+${SEEK_SECONDS}s`}
            {...forwardHint}
            onClick={() => sync.seek(currentTs + SEEK_SECONDS)}
          >
            <FastForwardIcon />
            <ShortcutBadge id="sync-forward" />
          </Button>
        </div>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={t("views.multiview.sync.syncSettings")}
            title={t("views.multiview.sync.syncSettings")}
            onClick={() => setSettingsOpen(true)}
          >
            <GearSixIcon />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="xs"
                  className="px-1 tabular-nums"
                  aria-label={t("views.multiview.sync.playbackRate")}
                  {...rateHint}
                />
              }
            >
              {rate}x
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top">
              {PLAYBACK_RATES.map((option) => (
                <DropdownMenuItem
                  key={option}
                  onClick={() => sync.setRate(option)}
                >
                  <CheckIcon
                    className={option === rate ? undefined : "invisible"}
                  />
                  {option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={t("views.multiview.sync.shareAtTime")}
            title={t("views.multiview.sync.shareAtTime")}
            onClick={() => void share()}
          >
            <LinkSimpleIcon />
          </Button>
        </div>
      </div>

      <div className="relative min-w-0 flex-1">
        {!timeline ? (
          <p className="p-2 text-sm text-muted-foreground">
            {t("views.multiview.sync.nothingToSync")}
          </p>
        ) : (
          <>
            <div className="h-full overflow-x-hidden overflow-y-auto pr-2">
              {barSegments(timeline).map((segment) => {
                const video = timeline.videos.find((v) => v.id === segment.id)!
                return (
                  <div
                    key={segment.id}
                    className="my-1 flex items-center gap-1"
                  >
                    <StreamAvatar video={segment.video} size={20} />
                    <div className="relative h-2 min-w-0 flex-1">
                      <div
                        className="absolute inset-y-0 overflow-hidden rounded-full bg-muted"
                        style={{
                          left: `${segment.offset * 100}%`,
                          width: `${segment.width * 100}%`,
                        }}
                      >
                        <SegmentProgress
                          cellId={videoCellOf(segment.id)}
                          compute={(currentTime) =>
                            videoProgress(video, currentTs, currentTime)
                          }
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            {/* Overlaid so the slider lines up exactly with the bars beneath. */}
            <div className="absolute inset-y-0 right-2 left-6">
              {hover !== null && (
                <div
                  className="pointer-events-none absolute -top-11 z-10 -translate-x-1/2 rounded bg-black/80 px-1.5 py-0.5 text-center text-xs whitespace-pre text-white"
                  style={{ left: `${hover}%` }}
                >
                  {new Date(
                    timeForPercent(timeline, hover) * 1000
                  ).toLocaleTimeString()}
                  {"\n"}
                  {formatDuration(
                    (timeForPercent(timeline, hover) - timeline.minTs) * 1000
                  )}{" "}
                  / {formatDuration(total)}
                </div>
              )}
              <input
                type="range"
                min={0}
                max={100}
                step={0.01}
                value={percent}
                aria-label={t("views.multiview.archiveSync")}
                onChange={(event) =>
                  sync.seek(
                    timeForPercent(timeline, Number(event.target.value))
                  )
                }
                onPointerMove={(event) => {
                  const bounds = event.currentTarget.getBoundingClientRect()
                  setHover(
                    Math.min(
                      Math.max(
                        ((event.clientX - bounds.left) / bounds.width) * 100,
                        0
                      ),
                      100
                    )
                  )
                }}
                onPointerLeave={() => setHover(null)}
                className="sync-slider size-full cursor-pointer appearance-none bg-transparent outline-none [&::-moz-range-thumb]:h-full [&::-moz-range-thumb]:w-0.75 [&::-moz-range-thumb]:rounded-none [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary [&::-webkit-slider-thumb]:h-24 [&::-webkit-slider-thumb]:w-0.75 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-primary"
              />
            </div>
          </>
        )}
      </div>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("views.multiview.sync.syncSettings")}</DialogTitle>
            <DialogDescription>
              {t("views.multiview.sync.syncSettingsDetail")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            {timeline?.videos.map((video) => {
              const offset = sync.offsets[video.id] ?? 0
              return (
                <div
                  key={video.id}
                  className="flex items-center justify-between gap-2"
                >
                  <StreamAvatar video={video.video} size={36} />
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSyncOffset(video.id, offset - 0.5)}
                    >
                      -0.5
                    </Button>
                    <Input
                      type="number"
                      step={0.5}
                      aria-label={t("views.multiview.sync.offset")}
                      value={offset}
                      onChange={(event) =>
                        setSyncOffset(video.id, Number(event.target.value) || 0)
                      }
                      className="h-8 w-20 text-center"
                    />
                    <span className="text-xs text-muted-foreground">
                      {t("views.multiview.sync.seconds")}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSyncOffset(video.id, offset + 0.5)}
                    >
                      +0.5
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SegmentProgress({
  cellId,
  compute,
}: {
  cellId: string | undefined
  compute: (currentTime: number) => number
}) {
  const status = usePlayerStatus(cellId ?? "")
  return (
    <div
      className="h-full bg-complement"
      style={{ width: `${compute(status.currentTime)}%` }}
    />
  )
}
