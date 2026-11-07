import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react"

import { Button } from "@/components/ui/button"
import { useNowSeconds } from "@/hooks/use-now"
import { useT } from "@/lib/i18n"
import type { CellId, MultiviewVideo } from "@/lib/multiview/types"
import {
  activeMessageIndex,
  archiveSubtitles,
  canJoinRoom,
  liveSubtitles,
  parseMessage,
  shouldShowLive,
  type TlMessage,
  type TlWireMessage,
} from "@/lib/tldex/messages"
import { getTlRooms } from "@/lib/tldex/socket"
import { useMultiview } from "@/stores/multiview"
import { playbackHub } from "@/stores/multiview-playback"
import { useSettings } from "@/stores/settings"
import { useTldex } from "@/stores/tldex"
import {
  HistoryControls,
  MessageList,
  TimeOffset,
  TlFrame,
  startMsOf,
  useBlockedNames,
  useCurrentTime,
  useSubtitleLines,
  useTlHistory,
} from "./tldex-parts"

export interface TlPanelProps {
  video: MultiviewVideo
  sourceCellId: CellId | null
  className?: string
  style?: CSSProperties
}

export function LiveTranslations({
  video,
  sourceCellId,
  className,
  style,
}: TlPanelProps) {
  const { t } = useT()
  const lang = useSettings((s) => s.liveTlLang)
  const settings = useTldex()
  const blocked = useBlockedNames()
  const mergeVideoData = useMultiview((s) => s.mergeVideoData)
  const { messages, setMessages, loading, complete, load } = useTlHistory(video)
  const currentTime = useCurrentTime(sourceCellId)
  const [notice, setNotice] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [showSubtitle, setShowSubtitle] = useState(settings.showSubtitle)

  const rooms = getTlRooms()
  const connection = useSyncExternalStore(
    rooms.subscribeConnection,
    rooms.getConnection
  )
  const now = useNowSeconds()
  const joinable = canJoinRoom(video.status, video.start_scheduled, now)
  const startMs = startMsOf(video)

  useEffect(() => {
    if (!joinable) return
    void load({ reset: true })
    const handle = (message: TlWireMessage) => {
      if (!message.type) {
        const current = useTldex.getState()
        if (!shouldShowLive(message, new Set(current.blocked), current)) return
        const parsed = parseMessage(message, startMs)
        parsed.receivedAt = Date.now()
        setMessages((current) => [...current, parsed])
      } else if (message.type === "update") {
        mergeVideoData(new Map([[video.id, message as never]]))
      } else if (message.type === "end") {
        setNotice(message.message)
      } else if (message.type === "error") {
        setNotice(t("views.multiview.tlUnexpectedError"))
      }
    }
    return rooms.join(video.id, lang, {
      onMessage: handle,
      onJoined: () => setNotice(null),
      onError: setNotice,
      onConnected: () => void load({ reset: true }),
    })
    // Rejoins only for a different room; everything else is read when needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video.id, lang, joinable])

  const visible = useMemo(
    () => messages.filter((m) => !blocked.has(m.name)),
    [messages, blocked]
  )
  const lines = useMemo(
    () =>
      // Nothing to caption until the video has actually started playing.
      showSubtitle && currentTime > 0
        ? liveSubtitles(visible, startMs, now)
        : EMPTY,
    [showSubtitle, currentTime, visible, startMs, now]
  )
  useSubtitleLines(video.id, lines)

  const connected = connection.kind === "connected"
  const statusMessage = !joinable
    ? t("views.watch.chat.status.notLive")
    : (notice ??
      (connection.kind === "reconnecting"
        ? `${t("views.watch.chat.status.reconnecting")} ${connection.attempt}/10`
        : connection.kind === "failed"
          ? t("views.watch.chat.status.reconnectFailed")
          : null))

  return (
    <TlFrame
      className={className}
      style={style}
      lang={lang}
      statusColor={connected ? "text-emerald-500" : "text-destructive"}
      showSubtitle={showSubtitle}
      onToggleSubtitle={() => setShowSubtitle((v) => !v)}
      list={(extra) => (
        <MessageList
          messages={visible}
          stickToEnd
          fontSize={settings.fontSize}
          loading={loading}
          before={
            <HistoryControls
              loading={loading}
              complete={complete}
              blockedCount={messages.length - visible.length}
              onMore={() => void load()}
              onAll={
                extra ? () => void load({ all: true, reset: true }) : undefined
              }
            />
          }
        />
      )}
    >
      {statusMessage && !dismissed && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-background/85 p-3 text-center text-sm">
          {statusMessage}
          <div className="flex gap-1.5">
            {joinable && !connected && (
              <Button size="xs" onClick={() => rooms.retry()}>
                {t("views.watch.chat.retryBtn")}
              </Button>
            )}
            <Button
              size="xs"
              variant="outline"
              onClick={() => setDismissed(true)}
            >
              {t("views.app.close_btn")}
            </Button>
          </div>
        </div>
      )}
    </TlFrame>
  )
}

const EMPTY: TlMessage[] = []

export function ArchiveTranslations({
  video,
  sourceCellId,
  className,
  style,
}: TlPanelProps) {
  const lang = useSettings((s) => s.liveTlLang)
  const fontSize = useTldex((s) => s.fontSize)
  const hideSpoiler = useTldex((s) => s.hideSpoiler)
  const defaultSubtitle = useTldex((s) => s.showSubtitle)
  const blocked = useBlockedNames()
  const { messages, loading, load } = useTlHistory(video)
  const currentTime = useCurrentTime(sourceCellId)
  const [offsetSeconds, setOffsetSeconds] = useState(0)
  const [showSubtitle, setShowSubtitle] = useState(defaultSubtitle)

  useEffect(() => {
    void load({ reset: true, all: true })
  }, [load])

  const shifted = useMemo(
    () =>
      messages
        .filter((m) => !blocked.has(m.name))
        .map((m) => ({
          ...m,
          relativeMs: m.relativeMs + offsetSeconds * 1000,
          timestamp: m.timestamp + offsetSeconds * 1000,
        })),
    [messages, blocked, offsetSeconds]
  )
  const ms = currentTime * 1000
  const active = activeMessageIndex(shifted, ms)
  const shown = useMemo(
    () => (hideSpoiler ? shifted.slice(0, active + 1) : shifted),
    [hideSpoiler, shifted, active]
  )

  const lines = useMemo(
    () => (showSubtitle ? archiveSubtitles(shifted, active, ms) : EMPTY),
    [showSubtitle, shifted, active, ms]
  )
  useSubtitleLines(video.id, lines)

  const seek = (message: TlMessage) => {
    if (sourceCellId) {
      playbackHub.controller(sourceCellId)?.seekTo(message.relativeMs / 1000)
    }
  }

  return (
    <TlFrame
      className={className}
      style={style}
      lang={lang}
      showSubtitle={showSubtitle}
      onToggleSubtitle={() => setShowSubtitle((v) => !v)}
      controls={
        <TimeOffset value={offsetSeconds} onChange={setOffsetSeconds} />
      }
      list={() => (
        <MessageList
          messages={shown}
          activeIndex={active}
          stickToEnd={hideSpoiler}
          fontSize={fontSize}
          loading={loading}
          onSeek={sourceCellId ? seek : undefined}
        />
      )}
    />
  )
}
