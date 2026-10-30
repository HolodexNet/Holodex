import { useQuery } from "@tanstack/react-query"
import { Link, useParams } from "react-router"

import { ErrorMessage, StateMessage } from "@/components/common/state-message"
import { LogoTwitchIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { VideoMenu } from "@/components/video/video-menu"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { api } from "@/lib/api"
import { useT } from "@/lib/i18n"
import { channelName, videoTitle } from "@/lib/video"
import { videoEmbedUrl, videoSource } from "@/lib/video-source"
import { useSettings } from "@/stores/settings"
import { NotReadyPage } from "./not-ready"

/** Native Twitch playback; the rest of the watch experience is still pending. */
export function WatchPage() {
  const { id } = useParams()
  const { t } = useT()
  const preferEnglish = useSettings((s) => s.useEnglishName)
  const query = useQuery({
    queryKey: ["video", id],
    queryFn: ({ signal }) => api.video(id!, signal),
    enabled: !!id,
  })
  const video = query.data
  const source = videoSource(video ?? { id: id ?? "" })
  const title = video
    ? videoTitle(video, preferEnglish)
    : source.provider === "twitch"
      ? (source.channel ?? "Twitch")
      : undefined
  useDocumentTitle(title)

  if (!id) return <NotReadyPage />
  if (source.provider !== "twitch") {
    if (query.isPending)
      return <StateMessage title={t("views.watch.loading")} />
    if (query.isError)
      return (
        <ErrorMessage
          error={query.error}
          onRetry={() => void query.refetch()}
        />
      )
    return <NotReadyPage />
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 p-4">
      <div className="overflow-x-auto rounded-xl bg-black">
        <iframe
          key={id}
          src={videoEmbedUrl(source, window.location.hostname)!}
          title={title ?? "Twitch"}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="aspect-video min-h-[300px] w-full min-w-[400px] border-0"
        />
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <h1 className="text-xl font-semibold wrap-anywhere">{title}</h1>
          {video && (
            <Link
              className="text-complement hover:underline"
              to={`/channel/${video.channel.id}`}
            >
              {channelName(video.channel, preferEnglish)}
            </Link>
          )}
        </div>
        {video && <VideoMenu video={video} />}
      </div>
      <Button
        nativeButton={false}
        variant="outline"
        render={
          <a href={source.url} target="_blank" rel="noopener noreferrer" />
        }
      >
        <LogoTwitchIcon data-icon="inline-start" />
        {t("component.videoCard.openOnPlatform", { platform: "Twitch" })}
      </Button>
    </div>
  )
}
