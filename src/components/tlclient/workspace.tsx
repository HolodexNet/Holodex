import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "cn"

import { ErrorMessage, StateMessage } from "@/components/common/state-message"
import { Spinner } from "@/components/ui/spinner"
import { useIsMobile } from "@/hooks/use-mobile"
import { useNowMinutes } from "@/hooks/use-now"
import { useT } from "@/lib/i18n"
import { canJoinRoom } from "@/lib/tldex/messages"
import {
  activeTranslators,
  mergeFeed,
  shortSpeakerName,
} from "@/lib/tlclient/lines"
import { relayKey, roomKey, type SessionParams } from "@/lib/tlclient/session"
import type { ChannelSummary } from "@/lib/types"
import { channelName } from "@/lib/video"
import { useAuth } from "@/stores/auth"
import { useSettings } from "@/stores/settings"
import { useTlClient } from "@/stores/tlclient"
import { useTldex } from "@/stores/tldex"
import { focusComposer } from "./chat-registry"
import { ChatColumn } from "./chat-column"
import { Composer, type ComposerHandle } from "./composer"
import { TlFeed } from "./feed"
import { TlHeader } from "./header"
import { TlPlayer } from "./player"
import { Splitter } from "./splitter"
import { useOutbox } from "./use-outbox"
import { useRoomFeed, type VideoUpdate } from "./use-room-feed"
import { useSources, type SourceState } from "./use-sources"
import { sourceLabel, type Destination } from "./helpers"

export function TlWorkspace({
  params,
  onParamsChange,
}: {
  params: SessionParams
  onParamsChange: (params: SessionParams) => void
}) {
  const { t } = useT()
  const fallbackLang = useSettings((s) => s.liveTlLang)
  const lang = params.lang ?? fallbackLang
  const raws = useMemo(
    () => [params.main, ...params.collabs],
    [params.main, params.collabs]
  )
  const { sources, refetch } = useSources(raws, true)
  const main = sources[0]

  if (main.error) {
    return <ErrorMessage error={main.error} onRetry={refetch} />
  }
  if (main.pending) {
    return <StateMessage icon={<Spinner />} title={t("tlClient.finding")} />
  }
  return (
    <Session
      key={roomKey(main.source.room)}
      sources={sources}
      lang={lang}
      params={params}
      onParamsChange={onParamsChange}
    />
  )
}

