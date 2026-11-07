import { useEffect, useRef } from "react"

import { useT } from "@/lib/i18n"
import { youtubeLang } from "@/lib/multiview/stream"
import type { PlayableSource } from "@/lib/multiview/types"
import { createYoutubePlayer } from "@/lib/player/youtube-player"
import { videoEmbedUrl } from "@/lib/video-source"
import { useSettings } from "@/stores/settings"
import { focusComposer } from "./chat-registry"

/** The stream being translated, with its own sound: translators listen to it. */
export function TlPlayer({ source }: { source: PlayableSource }) {
  const { t } = useT()
  if (source.provider === "youtube") {
    return <YoutubeEmbed key={source.videoId} videoId={source.videoId} />
  }
  const src = videoEmbedUrl(source, window.location.hostname)
  return src ? (
    <iframe
      title={t("tlClient.layout.player")}
      src={src}
      allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
      allowFullScreen
      className="absolute inset-0 size-full border-0"
    />
  ) : null
}

function YoutubeEmbed({ videoId }: { videoId: string }) {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!host.current) return
    const controller = createYoutubePlayer({
      host: host.current,
      videoId,
      lang: youtubeLang(useSettings.getState().lang),
      muted: false,
      onReady: () => {},
      onStateChange: (state) => {
        // Pressing play moves the keyboard into the embed; by now the click has
        // done its job, so hand it straight back to the composer.
        if (
          (state === "playing" || state === "paused") &&
          document.activeElement?.tagName === "IFRAME"
        )
          focusComposer()
      },
      onLoadError: () => {},
    })
    return () => controller.destroy()
  }, [videoId])

  return <div ref={host} className="absolute inset-0" />
}
