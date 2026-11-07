import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react"
import { cn } from "cn"

import {
  ArrowSquareOutIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CornersOutIcon,
  GearSixIcon,
  SubtitlesIcon,
} from "@/components/icons"
import { SimpleSelect } from "@/components/common/simple-select"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { useNowSeconds } from "@/hooks/use-now"
import { api } from "@/lib/api"
import { TL_LANGS } from "@/lib/consts"
import { useT } from "@/lib/i18n"
import type { CellId, MultiviewVideo } from "@/lib/multiview/types"
import { formatDuration } from "@/lib/time"
import {
  activeMessageIndex,
  archiveSubtitles,
  canJoinRoom,
  liveSubtitles,
  parseMessage,
  shouldShowLive,
  showsAuthor,
  type TlMessage,
  type TlWireMessage,
} from "@/lib/tldex/messages"
import { getTlRooms } from "@/lib/tldex/socket"
import { useMultiview } from "@/stores/multiview"
import { playbackHub } from "@/stores/multiview-playback"
import { useSettings } from "@/stores/settings"
import { useTlSubtitles, useTldex, type TlSettings } from "@/stores/tldex"

const HISTORY_PAGE = 20
const ALL_MESSAGES = 100_000

const startMsOf = (video: MultiviewVideo) =>
  video.available_at ? new Date(video.available_at).getTime() : null

function useCurrentTime(cellId: CellId | null) {
  return useSyncExternalStore(playbackHub.subscribe, () =>
    cellId ? (playbackHub.getStatus(cellId)?.currentTime ?? 0) : 0
  )
}

function useBlockedNames() {
  const blocked = useTldex((s) => s.blocked)
  return useMemo(() => new Set(blocked), [blocked])
}

interface TlPanelProps {
  video: MultiviewVideo
  sourceCellId: CellId | null
  className?: string
  style?: CSSProperties
}

/** TLdex for one stream: a live room, or the archive once the stream has ended. */
export default function TlPanel(props: TlPanelProps) {
  const { t } = useT()
  const currentTime = useCurrentTime(props.sourceCellId)
  const { video } = props

  // Members-only translations are for people who can actually play the video.
  if (video.topic_id === "membersonly" && currentTime <= 0) {
    return (
      <div
        className={cn("border-b p-3 text-sm", props.className)}
        style={props.style}
      >
        {t("views.multiview.tlMembersOnly")}
      </div>
    )
  }
  return video.status === "upcoming" || video.status === "live" ? (
    <LiveTranslations {...props} />
  ) : (
    <ArchiveTranslations {...props} />
  )
}

