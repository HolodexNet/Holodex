import { useMemo, useState } from "react"
import { Link } from "react-router"
import { cn } from "cn"

import { ChannelAvatar } from "@/components/common/channel-avatar"
import { SimpleSelect } from "@/components/common/simple-select"
import {
  ClockCounterClockwiseIcon,
  HeartIcon,
  PlusIcon,
  TrashIcon,
  WarningIcon,
  XIcon,
} from "@/components/icons"
import { OrgIcon } from "@/components/layout/org-selector"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { VideoThumbnail } from "@/components/video/video-card"
import { useNowMinutes } from "@/hooks/use-now"
import { useT } from "@/lib/i18n"
import { useFavoritesLive, useOrgLive } from "@/lib/queries"
import { formatShortDistance } from "@/lib/time"
import { POSTABLE_LANGS } from "@/lib/tlclient/lines"
import type { SessionParams } from "@/lib/tlclient/session"
import type { Video } from "@/lib/types"
import { channelName, videoTitle } from "@/lib/video"
import { useAuth } from "@/stores/auth"
import { useOrgStore } from "@/stores/org"
import { useSettings } from "@/stores/settings"
import { useTlClient } from "@/stores/tlclient"
import { postableLangOptions, sourceLabel } from "./helpers"
import { useSources } from "./use-sources"

/** The old client remembered the last stream it was pointed at. */
function legacyLastLink(): string {
  try {
    const value = localStorage.getItem("tldex-lastlink")
    return value ? (JSON.parse(value) as string) : ""
  } catch {
    return ""
  }
}

/**
 * Starting a session: which stream, which other POVs of it, which language.
 * Everything chosen here ends up in the address, so a session can be bookmarked
 * or handed to a teammate.
 */
export function TlSetup({
  initialLang,
  onStart,
}: {
  initialLang: string | null
  onStart: (params: SessionParams) => void
}) {
  const { t } = useT()
  const user = useAuth((s) => s.user)
  const fallbackLang = useSettings((s) => s.liveTlLang)
  const [lang, setLang] = useState(() => {
    const wanted = initialLang ?? fallbackLang
    return POSTABLE_LANGS.includes(wanted) ? wanted : "en"
  })
  const [main, setMain] = useState("")
  const [collabs, setCollabs] = useState<string[]>([])

  const choose = (value: string) => {
    if (!value.trim()) return
    setMain(value.trim())
    setCollabs([])
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:py-12">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("tlClient.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("tlClient.tagline")}
          </p>
        </header>
        {!user && (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card px-4 py-3 text-sm">
            <span className="min-w-0 flex-1">
              {t("tlClient.setup.loginNeeded")}
            </span>
            <Button
              size="sm"
              nativeButton={false}
              render={<Link to="/login" />}
            >
              {t("component.mainNav.login")}
            </Button>
          </div>
        )}
        {main ? (
          <SessionPlan
            main={main}
            collabs={collabs}
            lang={lang}
            onLangChange={setLang}
            onCollabsChange={setCollabs}
            onChange={() => setMain("")}
            onStart={() => onStart({ main, collabs, lang })}
          />
        ) : (
          <StreamChooser onChoose={choose} onResume={onStart} />
        )}
      </div>
    </div>
  )
}