function Session({
  sources,
  lang,
  params,
  onParamsChange,
}: {
  sources: SourceState[]
  lang: string
  params: SessionParams
  onParamsChange: (params: SessionParams) => void
}) {
  const user = useAuth((s) => s.user)
  const username = user?.username ?? null
  const preferEnglish = useSettings((s) => s.useEnglishName)
  const blocked = useTldex((s) => s.blocked)
  const showPlayer = useTlClient((s) => s.showPlayer)
  const showChat = useTlClient((s) => s.showChat)
  const chatWidth = useTlClient((s) => s.chatWidth)
  const playerHeight = useTlClient((s) => s.playerHeight)
  const setSetting = useTlClient((s) => s.set)
  const rememberSession = useTlClient((s) => s.rememberSession)
  const isMobile = useIsMobile()
  // Coarse on purpose: a per-second clock here would re-render the whole feed.
  const now = useNowMinutes()
  const composer = useRef<ComposerHandle>(null)
  const workspace = useRef<HTMLDivElement>(null)
  const leftColumn = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const [live, setLive] = useState<VideoUpdate>({})
  const [disabled, setDisabled] = useState<ReadonlySet<string>>(new Set())
  const [editing, setEditing] = useState<string | null>(null)

  const main = sources[0].source
  const video = main.video
  const status = live.status ?? video?.status
  const startActual = live.start_actual ?? video?.start_actual
  const startMs = startActual
    ? new Date(startActual).getTime()
    : status === "live" && video?.available_at
      ? new Date(video.available_at).getTime()
      : null
  const joinable =
    main.room.kind === "custom" ||
    canJoinRoom(status, video?.start_scheduled, now)

  const feed = useRoomFeed({
    room: main.room,
    lang,
    joinable,
    onVideoUpdate: setLive,
  })
  const outbox = useOutbox(username)

  const blockedSet = useMemo(() => new Set(blocked), [blocked])
  const remote = useMemo(
    () => feed.messages.filter((message) => !blockedSet.has(message.name)),
    [feed.messages, blockedSet]
  )
  const items = useMemo(
    () => mergeFeed(remote, outbox.lines, username),
    [remote, outbox.lines, username]
  )
  const translators = activeTranslators(remote, username, now)

  // Every source's room, and its chat when it has one; the main stream first.
  const destinations = useMemo(() => {
    const list: Destination[] = []
    const seen = new Set<string>()
    sources.forEach(({ source }, index) => {
      const label = sourceLabel(source, preferEnglish)
      const room = roomKey(source.room)
      if (!seen.has(room)) {
        seen.add(room)
        list.push({
          kind: "room",
          key: room,
          room: source.room,
          label,
          main: index === 0,
        })
      }
      if (source.chat) {
        const chat = relayKey(source.chat)
        if (!seen.has(chat)) {
          seen.add(chat)
          list.push({
            kind: "chat",
            key: chat,
            relay: source.chat,
            label,
            main: index === 0,
            indexed: !!source.video && source.chat.provider === "youtube",
          })
        }
      }
    })
    return list
  }, [sources, preferEnglish])
  const chats = destinations.filter(
    (d): d is Extract<Destination, { kind: "chat" }> => d.kind === "chat"
  )

  // Collab participants make a ready-made speaker list.
  const participants = useMemo(() => {
    const channels: ChannelSummary[] = []
    for (const { source } of sources) {
      if (!source.video) continue
      channels.push(source.video.channel, ...(source.video.mentions ?? []))
    }
    const names = channels
      .filter((channel) => channel.type !== "subber")
      .map((channel) => shortSpeakerName(channelName(channel, true)))
    return [...new Set(names)]
  }, [sources])

  const mainLabel = video?.title ?? sourceLabel(main, preferEnglish)
  useEffect(() => {
    rememberSession({
      main: params.main,
      collabs: params.collabs,
      lang,
      label: mainLabel,
    })
  }, [params.main, params.collabs, lang, mainLabel, rememberSession])

  // Clicking the player hands it the keyboard; coming back to the page takes
  // it back, so the next keystroke lands in the composer again. Chats are left
  // alone: someone typing into one by hand means to.
  useEffect(() => {
    const reclaim = () => {
      const active = document.activeElement
      if (
        active instanceof HTMLIFrameElement &&
        active.closest("[data-tl-player]")
      )
        focusComposer()
    }
    // Typing while nothing editable has focus goes into the composer.
    const typeToFocus = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey
      )
        return
      if (event.key.length !== 1 || event.key === " ") return
      const target = event.target as HTMLElement | null
      if (
        target?.closest(
          "input, textarea, select, [contenteditable='true'], [role='dialog'], [role='menu'], [role='listbox']"
        )
      )
        return
      focusComposer()
    }
    document.addEventListener("pointerover", reclaim)
    window.addEventListener("keydown", typeToFocus)
    return () => {
      document.removeEventListener("pointerover", reclaim)
      window.removeEventListener("keydown", typeToFocus)
    }
  }, [])

  const toggleDestination = (key: string) =>
    setDisabled((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const player = main.player
  const playerShown = showPlayer && !!player
  const chatShown = showChat && chats.length > 0 && !isMobile

  return (
    <>
      <TlHeader
        sources={sources}
        lang={lang}
        status={status}
        startMs={startMs}
        liveViewers={live.live_viewers ?? video?.live_viewers}
        params={params}
        onParamsChange={onParamsChange}
        hasPlayer={!!player}
        hasChats={chats.length > 0}
      />
      <div
        ref={workspace}
        className="relative flex min-h-0 flex-1 flex-col md:flex-row"
      >
        <div ref={leftColumn} className="flex min-h-0 min-w-0 flex-1 flex-col">
          {playerShown && (
            <>
              <div
                data-tl-player=""
                className={cn(
                  "relative shrink-0 bg-black",
                  isMobile && "aspect-video"
                )}
                style={isMobile ? undefined : { height: `${playerHeight}%` }}
              >
                <TlPlayer source={player} />
              </div>
              {!isMobile && (
                <Splitter
                  axis="y"
                  value={playerHeight}
                  min={20}
                  max={80}
                  container={leftColumn}
                  onChange={(value) => setSetting("playerHeight", value)}
                  onDragChange={setDragging}
                />
              )}
            </>
          )}
          <TlFeed
            className="min-h-0 flex-1"
            items={items}
            feed={feed}
            startMs={startMs}
            joinable={joinable}
            translators={translators}
            editing={editing}
            onEdit={(localId) => composer.current?.startEdit(localId)}
            onRetry={outbox.retry}
            onDelete={outbox.remove}
          />
        </div>
        {chats.length > 0 && (
          <>
            {chatShown && (
              <Splitter
                axis="x"
                value={chatWidth}
                min={18}
                max={60}
                reverse
                container={workspace}
                onChange={(value) => setSetting("chatWidth", value)}
                onDragChange={setDragging}
              />
            )}
            <ChatColumn
              chats={chats}
              disabled={disabled}
              shown={chatShown}
              style={chatShown ? { flexBasis: `${chatWidth}%` } : undefined}
            />
          </>
        )}
        {/* Iframes swallow the pointer; a resize must keep hearing it. */}
        {dragging && <div className="absolute inset-0 z-30 cursor-grabbing" />}
      </div>
      <Composer
        ref={composer}
        lang={lang}
        startMs={startMs}
        destinations={destinations}
        disabled={disabled}
        onToggleDestination={toggleDestination}
        participants={participants}
        outbox={outbox}
        editing={editing}
        onEditingChange={setEditing}
      />
    </>
  )
}
