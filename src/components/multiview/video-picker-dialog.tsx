import { useMemo, useState } from "react"
import { Link } from "react-router"
import { useQuery } from "@tanstack/react-query"
import { cn } from "cn"

import { LoadMore } from "@/components/common/load-more"
import { CheckIcon, LogoTwitchIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VideoThumbnail } from "@/components/video/video-card"
import { useIsMobile } from "@/hooks/use-mobile"
import { api } from "@/lib/api"
import { useT } from "@/lib/i18n"
import { activeVideos } from "@/lib/multiview/cells"
import { toMultiviewVideo } from "@/lib/multiview/stream"
import type { MultiviewVideo } from "@/lib/multiview/types"
import { flattenPages, useVideoFeed } from "@/lib/queries"
import type { Video } from "@/lib/types"
import { channelName, videoTitle } from "@/lib/video"
import { useAuth } from "@/stores/auth"
import { readLegacyState } from "@/stores/legacy"
import { useMultiview } from "@/stores/multiview"
import { useMultiviewUi } from "@/stores/multiview-ui"
import { useSettings } from "@/stores/settings"
import { SourceList, SourcePicker } from "./source-picker"
import { UrlField } from "./url-field"
import { useMultiviewCommands } from "./use-commands"
import {
  useDefaultSource,
  useSourceVideos,
  type VideoSourceChoice,
} from "./use-source-videos"
import { setDragVideo } from "./video-tray"

