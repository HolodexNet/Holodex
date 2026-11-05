import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Navigate, useParams, useSearchParams } from "react-router"

import { ErrorMessage, StateMessage } from "@/components/common/state-message"
import {
  DetailsPanel,
  VideoDescription,
} from "@/components/video-edit/details-panel"
import { EditorHeader } from "@/components/video-edit/editor-header"
import { EditorPlayer } from "@/components/video-edit/editor-player"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { api } from "@/lib/api"
import { useT } from "@/lib/i18n"
import type { Video } from "@/lib/types"
import { videoTitle } from "@/lib/video"
import { PlayerClock } from "@/lib/video-edit/player-clock"
import { editPath, resolveTab } from "@/lib/video-edit/routes"
import { useMusicPlayer } from "@/stores/music-player"
import { useSettings } from "@/stores/settings"

/** A full window of its own: editing wants the room, and no second audio source. */
export default function EditVideoPage() {
  const { id = "" } = useParams()
  const { t } = useT()
  const query = useQuery({
    queryKey: ["video-edit", id],
    queryFn: ({ signal }) => api.videoWithComments(id, signal),
    enabled: !!id,
    staleTime: 60_000,
  })

  useEffect(() => {
    useMusicPlayer.getState().pause()
    const root = document.documentElement
    root.dataset.fullWindow = ""
    return () => {
      delete root.dataset.fullWindow
    }
  }, [])

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {query.data ? (
        // Everything in the editor belongs to one video, the player above all.
        <VideoEditor key={query.data.id} video={query.data} />
      ) : query.isError ? (
        <ErrorMessage
          error={query.error}
          onRetry={() => void query.refetch()}
        />
      ) : (
        <StateMessage title={t("views.watch.loading")} />
      )}
    </div>
  )
}

function VideoEditor({ video }: { video: Video }) {
  const { tab: tabParam } = useParams()
  const [search] = useSearchParams()
  const preferEnglish = useSettings((state) => state.useEnglishName)
  const [clock] = useState(() => new PlayerClock())
  useDocumentTitle(videoTitle(video, preferEnglish))

  // Links can point at a moment, as they could in the previous UI.
  const startAt = Number(search.get("t")) || 0
  useEffect(() => {
    if (startAt > 0) clock.seek(startAt)
  }, [clock, startAt])

  const tab = resolveTab(tabParam) ?? "details"
  if (tabParam && tabParam !== tab)
    return <Navigate to={editPath(video.id, tab)} replace />

  return (
    <>
      <EditorHeader video={video} tab={tab} />
      <main className="min-h-0 flex-1 overflow-y-auto lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-rows-[auto_minmax(0,1fr)] lg:overflow-hidden lg:[grid-template-areas:'player_main'_'info_main']">
        <EditorPlayer
          video={video}
          clock={clock}
          className="sticky top-0 z-20 aspect-video w-full lg:static lg:[grid-area:player]"
        />
        <div className="hidden min-h-0 lg:block lg:overflow-hidden lg:[grid-area:info]">
          <VideoDescription video={video} className="h-full" />
        </div>
        <div className="min-h-0 lg:overflow-y-auto lg:[grid-area:main]">
          <DetailsPanel video={video} />
        </div>
      </main>
    </>
  )
}
