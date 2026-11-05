import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Navigate, useParams, useSearchParams } from "react-router"
import { cn } from "cn"

import { ErrorMessage, StateMessage } from "@/components/common/state-message"
import {
  DetailsPanel,
  LoginPrompt,
  VideoDescription,
} from "@/components/video-edit/details-panel"
import { EditorHeader } from "@/components/video-edit/editor-header"
import { EditorPlayer } from "@/components/video-edit/editor-player"
import { CaptureApproach } from "@/components/video-edit/music/capture-approach"
import { SetlistApproach } from "@/components/video-edit/music/setlist-approach"
import { SongToolbar } from "@/components/video-edit/music/song-toolbar"
import { TimelineApproach } from "@/components/video-edit/music/timeline-approach"
import { SongWorkspaceProvider } from "@/components/video-edit/music/workspace"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { api } from "@/lib/api"
import { useT } from "@/lib/i18n"
import type { Video } from "@/lib/types"
import { videoTitle } from "@/lib/video"
import { PlayerClock } from "@/lib/video-edit/player-clock"
import {
  defaultTab,
  editableParts,
  editPath,
  isSongApproach,
  resolveTab,
  type SongApproach,
} from "@/lib/video-edit/routes"
import { useAuth } from "@/stores/auth"
import { useMusicPlayer } from "@/stores/music-player"
import { useSettings } from "@/stores/settings"
import { useVideoEditPrefs } from "@/stores/video-edit"

/** One song-authoring approach per URL. Each is self-contained, to keep or to drop. */
const APPROACHES: Record<SongApproach, () => React.ReactNode> = {
  setlist: SetlistApproach,
  timeline: TimelineApproach,
  capture: CaptureApproach,
}

/**
 * The player sits in the same DOM position for all of these, because moving an
 * iframe reloads it. Only the grid around it changes, which is what lets someone
 * switch tab or approach without the video so much as hiccuping.
 */
const LAYOUTS: Record<"details" | SongApproach, string> = {
  details:
    "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-rows-[auto_minmax(0,1fr)] lg:[grid-template-areas:'player_main'_'info_main']",
  setlist:
    "lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:grid-rows-[auto_minmax(0,1fr)] lg:[grid-template-areas:'player_list'_'source_list']",
  timeline:
    "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)_17rem] lg:[grid-template-areas:'player_inspector'_'timeline_timeline']",
  capture:
    "lg:grid-cols-[minmax(0,1fr)_26rem] lg:grid-rows-[minmax(0,1fr)_auto] lg:[grid-template-areas:'player_rail'_'transport_rail']",
}

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
  const { tab: tabParam, approach: approachParam } = useParams()
  const [search] = useSearchParams()
  const preferEnglish = useSettings((state) => state.useEnglishName)
  const preferred = useVideoEditPrefs((state) => state.approach) ?? "setlist"
  const user = useAuth((state) => state.user)
  const [clock] = useState(() => new PlayerClock())
  useDocumentTitle(videoTitle(video, preferEnglish))

  // Links can point at a moment, as they could in the previous UI.
  const startAt = Number(search.get("t")) || 0
  useEffect(() => {
    if (startAt > 0) clock.seek(startAt)
  }, [clock, startAt])

  const approach = isSongApproach(approachParam) ? approachParam : null
  useEffect(() => {
    if (approach) useVideoEditPrefs.getState().setApproach(approach)
  }, [approach])

  // The address always says what's on screen, so any view can be linked to.
  const songsAllowed = editableParts(video).songs
  const requested =
    resolveTab(tabParam) ?? (tabParam ? null : defaultTab(video))
  const tab = requested === "music" && songsAllowed ? "music" : "details"
  const canonical =
    tab === "music"
      ? editPath(video.id, "music", approach ?? preferred)
      : editPath(video.id, "details")
  const current = editPath(
    video.id,
    tabParam === "music"
      ? "music"
      : tabParam === "details"
        ? "details"
        : undefined,
    approach ?? undefined
  )
  if (current !== canonical) {
    const query = search.toString()
    return <Navigate to={query ? `${canonical}?${query}` : canonical} replace />
  }

  const active = tab === "music" ? approach : null
  const Approach = active ? APPROACHES[active] : null

  return (
    <SongWorkspaceProvider video={video} clock={clock}>
      <EditorHeader video={video} tab={tab} approach={approach ?? preferred}>
        {active && <SongToolbar approach={active} />}
      </EditorHeader>
      {!user && active && <LoginPrompt className="m-2 mb-0" />}
      <main
        className={cn(
          "min-h-0 flex-1 overflow-y-auto lg:grid lg:overflow-hidden",
          LAYOUTS[active ?? "details"]
        )}
      >
        <EditorPlayer
          video={video}
          clock={clock}
          className={cn(
            "sticky top-0 z-20 aspect-video w-full lg:static lg:[grid-area:player]",
            (active === "timeline" || active === "capture") &&
              "lg:aspect-auto lg:h-full"
          )}
        />
        {Approach ? (
          <Approach />
        ) : (
          <>
            <div className="hidden min-h-0 lg:block lg:overflow-hidden lg:[grid-area:info]">
              <VideoDescription video={video} className="h-full" />
            </div>
            <div className="min-h-0 lg:overflow-y-auto lg:[grid-area:main]">
              <DetailsPanel video={video} />
            </div>
          </>
        )}
      </main>
    </SongWorkspaceProvider>
  )
}