/** Chooses a video for whatever opened the picker: a cell, a chat, or auto-layout. */
export function VideoPickerDialog() {
  const { t } = useT()
  const purpose = useMultiviewUi((s) => s.picker)
  const setUi = useMultiviewUi((s) => s.set)
  const { pick } = useMultiviewCommands()
  const fallback = useDefaultSource()
  const [choice, setChoice] = useState<VideoSourceChoice | null>(null)
  const source = choice ?? fallback
  const isMobile = useIsMobile()

  const choose = (video: MultiviewVideo) => {
    if (purpose) pick(video, purpose)
    setUi({ picker: null })
  }

  return (
    <Dialog
      open={purpose !== null}
      onOpenChange={(open) => !open && setUi({ picker: null })}
    >
      <DialogContent className="flex h-[85vh] max-w-[calc(100%-1rem)] flex-col gap-3 p-4 sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {purpose?.kind === "chat"
              ? t("views.multiview.chatTarget.pickTitle")
              : t("views.multiview.video.selectLive")}
          </DialogTitle>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-3 md:flex-row">
          {isMobile ? (
            <div>
              <SourcePicker value={source} onChange={setChoice} />
            </div>
          ) : (
            <div className="w-52 shrink-0 overflow-y-auto border-r pr-2">
              <SourceList value={source} onChange={setChoice} showPlaylist />
            </div>
          )}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            {purpose !== null && (
              <SourceContent source={source} onChoose={choose} />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SourceContent({
  source,
  onChoose,
}: {
  source: VideoSourceChoice
  onChoose: (video: MultiviewVideo) => void
}) {
  const { t } = useT()
  const loggedIn = useAuth((s) => !!s.jwt)

  if (source.kind === "url") {
    return (
      <div className="flex flex-col gap-2 p-1">
        <h3 className="text-sm font-medium">
          {t("views.multiview.video.addCustomVideo")}
        </h3>
        <UrlField
          key={source.provider}
          provider={source.provider}
          onVideo={onChoose}
        />
      </div>
    )
  }
  if (source.kind === "playlist") {
    return <PlaylistContent onChoose={onChoose} />
  }
  if (source.kind === "favorites" && !loggedIn) {
    return (
      <div className="flex flex-col items-center gap-3 p-6 text-center">
        <p className="text-sm">{t("views.app.loginCallToAction")}</p>
        <Button nativeButton={false} render={<Link to="/login" />}>
          {t("component.mainNav.login")}
        </Button>
      </div>
    )
  }
  return <FeedContent source={source} onChoose={onChoose} />
}

function FeedContent({
  source,
  onChoose,
}: {
  source: Extract<VideoSourceChoice, { kind: "favorites" | "org" }>
  onChoose: (video: MultiviewVideo) => void
}) {
  const { t } = useT()
  const [tab, setTab] = useState<"live" | "archive">("live")
  const [before, setBefore] = useState("")
  const scrollMode = useSettings((s) => s.scrollMode)
  const live = useSourceVideos(source, tab === "live")
  const feed = useVideoFeed(
    {
      org: source.kind === "org" ? source.org.name : undefined,
      type: "stream",
      status: "past,missing",
      include: "mentions",
      to: before ? new Date(`${before}T23:59:59`).toISOString() : undefined,
      max_upcoming_hours: 1,
    },
    { favorites: source.kind === "favorites", enabled: tab === "archive" }
  )
  const archive = useMemo(() => flattenPages(feed.data?.pages), [feed.data])

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 pb-2">
        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as typeof tab)}
        >
          <TabsList>
            <TabsTrigger value="live">
              {t("views.home.liveOrUpcomingHeading")}
            </TabsTrigger>
            <TabsTrigger value="archive">
              {t("views.home.recentVideoToggles.official")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        {tab === "archive" && (
          <Input
            type="date"
            aria-label={t("views.multiview.archiveBefore")}
            value={before}
            onChange={(event) => setBefore(event.target.value)}
            className="ml-auto h-8 w-40"
          />
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === "live" ? (
          <VideoRows
            videos={live.videos}
            loading={live.isPending}
            onChoose={onChoose}
          />
        ) : (
          <>
            <VideoRows
              videos={archive}
              loading={feed.isPending}
              onChoose={onChoose}
            />
            <LoadMore
              hasMore={!!feed.hasNextPage}
              loading={feed.isFetchingNextPage}
              onLoadMore={() => void feed.fetchNextPage()}
              auto={scrollMode}
            />
          </>
        )}
      </div>
    </>
  )
}

/**
 * The account's saved playlists, along with whatever playlist the previous UI
 * had open on this device, which may never have been saved to an account.
 */
function PlaylistContent({
  onChoose,
}: {
  onChoose: (video: MultiviewVideo) => void
}) {
  const { t } = useT()
  const loggedIn = useAuth((s) => !!s.jwt)
  const [selected, setSelected] = useState<number | "local" | null>(null)
  const local = readLegacyState()?.playlist?.active
  const hasLocal = !!local?.videos?.length

  const lists = useQuery({
    queryKey: ["saved-playlists"],
    queryFn: ({ signal }) => api.savedPlaylists(signal),
    enabled: loggedIn,
  })
  const current =
    selected ?? (hasLocal ? "local" : (lists.data?.[0]?.id ?? null))
  const detail = useQuery({
    queryKey: ["saved-playlist", current],
    queryFn: ({ signal }) => api.savedPlaylist(current as number, signal),
    enabled: typeof current === "number",
  })
  const videos =
    current === "local" ? (local?.videos ?? []) : (detail.data?.videos ?? [])

  if (!hasLocal && !loggedIn) {
    return (
      <div className="flex flex-col items-center gap-3 p-6 text-center">
        <p className="text-sm">{t("views.app.loginCallToAction")}</p>
        <Button nativeButton={false} render={<Link to="/login" />}>
          {t("component.mainNav.login")}
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-wrap gap-1 pb-2">
        {hasLocal && (
          <Button
            size="sm"
            variant={current === "local" ? "secondary" : "ghost"}
            onClick={() => setSelected("local")}
          >
            {local?.name || t("component.mainNav.playlist")}
          </Button>
        )}
        {lists.data?.map((list) => (
          <Button
            key={list.id}
            size="sm"
            variant={current === list.id ? "secondary" : "ghost"}
            onClick={() => setSelected(list.id)}
          >
            {list.name}
          </Button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <VideoRows
          videos={videos}
          loading={lists.isLoading || detail.isLoading}
          onChoose={onChoose}
        />
      </div>
    </>
  )
}

function VideoRows({
  videos,
  loading,
  onChoose,
}: {
  videos: Video[]
  loading: boolean
  onChoose: (video: MultiviewVideo) => void
}) {
  const { t } = useT()
  const cells = useMultiview((s) => s.cells)
  const active = useMemo(
    () => new Set(activeVideos(cells).map((video) => video.id)),
    [cells]
  )
  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <Spinner />
      </div>
    )
  }
  if (!videos.length) {
    return (
      <p className="p-6 text-center text-sm text-muted-foreground">
        {t("views.multiview.noVideos")}
      </p>
    )
  }
  return (
    <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
      {videos.map((video) => (
        <VideoRow
          key={video.id}
          video={video}
          active={active}
          onChoose={onChoose}
        />
      ))}
    </div>
  )
}

function VideoRow({
  video,
  active,
  onChoose,
}: {
  video: Video
  active: ReadonlySet<string>
  onChoose: (video: MultiviewVideo) => void
}) {
  const preferEnglish = useSettings((s) => s.useEnglishName)
  const stream = toMultiviewVideo(video)
  const onScreen = !!stream && active.has(stream.id)
  return (
    <button
      type="button"
      disabled={!stream}
      draggable={!!stream}
      onDragStart={(event) => setDragVideo(event, video)}
      onClick={() => stream && onChoose(stream)}
      className={cn(
        "flex gap-2 rounded-lg p-1 text-left outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40",
        onScreen && "opacity-60"
      )}
    >
      <span className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-md bg-muted">
        <VideoThumbnail video={video} sizes="7rem" />
        {stream?.source.provider === "twitch" && (
          <LogoTwitchIcon className="absolute right-1 bottom-1 size-4 text-white" />
        )}
        {onScreen && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
            <CheckIcon className="size-6" />
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 text-sm">
          {videoTitle(video, preferEnglish)}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {channelName(video.channel, preferEnglish)}
        </span>
      </span>
    </button>
  )
}
