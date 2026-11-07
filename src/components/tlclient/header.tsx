import { useState } from "react"
import { useNavigate } from "react-router"
import { cn } from "cn"

import { ChannelAvatar } from "@/components/common/channel-avatar"
import { SimpleSelect } from "@/components/common/simple-select"
import {
  ArrowLeftIcon,
  ChatbubblesIcon,
  GearSixIcon,
  KeyboardIcon,
  MonitorPlayIcon,
  PlusIcon,
  StarFillIcon,
  TrashIcon,
  UsersThreeIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useNowSeconds } from "@/hooks/use-now"
import { useT } from "@/lib/i18n"
import { formatDuration } from "@/lib/time"
import type { SessionParams } from "@/lib/tlclient/session"
import { channelName, videoTitle } from "@/lib/video"
import { useSettings } from "@/stores/settings"
import { useTlClient } from "@/stores/tlclient"
import { focusComposer } from "./chat-registry"
import { TlSettingsDialog } from "./settings"
import { ALT_KEY } from "./speakers"
import type { SourceState } from "./use-sources"
import { postableLangOptions, sourceLabel } from "./helpers"

export function TlHeader({
  sources,
  lang,
  status,
  startMs,
  liveViewers,
  params,
  onParamsChange,
  hasPlayer,
  hasChats,
}: {
  sources: SourceState[]
  lang: string
  status: string | undefined
  startMs: number | null
  liveViewers: number | null | undefined
  params: SessionParams
  onParamsChange: (params: SessionParams) => void
  hasPlayer: boolean
  hasChats: boolean
}) {
  const { t } = useT()
  const navigate = useNavigate()
  const preferEnglish = useSettings((s) => s.useEnglishName)
  const showPlayer = useTlClient((s) => s.showPlayer)
  const showChat = useTlClient((s) => s.showChat)
  const setSetting = useTlClient((s) => s.set)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const now = useNowSeconds()
  const main = sources[0].source
  const video = main.video
  const title = video ? videoTitle(video, preferEnglish) : main.raw

  const leave = () => {
    if ((window.history.state?.idx ?? 0) > 0) void navigate(-1)
    else void navigate("/")
  }

  return (
    <header className="flex shrink-0 items-center gap-1.5 border-b px-2 py-1.5 pt-[max(0.375rem,env(safe-area-inset-top))]">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={t("tlClient.header.back")}
        title={t("tlClient.header.back")}
        onClick={leave}
      >
        <ArrowLeftIcon />
      </Button>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {video && (
          <ChannelAvatar
            channel={video.channel}
            size={30}
            live={status === "live"}
          />
        )}
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-1.5">
            <StatusBadge status={video ? status : "custom"} />
            <h1 className="truncate text-sm font-medium" title={title}>
              {title}
            </h1>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            <span className="font-medium text-foreground/80">
              {t("tlClient.title")}
            </span>
            {video && <> · {channelName(video.channel, preferEnglish)}</>}
            {status === "live" && startMs && (
              <span className="tabular-nums">
                {" "}
                · {formatDuration(now - startMs)}
              </span>
            )}
            {status === "live" && liveViewers ? (
              <span className="hidden sm:inline">
                {" "}
                ·{" "}
                {t("component.videoCard.watching", [
                  liveViewers.toLocaleString(),
                ])}
              </span>
            ) : null}
          </p>
        </div>
      </div>
      <StreamsPopover
        sources={sources}
        params={params}
        onParamsChange={onParamsChange}
      />
      <SimpleSelect
        size="sm"
        aria-label={t("views.watch.uploadPanel.tlLang")}
        value={lang}
        onChange={(value) => onParamsChange({ ...params, lang: value })}
        options={postableLangOptions()}
        className="hidden w-32 sm:flex"
      />
      {hasPlayer && (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-pressed={showPlayer}
          title={t("tlClient.layout.togglePlayer")}
          aria-label={t("tlClient.layout.togglePlayer")}
          className={cn(showPlayer && "text-primary")}
          onClick={() => setSetting("showPlayer", !showPlayer)}
        >
          <MonitorPlayIcon />
        </Button>
      )}
      {hasChats && (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-pressed={showChat}
          title={t("tlClient.layout.toggleChat")}
          aria-label={t("tlClient.layout.toggleChat")}
          className={cn("hidden md:inline-flex", showChat && "text-primary")}
          onClick={() => setSetting("showChat", !showChat)}
        >
          <ChatbubblesIcon />
        </Button>
      )}
      <ShortcutsPopover />
      <Button
        variant="ghost"
        size="icon-sm"
        title={t("tlClient.header.settings")}
        aria-label={t("tlClient.header.settings")}
        onClick={() => setSettingsOpen(true)}
      >
        <GearSixIcon />
      </Button>
      <TlSettingsDialog
        open={settingsOpen}
        onOpenChange={(open) => {
          setSettingsOpen(open)
          if (!open) focusComposer()
        }}
        lang={lang}
        onLangChange={(value) => onParamsChange({ ...params, lang: value })}
      />
    </header>
  )
}

