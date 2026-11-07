import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { cn } from "cn"

import {
  ArrowDownIcon,
  ChatbubblesIcon,
  CheckIcon,
  PencilSimpleIcon,
  TrashIcon,
  WarningIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useT } from "@/lib/i18n"
import { formatDuration } from "@/lib/time"
import { tokenizeMessage, type TlToken } from "@/lib/tldex/messages"
import {
  canChangeLine,
  lineState,
  type FeedItem,
  type OwnLine,
} from "@/lib/tlclient/lines"
import { useTldex } from "@/stores/tldex"
import type { RoomFeed } from "./use-room-feed"

/** Within this distance of the bottom, the feed keeps following new lines. */
const PINNED_SLACK = 48

export function TlFeed({
  className,
  items,
  feed,
  startMs,
  joinable,
  translators,
  editing,
  onEdit,
  onRetry,
  onDelete,
}: {
  className?: string
  items: FeedItem[]
  feed: RoomFeed
  startMs: number | null
  joinable: boolean
  translators: number
  editing: string | null
  onEdit: (localId: string) => void
  onRetry: (localId: string) => void
  onDelete: (localId: string) => void
}) {
  const { t, tc } = useT()
  const fontSize = useTldex((s) => s.fontSize)
  const showLocalTime = useTldex((s) => s.showLocalTime)
  const container = useRef<HTMLDivElement>(null)
  const pinned = useRef(true)
  // How many lines there were when the translator scrolled away from the end.
  const [unpinnedAt, setUnpinnedAt] = useState<number | null>(null)
  const behind = unpinnedAt !== null && items.length > unpinnedAt

  const formatTime = (timestamp: number) =>
    startMs && !showLocalTime && timestamp > startMs - 6 * 3600_000
      ? formatDuration(timestamp - startMs)
      : new Date(timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })

  // Follows new lines unless the translator scrolled up to read.
  useLayoutEffect(() => {
    const node = container.current
    if (!node) return
    if (pinned.current) node.scrollTop = node.scrollHeight
  }, [items])

  const toBottom = () => {
    const node = container.current
    if (node) node.scrollTop = node.scrollHeight
    pinned.current = true
    setUnpinnedAt(null)
  }

  const { connection, notice } = feed
  const state = !joinable
    ? { tone: "idle", label: t("tlClient.feed.roomClosed") }
    : connection.kind === "connected"
      ? { tone: "ok", label: t("tlClient.feed.live") }
      : connection.kind === "reconnecting"
        ? {
            tone: "warn",
            label: `${t("views.watch.chat.status.reconnecting")} ${connection.attempt}/10`,
          }
        : connection.kind === "failed"
          ? {
              tone: "error",
              label: t("views.watch.chat.status.reconnectFailed"),
            }
          : { tone: "idle", label: t("tlClient.feed.connecting") }

  return (
    <section
      aria-label={t("tlClient.feed.title")}
      className={cn("relative flex flex-col bg-card", className)}
    >
      <header className="flex shrink-0 items-center gap-2 border-b px-3 py-1.5 text-xs">
        <span className="font-medium">{t("tlClient.feed.title")}</span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span
            aria-hidden="true"
            className={cn(
              "size-2 rounded-full",
              state.tone === "ok"
                ? "bg-emerald-500"
                : state.tone === "warn"
                  ? "animate-pulse bg-amber-500"
                  : state.tone === "error"
                    ? "bg-destructive"
                    : "bg-muted-foreground/40"
            )}
          />
          {state.label}
        </span>
        {connection.kind === "failed" && joinable && (
          <Button size="xs" variant="outline" onClick={feed.retry}>
            {t("views.watch.chat.retryBtn")}
          </Button>
        )}
        <span className="ml-auto text-muted-foreground tabular-nums">
          {tc("tlClient.feed.translators", translators)}
        </span>
      </header>
      <div
        ref={container}
        role="log"
        aria-live="off"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-1.5 py-1 leading-[1.4]"
        style={{ fontSize }}
        onScroll={(event) => {
          const node = event.currentTarget
          pinned.current =
            node.scrollHeight - node.scrollTop - node.clientHeight <
            PINNED_SLACK
          if (pinned.current) setUnpinnedAt(null)
          else if (unpinnedAt === null) setUnpinnedAt(items.length)
        }}
      >
        <div className="flex justify-center py-1">
          {feed.loading ? (
            <Spinner />
          ) : feed.complete ? (
            <span className="text-xs text-muted-foreground">
              {t("views.watch.chat.tlStart")}
            </span>
          ) : (
            <Button variant="ghost" size="xs" onClick={feed.loadOlder}>
              {t("tlClient.feed.loadOlder")}
            </Button>
          )}
        </div>
        {!items.length && !feed.loading && (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            {t("tlClient.feed.empty")}
          </p>
        )}
        {items.map((item) =>
          item.kind === "own" ? (
            <OwnRow
              key={item.line.localId}
              line={item.line}
              time={formatTime(item.line.timestamp)}
              editing={editing === item.line.localId}
              onEdit={onEdit}
              onRetry={onRetry}
              onDelete={onDelete}
            />
          ) : (
            <Row
              key={item.message.key}
              time={formatTime(item.message.timestamp)}
              name={item.message.name}
              tone={
                item.mine
                  ? "mine"
                  : item.message.is_owner
                    ? "owner"
                    : item.message.is_vtuber ||
                        item.message.is_moderator ||
                        item.message.is_verified
                      ? "special"
                      : "tl"
              }
              tokens={item.message.tokens}
            />
          )
        )}
        {notice && (
          <p className="mx-1 my-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            {notice}
          </p>
        )}
      </div>
      {behind && (
        <Button
          size="xs"
          className="absolute bottom-2 left-1/2 -translate-x-1/2 shadow-md"
          onClick={toBottom}
        >
          <ArrowDownIcon data-icon="inline-start" />
          {t("tlClient.feed.newLines")}
        </Button>
      )}
    </section>
  )
}

