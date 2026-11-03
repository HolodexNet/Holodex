import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import { Link } from "react-router"
import { cn } from "cn"

import {
  CaretLeftIcon,
  CaretRightIcon,
  ChatbubblesIcon,
  TldexIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useT } from "@/lib/i18n"
import {
  chatScaleForWidth,
  hasEmbeddedChat,
  neighbourTarget,
  togglePanel,
  twitchChatUrl,
  youtubeChatUrl,
} from "@/lib/multiview/chat"
import { GRID_SIZE } from "@/lib/multiview/grid"
import type { CellId, ChatContent, MultiviewVideo } from "@/lib/multiview/types"
import { useResolvedMode } from "@/lib/theme/use-theme"
import { useMultiview } from "@/stores/multiview"
import { playbackHub } from "@/stores/multiview-playback"
import { useTldex } from "@/stores/tldex"
import { ChatTargetMenu } from "./chat-target-menu"
import { accentColor, useAccents, useResolvedChat } from "./selectors"
import { useStageSize } from "./stage-size"

/** Translations pull in the socket client, so they load the first time asked. */
const TlPanel = lazy(() => import("./tl-panel"))

/** Set by the Holodex+ extension when it has made replay chat available. */
declare global {
  interface Window {
    ARCHIVE_CHAT_OVERRIDE?: boolean
    HOLODEX_PLUS_INSTALLED_V3?: boolean
  }
}

/** Below this the header drops its labels. */
const COMPACT_WIDTH = 200

export function ChatFrame({
  cellId,
  content,
}: {
  cellId: CellId
  content: ChatContent
}) {
  const { t } = useT()
  const stage = useStageSize()
  const widthUnits = useMultiview(
    (s) => s.cells.find((cell) => cell.id === cellId)?.rect.w ?? 0
  )
  const setChatPanels = useMultiview((s) => s.setChatPanels)
  const setChatTarget = useMultiview((s) => s.setChatTarget)
  const resolved = useResolvedChat(cellId)
  const video = resolved?.video ?? null
  const sourceCellId = resolved?.sourceCellId ?? null
  const accents = useAccents()
  const accent = accentColor(
    sourceCellId ? accents.get(sourceCellId) : undefined
  )

  const width = (stage.width * widthUnits) / GRID_SIZE
  const compact = width < COMPACT_WIDTH
  const { panels } = content
  const tlAvailable = video?.source.provider === "youtube"
  const showTl = panels.tl && tlAvailable
  const showChat = panels.chat || !tlAvailable

  const cells = useMultiview((s) => s.cells)
  const previous = neighbourTarget(cells, sourceCellId, -1)
  const next = neighbourTarget(cells, sourceCellId, 1)

  return (
    <div className="flex size-full flex-col bg-card">
      <div className="flex shrink-0 items-center gap-0.5 p-1">
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={t("views.multiview.chatTarget.previous")}
          disabled={!previous}
          onClick={() => previous && setChatTarget(cellId, previous)}
        >
          <CaretLeftIcon />
        </Button>
        <ChatTargetMenu cellId={cellId} compact={compact} />
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={t("views.multiview.chatTarget.next")}
          disabled={!next}
          onClick={() => next && setChatTarget(cellId, next)}
        >
          <CaretRightIcon />
        </Button>
        {tlAvailable && (
          <>
            <Button
              variant={"ghost"}
              size="icon-sm"
              className="h-6 py-0"
              aria-label={t("views.multiview.chat")}
              aria-pressed={panels.chat}
              title={t("views.multiview.chat")}
              onClick={() => setChatPanels(cellId, togglePanel(panels, "chat"))}
            >
              <ChatbubblesIcon className={panels.chat ? "text-primary" : ""} />
            </Button>
            <Button
              variant={"ghost"}
              size="icon-sm"
              className="h-6 py-0"
              aria-label={t("views.multiview.tl")}
              aria-pressed={panels.tl}
              title={t("views.multiview.tl")}
              onClick={() => setChatPanels(cellId, togglePanel(panels, "tl"))}
            >
              <TldexIcon
                accent={accent}
                className={panels.tl ? "size-6 text-primary" : "size-6"}
              />
            </Button>
          </>
        )}
      </div>
      {video ? (
        <ChatPanels
          video={video}
          sourceCellId={sourceCellId}
          showChat={showChat}
          showTl={!!showTl}
          scale={chatScaleForWidth(width)}
        />
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center p-3 text-center text-sm text-muted-foreground">
          {t("views.multiview.chatTarget.waiting")}
        </div>
      )}
    </div>
  )
}