/** Fetches recorded messages, oldest first, for either kind of panel. */
function useTlHistory(video: MultiviewVideo) {
  const lang = useSettings((s) => s.liveTlLang)
  const showVerified = useTldex((s) => s.showVerified)
  const showModerator = useTldex((s) => s.showModerator)
  const showVtuber = useTldex((s) => s.showVtuber)
  const [messages, setMessages] = useState<TlMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [complete, setComplete] = useState(false)
  const startMs = startMsOf(video)
  const oldest = useRef<number | undefined>(undefined)

  const load = useCallback(
    async ({ reset = false, all = false } = {}) => {
      setLoading(true)
      const limit = all ? ALL_MESSAGES : HISTORY_PAGE
      try {
        const rows = await api.chatHistory(video.id, {
          lang,
          verified: showVerified,
          moderator: showModerator,
          vtuber: showVtuber,
          limit,
          before: reset ? undefined : oldest.current,
        })
        const parsed = rows.map((row) => parseMessage(row, startMs))
        setComplete(all || rows.length !== limit)
        setMessages((current) => (reset ? parsed : [...parsed, ...current]))
        if (parsed[0]) oldest.current = parsed[0].timestamp
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    },
    [video.id, lang, showVerified, showModerator, showVtuber, startMs]
  )

  return { messages, setMessages, loading, complete, load }
}

/** Publishes subtitle lines for the video frame, and takes them down again. */
function useSubtitleLines(videoId: string, lines: TlMessage[]) {
  const setSubtitles = useTlSubtitles((s) => s.setSubtitles)
  useEffect(() => {
    setSubtitles(videoId, lines)
  }, [videoId, lines, setSubtitles])
  useEffect(() => () => setSubtitles(videoId, []), [videoId, setSubtitles])
}

function LiveTranslations({
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

function ArchiveTranslations({
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

function TimeOffset({
  value,
  onChange,
}: {
  value: number
  onChange: (value: number) => void
}) {
  return (
    <>
      <Button
        variant="ghost"
        size="icon-xs"
        title="-2s"
        aria-label="-2s"
        onClick={() => onChange(value - 2)}
      >
        <CaretLeftIcon />
      </Button>
      <input
        type="number"
        aria-label="Offset"
        value={value}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
        className="w-9 [appearance:textfield] rounded-sm bg-muted/60 text-center font-mono text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring [&::-webkit-inner-spin-button]:appearance-none"
      />
      <Button
        variant="ghost"
        size="icon-xs"
        title="+2s"
        aria-label="+2s"
        onClick={() => onChange(value + 2)}
      >
        <CaretRightIcon />
      </Button>
    </>
  )
}

/** The header and body shared by the live and archive panels. */
function TlFrame({
  className,
  style,
  lang,
  statusColor,
  showSubtitle,
  onToggleSubtitle,
  controls,
  list,
  children,
}: {
  className?: string
  style?: CSSProperties
  lang: string
  statusColor?: string
  showSubtitle: boolean
  onToggleSubtitle: () => void
  controls?: ReactNode
  /** Renders the messages; `expanded` when in the enlarged dialog. */
  list: (expanded: boolean) => ReactNode
  children?: ReactNode
}) {
  const { t } = useT()
  const [expanded, setExpanded] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-col border-y bg-card text-sm",
        className
      )}
      style={style}
    >
      <div className="flex shrink-0 items-center justify-between gap-1 px-2 py-0.5 text-xs">
        <span className={cn("font-medium whitespace-nowrap", statusColor)}>
          TLdex [{lang}]
        </span>
        <span className="flex items-center gap-0.5">
          {controls}
          <Button
            variant="ghost"
            size="icon-xs"
            aria-pressed={showSubtitle}
            title={t("views.watch.chat.showSubtitle")}
            aria-label={t("views.watch.chat.showSubtitle")}
            className={cn(showSubtitle && "text-primary")}
            onClick={onToggleSubtitle}
          >
            <SubtitlesIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            title={t("views.watch.chat.expandTL")}
            aria-label={t("views.watch.chat.expandTL")}
            onClick={() => setExpanded(true)}
          >
            <CornersOutIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            title={t("views.watch.chat.TLSettingsTitle")}
            aria-label={t("views.watch.chat.TLSettingsTitle")}
            onClick={() => setSettingsOpen(true)}
          >
            <GearSixIcon />
          </Button>
        </span>
      </div>
      {!expanded && list(false)}
      {children}
      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent className="flex h-[80vh] flex-col sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>TLdex [{lang}]</DialogTitle>
          </DialogHeader>
          {expanded && list(true)}
        </DialogContent>
      </Dialog>
      <TlSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  )
}

function HistoryControls({
  loading,
  complete,
  blockedCount,
  onMore,
  onAll,
}: {
  loading: boolean
  complete: boolean
  blockedCount: number
  onMore: () => void
  onAll?: () => void
}) {
  const { t } = useT()
  return (
    <div className="flex flex-col items-center gap-0.5 py-1 text-xs">
      {loading ? (
        <Spinner />
      ) : (
        <Button variant="ghost" size="xs" disabled={complete} onClick={onMore}>
          {complete
            ? t("views.watch.chat.tlStart")
            : t("component.description.showMore")}
        </Button>
      )}
      {blockedCount > 0 && (
        <span className="text-muted-foreground">
          {t("views.multiview.tlBlockedCount", [blockedCount])}
        </span>
      )}
      {onAll && !complete && !loading && (
        <Button variant="ghost" size="xs" onClick={onAll}>
          {t("views.multiview.tlLoadAll")}
        </Button>
      )}
    </div>
  )
}

function MessageList({
  messages,
  activeIndex,
  stickToEnd = false,
  fontSize,
  loading,
  before,
  onSeek,
}: {
  messages: TlMessage[]
  activeIndex?: number
  stickToEnd?: boolean
  fontSize: number
  loading: boolean
  before?: ReactNode
  onSeek?: (message: TlMessage) => void
}) {
  const { t } = useT()
  const container = useRef<HTMLDivElement>(null)
  const activeRow = useRef<HTMLDivElement>(null)
  const pinned = useRef(true)

  // Follows new messages, unless the reader has scrolled up to read older ones.
  useLayoutEffect(() => {
    const node = container.current
    if (stickToEnd && node && pinned.current) node.scrollTop = node.scrollHeight
  }, [messages, stickToEnd])

  useLayoutEffect(() => {
    const node = container.current
    const row = activeRow.current
    if (stickToEnd || !node || !row) return
    node.scrollTop = row.offsetTop - node.clientHeight / 2 + row.clientHeight
  }, [activeIndex, stickToEnd])

  return (
    <div
      ref={container}
      className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-1 leading-[1.35]"
      style={{ fontSize }}
      onScroll={(event) => {
        const node = event.currentTarget
        pinned.current =
          node.scrollHeight - node.scrollTop - node.clientHeight < 40
      }}
    >
      {before}
      {!messages.length && !loading && (
        <p className="p-3 text-center text-muted-foreground">
          {t("views.multiview.tlEmpty")}
        </p>
      )}
      {messages.map((message, index) => (
        <MessageRow
          key={message.key}
          ref={index === activeIndex ? activeRow : undefined}
          message={message}
          withAuthor={showsAuthor(messages, index)}
          active={index === activeIndex}
          onSeek={onSeek}
        />
      ))}
    </div>
  )
}

function MessageRow({
  ref,
  message,
  withAuthor,
  active,
  onSeek,
}: {
  ref?: React.Ref<HTMLDivElement>
  message: TlMessage
  withAuthor: boolean
  active: boolean
  onSeek?: (message: TlMessage) => void
}) {
  const showLocalTime = useTldex((s) => s.showLocalTime)
  const [authorOpen, setAuthorOpen] = useState(false)
  const relative =
    message.relativeMs &&
    `${message.relativeMs < 0 ? "-" : ""}${formatDuration(Math.abs(message.relativeMs))}`
  const time =
    showLocalTime || !relative
      ? new Date(message.timestamp).toLocaleTimeString()
      : relative

  return (
    <div
      ref={ref}
      // The archive can hold thousands of rows; let the browser skip rendering
      // the ones out of view.
      className={cn(
        "relative [contain-intrinsic-size:auto_1.5em] [content-visibility:auto]",
        withAuthor && "mt-1 border-t border-border/50 pt-1"
      )}
    >
      {withAuthor && (
        <button
          type="button"
          className={cn(
            "max-w-full cursor-pointer text-left text-[0.85em] wrap-anywhere hover:underline",
            message.is_owner
              ? "text-primary"
              : message.is_verified || message.is_moderator || message.is_vtuber
                ? "text-complement"
                : "text-muted-foreground"
          )}
          onClick={() => setAuthorOpen(true)}
        >
          {message.is_vtuber && "[Vtuber] "}
          {message.is_moderator && "[Mod] "}
          {message.name}
          {message.is_verified && <span className="font-extrabold"> ✓</span>}:
        </button>
      )}
      <div
        className={cn(
          "wrap-anywhere",
          active && "rounded-sm bg-primary/25",
          onSeek && "cursor-pointer hover:bg-muted/60"
        )}
        onClick={onSeek && (() => onSeek(message))}
      >
        <span className="mr-1 text-[0.85em] text-muted-foreground tabular-nums">
          {time}
        </span>
        {message.tokens.map((token, index) =>
          token.kind === "text" ? (
            <span key={index}>{token.text}</span>
          ) : (
            <img
              key={index}
              src={token.src}
              alt={token.alt}
              className="inline h-[1.3em] w-auto align-middle"
            />
          )
        )}
      </div>
      {authorOpen && (
        <AuthorDialog message={message} onClose={() => setAuthorOpen(false)} />
      )}
    </div>
  )
}

function AuthorDialog({
  message,
  onClose,
}: {
  message: TlMessage
  onClose: () => void
}) {
  const { t } = useT()
  const blocked = useTldex((s) => s.blocked.includes(message.name))
  const toggleBlocked = useTldex((s) => s.toggleBlocked)
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{message.name}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-wrap gap-2">
          {message.channel_id && (
            <Button
              nativeButton={false}
              variant="outline"
              render={
                <a
                  href={`https://youtube.com/channel/${encodeURIComponent(message.channel_id)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <ArrowSquareOutIcon data-icon="inline-start" />
              YouTube
            </Button>
          )}
          {message.channel_id && message.is_vtuber && (
            <Button
              nativeButton={false}
              variant="outline"
              render={
                <a
                  href={`/channel/${encodeURIComponent(message.channel_id)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <ArrowSquareOutIcon data-icon="inline-start" />
              Holodex
            </Button>
          )}
          <Button
            variant={blocked ? "outline" : "destructive"}
            onClick={() => toggleBlocked(message.name)}
          >
            {blocked
              ? t("views.multiview.tlUnblock")
              : t("views.multiview.tlBlock")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const FONT_SIZES = [10, 11, 12, 14, 18, 24, 30]
const WINDOW_SIZES = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

const TOGGLES: { key: keyof TlSettings; label: string }[] = [
  { key: "showVerified", label: "views.watch.chat.showVerifiedMessages" },
  { key: "showModerator", label: "views.watch.chat.showModeratorMessages" },
  { key: "showVtuber", label: "views.watch.chat.showVtuberMessages" },
  { key: "showLocalTime", label: "views.watch.chat.showLocalTime" },
  { key: "showSubtitle", label: "views.watch.chat.showSubtitle" },
  { key: "hideSpoiler", label: "views.watch.chat.hideSpoiler" },
  { key: "stickBottom", label: "views.watch.chat.StickBottomSettingLabel" },
]

function TlSettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useT()
  const settings = useTldex()
  const liveTlLang = useSettings((s) => s.liveTlLang)
  const setSetting = useSettings((s) => s.set)
  const [showBlocked, setShowBlocked] = useState(false)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) setShowBlocked(false)
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {showBlocked
              ? t("views.channels.tabs.Blocked")
              : t("views.watch.chat.TLSettingsTitle")}
          </DialogTitle>
        </DialogHeader>
        {showBlocked ? (
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="self-start"
              onClick={() => setShowBlocked(false)}
            >
              <CaretLeftIcon data-icon="inline-start" />
              {t("views.multiview.tlBack")}
            </Button>
            {settings.blocked.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {t("views.multiview.tlNothingBlocked")}
              </p>
            )}
            {settings.blocked.map((name) => (
              <div key={name} className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate">{name}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => settings.toggleBlocked(name)}
                >
                  {t("views.multiview.tlUnblock")}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>{t("views.settings.tlLanguageSelection")}</Label>
              <SimpleSelect
                value={liveTlLang}
                onChange={(value) => setSetting("liveTlLang", value)}
                options={TL_LANGS.map((l) => ({
                  value: l.value,
                  label: l.text,
                }))}
              />
            </div>
            {TOGGLES.map(({ key, label }) => (
              <div
                key={key}
                className="flex items-center justify-between gap-3"
              >
                <Label htmlFor={`tl-${key}`}>{t(label)}</Label>
                <Switch
                  id={`tl-${key}`}
                  checked={settings[key] as boolean}
                  onCheckedChange={(checked) =>
                    settings.set(key, checked as never)
                  }
                />
              </div>
            ))}
            <Button
              variant="outline"
              className="self-start"
              onClick={() => setShowBlocked(true)}
            >
              {t("views.multiview.tlEditBlocked")}
            </Button>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="tl-font">
                {t("views.watch.chat.tlFontSize")} (px)
              </Label>
              <Input
                id="tl-font"
                type="number"
                min={8}
                max={48}
                list="tl-font-sizes"
                className="w-24"
                value={settings.fontSize}
                onChange={(event) =>
                  settings.set("fontSize", Number(event.target.value) || 14)
                }
              />
              <datalist id="tl-font-sizes">
                {FONT_SIZES.map((size) => (
                  <option key={size} value={size} />
                ))}
              </datalist>
            </div>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="tl-window">
                {t("views.watch.chat.tlWindowSize")}
              </Label>
              <Input
                id="tl-window"
                type="number"
                min={0}
                max={100}
                list="tl-window-sizes"
                className="w-24"
                value={settings.windowSize}
                onChange={(event) =>
                  settings.set("windowSize", Number(event.target.value) || 0)
                }
              />
              <datalist id="tl-window-sizes">
                {WINDOW_SIZES.map((size) => (
                  <option key={size} value={size} />
                ))}
              </datalist>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