type Tone = "mine" | "owner" | "special" | "tl"

function Row({
  time,
  name,
  tone,
  tokens,
  className,
  children,
}: {
  time: string
  name: string
  tone: Tone
  tokens: TlToken[]
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "group relative flex items-start gap-1.5 rounded-md py-0.5 pr-1 pl-1.5 [contain-intrinsic-size:auto_1.6em] [content-visibility:auto] hover:bg-muted/50",
        className
      )}
    >
      <span className="w-[4.5em] shrink-0 pt-px text-right text-[0.8em] text-muted-foreground tabular-nums">
        {time}
      </span>
      <p className="min-w-0 flex-1 wrap-anywhere">
        <span
          className={cn(
            "mr-1.5 text-[0.85em] font-medium",
            tone === "mine"
              ? "text-primary"
              : tone === "owner"
                ? "text-brand"
                : tone === "special"
                  ? "text-complement"
                  : "text-muted-foreground"
          )}
        >
          {name}
        </span>
        {tokens.map((token, index) =>
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
      </p>
      {children}
    </div>
  )
}

function OwnRow({
  line,
  time,
  editing,
  onEdit,
  onRetry,
  onDelete,
}: {
  line: OwnLine
  time: string
  editing: boolean
  onEdit: (localId: string) => void
  onRetry: (localId: string) => void
  onDelete: (localId: string) => void
}) {
  const { t } = useT()
  const [confirming, setConfirming] = useState(false)
  const state = lineState(line)
  const changeable = canChangeLine(line)
  const failedRooms = Object.values(line.rooms).filter(
    (d) => d.state === "failed"
  )

  useEffect(() => {
    if (!confirming) return
    const timer = setTimeout(() => setConfirming(false), 3000)
    return () => clearTimeout(timer)
  }, [confirming])

  return (
    <Row
      time={time}
      name={t("tlClient.feed.you")}
      tone="mine"
      tokens={tokenizeMessage(line.message)}
      className={cn(
        "border-l-2 border-primary/50 bg-primary/5",
        editing && "bg-primary/15 ring-1 ring-primary/40",
        state === "failed" && "border-destructive bg-destructive/5",
        line.busy && "opacity-60"
      )}
    >
      <span className="flex shrink-0 items-center gap-0.5 pt-px text-[0.8em]">
        {line.edited && (
          <span className="text-muted-foreground">
            {t("tlClient.feed.edited")}
          </span>
        )}
        {line.relays.tooLong.length > 0 && (
          <span
            title={t("tlClient.feed.tooLongForChat")}
            className="text-amber-500"
          >
            <ChatbubblesIcon className="size-3.5" />
          </span>
        )}
        {state === "sending" || line.busy ? (
          <Spinner
            className="size-3.5"
            aria-label={t("tlClient.feed.sending")}
          />
        ) : state === "failed" ? (
          <span
            className="text-destructive"
            title={failedRooms
              .map((d) => d.error)
              .filter(Boolean)
              .join("\n")}
          >
            <WarningIcon
              className="size-3.5"
              aria-label={t("tlClient.feed.failed")}
            />
          </span>
        ) : (
          <CheckIcon
            className="size-3.5 text-muted-foreground/70"
            aria-label={t("tlClient.feed.sent")}
          />
        )}
      </span>
      <span
        className={cn(
          "absolute top-0 right-1 flex items-center gap-0.5 rounded-md bg-popover p-0.5 shadow-sm ring-1 ring-foreground/10",
          state === "failed" || confirming
            ? "flex"
            : "hidden group-focus-within:flex group-hover:flex"
        )}
      >
        {state === "failed" && !line.busy && (
          <Button
            size="xs"
            variant="destructive"
            onClick={() => onRetry(line.localId)}
          >
            {t("views.watch.chat.retryBtn")}
          </Button>
        )}
        {changeable && (
          <Button
            size="icon-xs"
            variant="ghost"
            title={t("tlClient.feed.edit")}
            aria-label={t("tlClient.feed.edit")}
            onClick={() => onEdit(line.localId)}
          >
            <PencilSimpleIcon />
          </Button>
        )}
        {(changeable || state === "failed") &&
          (confirming ? (
            <Button
              size="xs"
              variant="destructive"
              onClick={() => {
                setConfirming(false)
                onDelete(line.localId)
              }}
            >
              {t("tlClient.feed.confirmDelete")}
            </Button>
          ) : (
            <Button
              size="icon-xs"
              variant="ghost"
              title={t("tlClient.feed.delete")}
              aria-label={t("tlClient.feed.delete")}
              onClick={() => setConfirming(true)}
            >
              <TrashIcon />
            </Button>
          ))}
      </span>
    </Row>
  )
}