function ChatPanels({
  video,
  sourceCellId,
  showChat,
  showTl,
  scale,
}: {
  video: MultiviewVideo
  sourceCellId: CellId | null
  showChat: boolean
  showTl: boolean
  scale: number
}) {
  const stickBottom = useTldex((s) => s.stickBottom)
  const windowSize = useTldex((s) => s.windowSize)
  // Once loaded, a chat stays mounted while hidden: turning the panel back on
  // should not make the viewer sit through the iframe reloading.
  const [chatLoaded, setChatLoaded] = useState(showChat)
  if (showChat && !chatLoaded) setChatLoaded(true)

  const tlHeight = !showChat
    ? "100%"
    : windowSize > 0
      ? `${windowSize}%`
      : "250px"

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {showTl && (
        <Suspense
          fallback={
            <div className="flex flex-1 items-center justify-center">
              <Spinner />
            </div>
          }
        >
          <TlPanel
            key={video.id}
            video={video}
            sourceCellId={sourceCellId}
            className={cn("shrink-0", stickBottom && "order-2")}
            style={{ height: tlHeight }}
          />
        </Suspense>
      )}
      {chatLoaded && (
        <div className={cn("relative min-h-0 flex-1", !showChat && "hidden")}>
          <EmbeddedChat
            key={video.id}
            video={video}
            sourceCellId={sourceCellId}
            scale={scale}
          />
        </div>
      )}
    </div>
  )
}

function EmbeddedChat({
  video,
  sourceCellId,
  scale,
}: {
  video: MultiviewVideo
  sourceCellId: CellId | null
  scale: number
}) {
  const { t } = useT()
  const dark = useResolvedMode() === "dark"
  const hostname = window.location.hostname

  const scaled =
    scale === 1
      ? undefined
      : {
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: `${100 / scale}%`,
          height: `${100 / scale}%`,
        }

  if (!hasEmbeddedChat(video)) {
    return (
      <div className="flex size-full items-center justify-center p-3 text-center text-sm text-muted-foreground">
        {t("views.multiview.noVodChat")}
      </div>
    )
  }
  if (video.source.provider === "twitch") {
    return (
      <iframe
        title={t("views.multiview.chat")}
        src={twitchChatUrl(video.source.channel!, hostname, dark)}
        style={scaled}
        className="absolute inset-0 size-full border-0"
      />
    )
  }
  if (video.status === "past" && !window.ARCHIVE_CHAT_OVERRIDE) {
    const [before, after] = t("views.watch.chat.archiveNeedExtension").split(
      "{0}"
    )
    return (
      <p className="p-4 text-sm text-muted-foreground">
        {before}
        <Link to="/extension" className="text-complement hover:underline">
          Holodex+
        </Link>
        {after}
      </p>
    )
  }
  return (
    <YoutubeChat
      video={video}
      dark={dark}
      hostname={hostname}
      sourceCellId={sourceCellId}
      style={scaled}
    />
  )
}

function YoutubeChat({
  video,
  dark,
  hostname,
  sourceCellId,
  style,
}: {
  video: MultiviewVideo
  dark: boolean
  hostname: string
  sourceCellId: CellId | null
  style?: React.CSSProperties
}) {
  const { t } = useT()
  const frame = useRef<HTMLIFrameElement>(null)
  const src = useMemo(
    () =>
      youtubeChatUrl(video, {
        hostname,
        dark,
        extensionV3: !!window.HOLODEX_PLUS_INSTALLED_V3,
      }),
    // Only the identity and state of the stream change the address; a change in
    // metadata must not make the chat reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [video.id, video.status, video.channel.id, hostname, dark]
  )
  const currentTime = useSyncExternalStore(playbackHub.subscribe, () =>
    sourceCellId ? (playbackHub.getStatus(sourceCellId)?.currentTime ?? 0) : 0
  )

  // Replay chat follows the video only if told where it is.
  useEffect(() => {
    if (video.status !== "past") return
    frame.current?.contentWindow?.postMessage(
      { "yt-player-video-progress": currentTime },
      "*"
    )
  }, [currentTime, video.status])

  return (
    <>
      <span className="absolute top-1/2 left-1/2 -translate-1/2 text-sm text-muted-foreground">
        {t("views.watch.chat.loading")}
      </span>
      <iframe
        ref={frame}
        title={t("views.multiview.chat")}
        src={src}
        style={style}
        className="absolute inset-0 size-full border-0"
      />
    </>
  )
}