function StreamChooser({
  onChoose,
  onResume,
}: {
  onChoose: (value: string) => void
  onResume: (params: SessionParams) => void
}) {
  const { t } = useT()
  const [input, setInput] = useState(legacyLastLink)
  const recent = useTlClient((s) => s.recent)
  const set = useTlClient((s) => s.set)

  return (
    <>
      <form
        className="flex flex-col gap-1.5"
        onSubmit={(event) => {
          event.preventDefault()
          onChoose(input)
        }}
      >
        <Label htmlFor="tlc-stream">{t("tlClient.setup.streamLabel")}</Label>
        <div className="flex gap-2">
          <Input
            id="tlc-stream"
            autoFocus
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={t("tlClient.setup.streamPlaceholder")}
            className="h-10"
          />
          <Button type="submit" size="lg" disabled={!input.trim()}>
            {t("tlClient.setup.choose")}
          </Button>
        </div>
      </form>
      {recent.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="flex items-center gap-1.5 text-sm font-medium">
            <ClockCounterClockwiseIcon className="size-4 text-muted-foreground" />
            {t("tlClient.setup.recent")}
          </h2>
          <ul className="flex flex-col gap-1">
            {recent.map((session) => (
              <li key={session.main} className="group flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onResume(session)}
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  <span className="min-w-0 flex-1 truncate">
                    {session.label}
                  </span>
                  {session.collabs.length > 0 && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      +{session.collabs.length}
                    </span>
                  )}
                  <span className="shrink-0 rounded-sm bg-muted px-1.5 py-px text-[10px] font-medium uppercase">
                    {session.lang}
                  </span>
                </button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t("tlClient.setup.remove")}
                  className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                  onClick={() =>
                    set(
                      "recent",
                      recent.filter((entry) => entry.main !== session.main)
                    )
                  }
                >
                  <XIcon />
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}
      <LiveStreams onChoose={(video) => onChoose(video.id)} />
    </>
  )
}

function LiveStreams({ onChoose }: { onChoose: (video: Video) => void }) {
  const { t } = useT()
  const loggedIn = useAuth((s) => !!s.jwt)
  const org = useOrgStore((s) => s.currentOrg)
  const [source, setSource] = useState<"favorites" | "org">(
    loggedIn ? "favorites" : "org"
  )
  const [filter, setFilter] = useState("")
  const preferEnglish = useSettings((s) => s.useEnglishName)
  const favorites = useFavoritesLive(source === "favorites")
  const orgLive = useOrgLive(org.name, source === "org")
  const query = source === "favorites" ? favorites : orgLive

  const videos = useMemo(() => {
    const needle = filter.trim().toLowerCase()
    return (query.data ?? [])
      .filter(
        (video) =>
          !needle ||
          videoTitle(video, preferEnglish).toLowerCase().includes(needle) ||
          channelName(video.channel, preferEnglish)
            .toLowerCase()
            .includes(needle)
      )
      .sort(
        (a, b) =>
          Number(b.status === "live") - Number(a.status === "live") ||
          new Date(a.available_at ?? 0).getTime() -
            new Date(b.available_at ?? 0).getTime()
      )
  }, [query.data, filter, preferEnglish])

  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="mr-auto text-sm font-medium">
          {t("tlClient.setup.liveNow")}
        </h2>
        <div className="flex rounded-lg border p-0.5">
          {loggedIn && (
            <Button
              size="xs"
              variant={source === "favorites" ? "secondary" : "ghost"}
              onClick={() => setSource("favorites")}
            >
              <HeartIcon data-icon="inline-start" />
              {t("component.mainNav.favorites")}
            </Button>
          )}
          <Button
            size="xs"
            variant={source === "org" ? "secondary" : "ghost"}
            onClick={() => setSource("org")}
          >
            <OrgIcon org={org} className="size-3.5" />
            {org.short || org.name}
          </Button>
        </div>
        <Input
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder={t("tlClient.setup.filter")}
          aria-label={t("tlClient.setup.filter")}
          className="h-8 w-full sm:w-52"
        />
      </div>
      {query.isPending ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : videos.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {t("tlClient.setup.noStreams")}
        </p>
      ) : (
        <ul className="grid gap-1 sm:grid-cols-2">
          {videos.map((video) => (
            <li key={video.id}>
              <StreamRow video={video} onClick={() => onChoose(video)} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function StreamRow({ video, onClick }: { video: Video; onClick: () => void }) {
  const { t } = useT()
  const preferEnglish = useSettings((s) => s.useEnglishName)
  const now = useNowMinutes()
  const live = video.status === "live"
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg p-1.5 text-left outline-none hover:bg-muted focus-ring-sm"
    >
      <span className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-md bg-muted">
        <VideoThumbnail video={video} sizes="96px" />
        <span
          className={cn(
            "absolute bottom-0.5 left-0.5 rounded-sm px-1 text-[10px] font-semibold text-white",
            live ? "bg-live" : "bg-black/70"
          )}
        >
          {live
            ? t("tlClient.header.live")
            : video.available_at
              ? formatShortDistance(video.available_at, now)
              : t("tlClient.header.upcoming")}
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 text-sm leading-snug">
          {videoTitle(video, preferEnglish)}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {channelName(video.channel, preferEnglish)}
        </span>
      </span>
    </button>
  )
}

function SessionPlan({
  main,
  collabs,
  lang,
  onLangChange,
  onCollabsChange,
  onChange,
  onStart,
}: {
  main: string
  collabs: string[]
  lang: string
  onLangChange: (lang: string) => void
  onCollabsChange: (collabs: string[]) => void
  onChange: () => void
  onStart: () => void
}) {
  const { t } = useT()
  const preferEnglish = useSettings((s) => s.useEnglishName)
  const [link, setLink] = useState("")
  const raws = useMemo(() => [main, ...collabs], [main, collabs])
  const { sources } = useSources(raws, false)
  const mainSource = sources[0]
  const video = mainSource.source.video
  const added = new Set(raws)
  const knownIds = new Set(
    sources.map(({ source }) => source.video?.id).filter(Boolean)
  )
  const suggestions = (video?.simulcasts ?? []).filter(
    (ref) => !added.has(ref.id) && !knownIds.has(ref.id)
  )

  const addCollab = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed || added.has(trimmed)) return
    onCollabsChange([...collabs, trimmed])
    setLink("")
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="flex items-start gap-3 rounded-xl border bg-card p-3">
        {mainSource.pending ? (
          <div className="flex flex-1 items-center gap-2 py-3 text-sm text-muted-foreground">
            <Spinner /> {t("tlClient.finding")}
          </div>
        ) : video ? (
          <>
            <span className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-md bg-muted sm:w-40">
              <VideoThumbnail video={video} sizes="160px" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-medium">
                {videoTitle(video, preferEnglish)}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <ChannelAvatar channel={video.channel} size={18} />
                <span className="truncate">
                  {channelName(video.channel, preferEnglish)}
                </span>
              </p>
            </div>
          </>
        ) : (
          <div className="flex min-w-0 flex-1 items-start gap-2 text-sm">
            <WarningIcon className="mt-0.5 size-4 shrink-0 text-amber-500" />
            <p className="min-w-0 wrap-anywhere">
              {mainSource.error
                ? t("component.apiError.generic")
                : t("tlClient.setup.customRoom", [main])}
            </p>
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={onChange}
        >
          {t("tlClient.setup.change")}
        </Button>
      </section>

      <section className="flex flex-col gap-2">
        <div>
          <h2 className="text-sm font-medium">{t("tlClient.setup.collabs")}</h2>
          <p className="text-xs text-muted-foreground">
            {t("tlClient.setup.collabsHint")}
          </p>
        </div>
        {sources.slice(1).map(({ source, pending }) => (
          <div
            key={source.raw}
            className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm"
          >
            <span className="min-w-0 flex-1 truncate">
              {pending
                ? source.raw
                : source.video
                  ? `${sourceLabel(source, preferEnglish)} · ${videoTitle(source.video, preferEnglish)}`
                  : `${source.raw} · ${t("tlClient.destinations.customRoom")}`}
            </span>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={t("tlClient.setup.remove")}
              onClick={() =>
                onCollabsChange(collabs.filter((c) => c !== source.raw))
              }
            >
              <TrashIcon />
            </Button>
          </div>
        ))}
        {suggestions.length > 0 && (
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">
              {t("tlClient.setup.suggested")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((ref) => (
                <Button
                  key={ref.id}
                  variant="outline"
                  size="sm"
                  onClick={() => addCollab(ref.id)}
                >
                  <PlusIcon data-icon="inline-start" />
                  <span className="max-w-48 truncate">
                    {ref.channel?.name ?? ref.title ?? ref.id}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        )}
        <form
          className="flex gap-2"
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
            className="h-9"
          />
          <Button type="submit" variant="outline" disabled={!link.trim()}>
            {t("tlClient.setup.add")}
          </Button>
        </form>
      </section>

      <section className="flex flex-col gap-1.5">
        <Label htmlFor="tlc-setup-lang">{t("tlClient.setup.language")}</Label>
        <SimpleSelect
          id="tlc-setup-lang"
          value={lang}
          onChange={onLangChange}
          options={postableLangOptions()}
          className="w-full sm:w-64"
        />
      </section>

      <Button
        size="lg"
        className="self-start"
        disabled={mainSource.pending || !!mainSource.error}
        onClick={onStart}
      >
        {t("tlClient.setup.start")}
      </Button>
    </div>
  )
}
