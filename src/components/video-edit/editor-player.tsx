import { useEffect, useRef, useSyncExternalStore } from "react"
import { cn } from "cn"

import {
  ArrowSquareOutIcon,
  KeyboardIcon,
  WarningIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { useT } from "@/lib/i18n"
import { youtubeLang } from "@/lib/multiview/stream"
import { createYoutubePlayer } from "@/lib/player/youtube-player"
import type { Video } from "@/lib/types"
import { videoThumbnail } from "@/lib/video"
import { videoSource } from "@/lib/video-source"
import type { PlayerClock } from "@/lib/video-edit/player-clock"
import { useSettings } from "@/stores/settings"

const frameHasFocus = () => document.activeElement?.tagName === "IFRAME"

/** A player can take focus without the page being told, so check now and then. */
function subscribeFrameFocus(listener: () => void) {
  const afterBlur = () => setTimeout(listener)
  window.addEventListener("blur", afterBlur)
  window.addEventListener("focus", listener)
  document.addEventListener("focusin", listener)
  const timer = setInterval(listener, 1000)
  return () => {
    window.removeEventListener("blur", afterBlur)
    window.removeEventListener("focus", listener)
    document.removeEventListener("focusin", listener)
    clearInterval(timer)
  }
}

function returnKeyboard() {
  if (document.activeElement instanceof HTMLElement)
    document.activeElement.blur()
  window.focus()
}

/**
 * The one player of the editor, which never moves in the DOM so that switching
 * tabs or approaches cannot reload the video.
 */
export function EditorPlayer({
  video,
  clock,
  className,
}: {
  video: Video
  clock: PlayerClock
  className?: string
}) {
  const { t } = useT()
  const host = useRef<HTMLDivElement>(null)
  const source = videoSource(video)
  const videoId = source.provider === "youtube" ? source.videoId : null
  const status = useSyncExternalStore(clock.subscribeStatus, clock.getStatus)
  const keyboardLost = useSyncExternalStore(subscribeFrameFocus, frameHasFocus)

  useEffect(() => {
    if (!host.current || !videoId) return
    const controller = createYoutubePlayer({
      host: host.current,
      videoId,
      lang: youtubeLang(useSettings.getState().lang),
      muted: false,
      onReady: () => clock.markReady(),
      onStateChange: (state) => {
        clock.setState(state)
        // Clicking play in the embed moves the keyboard into it, where our
        // shortcuts cannot follow. By now the click has done its job, so take
        // the keyboard straight back rather than make people notice and click.
        if ((state === "playing" || state === "paused") && frameHasFocus())
          returnKeyboard()
      },
      onLoadError: () => clock.setState("error"),
    })
    clock.attach(controller)
    return () => {
      clock.detach()
      controller.destroy()
    }
  }, [clock, videoId])

  return (
    <div className={cn("relative overflow-hidden bg-black", className)}>
      {videoId ? (
        <div ref={host} className="absolute inset-0" />
      ) : (
        <img
          src={videoThumbnail(video).src}
          alt=""
          className="absolute inset-0 size-full object-contain"
        />
      )}
      {!videoId && source.provider !== "external" && (
        <Button
          nativeButton={false}
          variant="secondary"
          size="sm"
          className="absolute right-2 bottom-2"
          render={
            <a href={source.url} target="_blank" rel="noopener noreferrer" />
          }
        >
          <ArrowSquareOutIcon data-icon="inline-start" />
          {t("component.videoCard.openOnPlatform", { platform: "Twitch" })}
        </Button>
      )}
      {status.state === "error" && (
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-black/80 px-3 py-2 text-xs text-white">
          <WarningIcon className="size-4 shrink-0" />
          <span className="min-w-0 flex-1">{t("videoEdit.player.failed")}</span>
          {source.provider === "youtube" && (
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 underline"
            >
              {t("views.settings.redirectModeLabel")}
            </a>
          )}
        </div>
      )}
      {keyboardLost && (
        <button
          type="button"
          onClick={returnKeyboard}
          className="absolute inset-x-0 top-0 mx-auto flex w-fit max-w-full cursor-pointer items-center gap-1.5 rounded-b-lg bg-popover px-3 py-1 text-xs text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
        >
          <KeyboardIcon className="size-4 shrink-0" />
          <span className="truncate">{t("videoEdit.player.keyboardLost")}</span>
        </button>
      )}
    </div>
  )
}