function StatusBadge({ status }: { status: string | undefined }) {
  const { t } = useT()
  if (status === "live")
    return (
      <span className="shrink-0 rounded-sm bg-live px-1.5 py-px text-[10px] font-bold tracking-wide text-white uppercase">
        {t("tlClient.header.live")}
      </span>
    )
  const label =
    status === "upcoming"
      ? t("tlClient.header.upcoming")
      : status === "custom"
        ? t("tlClient.header.custom")
        : status === "past" || status === "missing"
          ? t("tlClient.header.ended")
          : null
  if (!label) return null
  return (
    <span className="shrink-0 rounded-sm bg-muted px-1.5 py-px text-[10px] font-medium text-muted-foreground uppercase">
      {label}
    </span>
  )
}

/** The streams this session posts to: one main, and any number of collab POVs. */
function StreamsPopover({
  sources,
  params,
  onParamsChange,
}: {
  sources: SourceState[]
  params: SessionParams
  onParamsChange: (params: SessionParams) => void
}) {
  const { t } = useT()
  const preferEnglish = useSettings((s) => s.useEnglishName)
  const [open, setOpen] = useState(false)
  const [link, setLink] = useState("")
  const main = sources[0].source
  const added = new Set([params.main, ...params.collabs])
  const knownIds = new Set(
    sources.map(({ source }) => source.video?.id).filter(Boolean)
  )
  const suggestions = (main.video?.simulcasts ?? []).filter(
    (ref) => !added.has(ref.id) && !knownIds.has(ref.id)
  )

  const addCollab = (value: string) => {
    if (!value.trim()) return
    onParamsChange({ ...params, collabs: [...params.collabs, value.trim()] })
    setLink("")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5 px-2.5"
          />
        }
      >
        <UsersThreeIcon data-icon="inline-start" />
        <span className="hidden sm:inline">{t("tlClient.header.streams")}</span>
        <span className="tabular-nums">{sources.length}</span>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[min(24rem,calc(100vw-1rem))] gap-3 p-3"
      >
        <PopoverTitle className="text-sm">
          {t("tlClient.header.streamsTitle")}
        </PopoverTitle>
        <ul className="flex flex-col gap-1">
          {sources.map(({ source, pending }, index) => (
            <li
              key={source.raw}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/60"
            >
              {index === 0 ? (
                <StarFillIcon
                  className="size-3.5 shrink-0 text-primary"
                  aria-label={t("tlClient.header.main")}
                />
              ) : (
                <span className="size-3.5 shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm">
                  {source.video
                    ? videoTitle(source.video, preferEnglish)
                    : source.raw}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {pending
                    ? t("tlClient.finding")
                    : `${sourceLabel(source, preferEnglish)} · ${
                        source.room.kind === "custom"
                          ? t("tlClient.destinations.customRoom")
                          : t("tlClient.destinations.room")
                      }`}
                </div>
              </div>
              {index > 0 && (
                <>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() =>
                      onParamsChange({
                        ...params,
                        main: source.raw,
                        collabs: [
                          params.main,
                          ...params.collabs.filter((c) => c !== source.raw),
                        ],
                      })
                    }
                  >
                    {t("tlClient.header.makeMain")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={t("tlClient.setup.remove")}
                    onClick={() =>
                      onParamsChange({
                        ...params,
                        collabs: params.collabs.filter((c) => c !== source.raw),
                      })
                    }
                  >
                    <TrashIcon />
                  </Button>
                </>
              )}
            </li>
          ))}
        </ul>
        {suggestions.length > 0 && (
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-muted-foreground">
              {t("tlClient.setup.suggested")}
            </p>
            {suggestions.map((ref) => (
              <button
                key={ref.id}
                type="button"
                onClick={() => addCollab(ref.id)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-muted"
              >
                <PlusIcon className="size-3.5 shrink-0 text-primary" />
                <span className="min-w-0 flex-1 truncate">
                  {ref.channel?.name ?? ref.title ?? ref.id}
                </span>
              </button>
            ))}
          </div>
        )}
        <form
          className="flex gap-1.5"
          onSubmit={(event) => {
            event.preventDefault()
            addCollab(link)
          }}
        >
          <Input
            value={link}
            onChange={(event) => setLink(event.target.value)}
            placeholder={t("tlClient.setup.addCollab")}
            aria-label={t("tlClient.setup.addCollab")}
            className="h-8"
          />
          <Button type="submit" size="sm" disabled={!link.trim()}>
            {t("tlClient.setup.add")}
          </Button>
        </form>
        <Button
          variant="ghost"
          size="sm"
          className="self-start"
          onClick={() =>
            onParamsChange({ main: "", collabs: [], lang: params.lang })
          }
        >
          {t("tlClient.header.newSession")}
        </Button>
      </PopoverContent>
    </Popover>
  )
}

function ShortcutsPopover() {
  const { t } = useT()
  const rows: [React.ReactNode, string][] = [
    [<Kbd key="k">⏎</Kbd>, t("tlClient.shortcuts.send")],
    [<Kbd key="k">Tab</Kbd>, t("tlClient.shortcuts.nextSpeaker")],
    [
      <span key="k" className="flex gap-0.5">
        <Kbd>⇧</Kbd>
        <Kbd>Tab</Kbd>
      </span>,
      t("tlClient.shortcuts.previousSpeaker"),
    ],
    [
      <span key="k" className="flex gap-0.5">
        <Kbd>{ALT_KEY}</Kbd>
        <Kbd>1</Kbd>
      </span>,
      t("tlClient.shortcuts.noSpeaker"),
    ],
    [
      <span key="k" className="flex gap-0.5">
        <Kbd>{ALT_KEY}</Kbd>
        <Kbd>2–9</Kbd>
      </span>,
      t("tlClient.shortcuts.pickSpeaker"),
    ],
    [<Kbd key="k">↑</Kbd>, t("tlClient.shortcuts.editLast")],
    [
      <span key="k" className="flex gap-0.5">
        <Kbd>↑</Kbd>
        <Kbd>↓</Kbd>
      </span>,
      t("tlClient.shortcuts.walkLines"),
    ],
    [<Kbd key="k">Esc</Kbd>, t("tlClient.shortcuts.cancel")],
    [<Kbd key="k">A–Z</Kbd>, t("tlClient.shortcuts.anywhere")],
  ]
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="hidden sm:inline-flex"
            title={t("tlClient.header.shortcuts")}
            aria-label={t("tlClient.header.shortcuts")}
          />
        }
      >
        <KeyboardIcon />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 gap-2 p-3">
        <PopoverTitle className="text-sm">
          {t("tlClient.header.shortcuts")}
        </PopoverTitle>
        <dl className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1.5 text-xs">
          {rows.map(([keys, label]) => (
            <div key={label} className="contents">
              <dt className="flex justify-end">{keys}</dt>
              <dd className="text-muted-foreground">{label}</dd>
            </div>
          ))}
        </dl>
      </PopoverContent>
    </Popover>
  )
}
