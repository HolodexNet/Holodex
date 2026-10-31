import { useMemo, useState } from "react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router"
import { cn } from "cn"
import { ChannelAvatar } from "@/components/common/channel-avatar"
import { ChannelActions } from "@/components/common/channel-actions"
import { SimpleSelect } from "@/components/common/simple-select"
import { ErrorMessage, StateMessage } from "@/components/common/state-message"
import {
  BroadcastIcon,
  CaretRightIcon,
  CircleNotchIcon,
  GridFourIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  RowsIcon,
  SlidersHorizontalIcon,
  UsersThreeIcon,
  XIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { useChannelDirectory } from "@/lib/channel-queries"
import { ALL_VTUBERS } from "@/lib/consts"
import { intlLocale, useT } from "@/lib/i18n"
import { useOrgs, useOrgLive } from "@/lib/queries"
import { formatCount } from "@/lib/time"
import type { Channel, Video } from "@/lib/types"
import { channelName, videoTitle, watchPath } from "@/lib/video"
import { useOrgStore } from "@/stores/org"
import { useSettings } from "@/stores/settings"

const groupOf = (channel: Channel) =>
  channel.group || channel.suborg?.slice(2) || ""
const topicName = (topic: string) => topic.replaceAll("_", " ")
const normalize = (value: string) => value.normalize("NFKC").toLocaleLowerCase()
const formatTopics = new Set(["shorts", "membersonly"])
const topicsOf = (channel: Channel) =>
  [...(channel.top_topics ?? [])].sort(
    (a, b) => Number(formatTopics.has(a)) - Number(formatTopics.has(b))
  )

function streamTime(video: Video, locale: string) {
  const time = video.start_scheduled ?? video.available_at
  if (!time || !Number.isFinite(new Date(time).getTime())) return null
  return new Intl.DateTimeFormat(intlLocale(locale), {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(time))
}

export function ChannelCard({
  channel,
  stream,
  list = false,
  scheduleKnown = false,
  onTopic,
}: {
  channel: Channel
  stream?: Video
  list?: boolean
  scheduleKnown?: boolean
  onTopic: (topic: string) => void
}) {
  const { t, lang } = useT()
  const english = useSettings((s) => s.useEnglishName)
  const name = channelName(channel, english)
  const alternate = name === channel.name ? channel.english_name : channel.name
  const live = stream?.status === "live"
  const when = stream ? streamTime(stream, lang) : null
  return (
    <article
      className={cn(
        "discovery-card group relative min-w-0 overflow-hidden rounded-2xl border bg-card transition-colors hover:border-primary/50",
        list ? "flex flex-wrap items-center gap-4 p-4" : "flex flex-col"
      )}
    >
      {!list && (
        <div aria-hidden="true" className="discovery-card-wash h-20">
          <BroadcastIcon className="absolute -top-7 right-9 size-32 rotate-12 text-complement/10" />
        </div>
      )}
      <div
        className={cn(
          "flex items-center justify-between gap-2",
          list ? "order-2 ml-auto" : "absolute top-3 right-3 left-4"
        )}
      >
        {stream ? (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
              live ? "bg-live text-white" : "bg-card text-complement"
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                live ? "bg-white" : "bg-complement"
              )}
            />
            {t(live ? "discovery.liveNow" : "discovery.upcoming")}
          </span>
        ) : channel.inactive ? (
          <span className="rounded-full border bg-card px-2.5 py-1 text-[11px] text-muted-foreground">
            {t("discovery.archived")}
          </span>
        ) : (
          <span />
        )}
        <ChannelActions channel={channel} compact />
      </div>
      <div
        className={cn(
          "min-w-0",
          list
            ? "flex flex-1 basis-52 items-center gap-4"
            : "relative -mt-10 px-5"
        )}
      >
        <Link
          to={`/channel/${channel.id}`}
          aria-label={name}
          className="inline-flex rounded-full outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary"
        >
          <ChannelAvatar
            channel={channel}
            size={list ? 64 : 80}
            live={live}
            className={cn(
              "border-4 border-card",
              channel.inactive && !stream && "grayscale-[40%]"
            )}
          />
        </Link>
        <div className={cn("min-w-0", !list && "mt-3")}>
          <Link
            to={`/channel/${channel.id}`}
            className="focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-primary"
          >
            <h3 className="line-clamp-2 text-base leading-snug font-semibold tracking-tight group-hover:text-brand">
              {name}
            </h3>
          </Link>
          {alternate && alternate !== name && (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {alternate}
            </p>
          )}
          <p className="mt-1.5 truncate text-xs text-muted-foreground">
            {channel.org || t("channelPages.independent")}
            {groupOf(channel) ? ` · ${groupOf(channel)}` : ""}
          </p>
        </div>
      </div>
      <div
        className={cn(
          "flex min-w-0 flex-col",
          list
            ? "order-3 w-full gap-3 border-t pt-3 sm:w-auto sm:flex-1 sm:basis-60 sm:border-0 sm:pt-0"
            : "flex-1 gap-4 p-5 pt-4"
        )}
      >
        {!!channel.top_topics?.length && (
          <div className="flex flex-wrap gap-1.5">
            {topicsOf(channel)
              .slice(0, 3)
              .map((topic) => (
                <button
                  key={topic}
                  onClick={() => onTopic(topic)}
                  className="max-w-full truncate rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-primary/10 hover:text-brand focus-visible:outline-2 focus-visible:outline-primary"
                >
                  {topicName(topic)}
                </button>
              ))}
          </div>
        )}
        <div className={cn("min-w-0 text-xs", !list && "mt-auto min-h-12")}>
          {stream ? (
            <>
              <p
                className={cn(
                  "mb-1 font-medium",
                  live ? "text-live" : "text-complement"
                )}
              >
                {live
                  ? t("discovery.streaming")
                  : when || t("discovery.upcoming")}
              </p>
              <p
                className="line-clamp-2 leading-relaxed text-muted-foreground"
                title={videoTitle(stream, english)}
              >
                {videoTitle(stream, english) || t("discovery.untitledStream")}
              </p>
            </>
          ) : (
            <p className="leading-relaxed text-muted-foreground">
              {t(
                channel.inactive
                  ? "discovery.archiveHint"
                  : scheduleKnown
                    ? "discovery.noSchedule"
                    : "discovery.scheduleUnknown"
              )}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {stream && (
            <Button
              nativeButton={false}
              size="sm"
              className={cn(
                "flex-1",
                live && "bg-live text-white hover:bg-live/85"
              )}
              render={<Link to={watchPath(stream.id)} />}
            >
              <PlayIcon />
              {t(live ? "discovery.watchLive" : "discovery.viewStream")}
            </Button>
          )}
          <Button
            nativeButton={false}
            size="sm"
            variant={stream ? "outline" : "secondary"}
            className={cn(!stream && "flex-1")}
            render={<Link to={`/channel/${channel.id}`} />}
          >
            {t("discovery.profile")}
            <CaretRightIcon />
          </Button>
          {!stream &&
            channel.subscriber_count != null &&
            Number.isFinite(Number(channel.subscriber_count)) && (
              <span
                className="shrink-0 text-[11px] text-muted-foreground"
                title={t("views.channels.sortOptions.subscribers")}
              >
                {t("discovery.subscribers", {
                  count: formatCount(channel.subscriber_count, lang),
                })}
              </span>
            )}
        </div>
      </div>
    </article>
  )
}

export function ChannelsPage() {
  const { t, lang } = useT()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { org: routeOrg } = useParams()
  const currentOrg = useOrgStore((s) => s.currentOrg.name)
  const english = useSettings((s) => s.useEnglishName)
  const org = params.get("org") ?? routeOrg ?? currentOrg
  const search = params.get("q") ?? ""
  const topic = params.get("topic") ?? ""
  const group = params.get("group") ?? ""
  const language = params.get("lang") ?? ""
  const status = ["live", "upcoming", "archived"].includes(
    params.get("status") ?? ""
  )
    ? params.get("status")!
    : "current"
  const requestedSort = params.get("sort") ?? "live"
  const sort = [
    "live",
    "name",
    "group",
    "subscribers",
    "suborg",
    "subscriber_count",
    "view_count",
  ].includes(requestedSort)
    ? requestedSort
    : "live"
  const list = params.get("view") === "list"
  const [visible, setVisible] = useState(48)
  const [showFilters, setShowFilters] = useState(false)
  const directory = useChannelDirectory(org)
  const schedule = useOrgLive(org)
  const scheduleKnown =
    !!schedule.data && !schedule.isPlaceholderData && !schedule.isError
  const scheduleFiltered = status === "live" || status === "upcoming"
  const orgs = useOrgs()
  const update = (key: string, value: string) => {
    setVisible(48)
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key === "org")
      for (const facet of ["group", "topic", "lang", "q"]) next.delete(facet)
    if (key === "org" && routeOrg)
      void navigate(`/channel?${next}`, { replace: true })
    else setParams(next, { replace: true })
  }
  const reset = () => {
    setVisible(48)
    const next = new URLSearchParams(params)
    for (const key of ["q", "topic", "group", "lang", "status"])
      next.delete(key)
    setParams(next, { replace: true })
  }
  const channels = useMemo(
    () => [
      ...new Map(
        (directory.data?.pages.flat() ?? []).map((channel) => [
          channel.id,
          channel,
        ])
      ).values(),
    ],
    [directory.data]
  )
  const streams = useMemo(() => {
    const result = new Map<string, Video>()
    // Only the uploader is live: mentions are not evidence of a talent broadcasting.
    for (const video of scheduleKnown ? (schedule.data ?? []) : []) {
      if (!["live", "upcoming"].includes(video.status)) continue
      const id = video.channel_id ?? video.channel.id
      const existing = result.get(id)
      const time = (v: Video) =>
        new Date(v.start_scheduled ?? v.available_at ?? 0).getTime()
      if (
        !existing ||
        (video.status === "live" && existing.status !== "live") ||
        (video.status === existing.status && time(video) < time(existing))
      )
        result.set(id, video)
    }
    return result
  }, [schedule.data, scheduleKnown])
  const facets = useMemo(() => {
    const topics = new Map<string, number>()
    const groups = new Set<string>()
    const languages = new Set<string>()
    for (const channel of channels) {
      if (groupOf(channel)) groups.add(groupOf(channel))
      if (channel.lang) languages.add(channel.lang)
      for (const item of new Set(channel.top_topics ?? []))
        topics.set(item, (topics.get(item) ?? 0) + 1)
    }
    return {
      topics: [...topics].sort(
        (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
      ),
      groups: [...groups].sort(),
      languages: [...languages].sort(),
    }
  }, [channels])
  const counts = useMemo(
    () => ({
      live: [...streams.values()].filter((v) => v.status === "live").length,
      upcoming: [...streams.values()].filter((v) => v.status === "upcoming")
        .length,
    }),
    [streams]
  )
  const quickTopics = facets.topics
    .filter(([value]) => !formatTopics.has(value))
    .slice(0, 6)
  const results = useMemo(() => {
    const words = normalize(search).trim().split(/\s+/).filter(Boolean)
    const rank = (channel: Channel) =>
      streams.get(channel.id)?.status === "live"
        ? 0
        : streams.has(channel.id)
          ? 1
          : channel.inactive
            ? 3
            : 2
    return channels
      .filter((channel) => {
        const stream = streams.get(channel.id)
        if (
          status === "archived"
            ? !channel.inactive
            : status === "current"
              ? channel.inactive
              : stream?.status !== status
        )
          return false
        if (group && groupOf(channel) !== group) return false
        if (topic && !channel.top_topics?.includes(topic)) return false
        if (language && channel.lang !== language) return false
        const text = normalize(
          [
            channel.name,
            channel.english_name,
            channel.org,
            groupOf(channel),
            ...(channel.top_topics ?? []),
            ...(Array.isArray(channel.yt_handle)
              ? channel.yt_handle
              : [channel.yt_handle]),
          ]
            .filter(Boolean)
            .join(" ")
        )
        return words.every((word) => text.includes(word))
      })
      .sort((a, b) => {
        let order = 0
        if (sort === "live") order = rank(a) - rank(b)
        if (sort === "subscribers" || sort === "subscriber_count")
          order =
            (Number(b.subscriber_count) || -1) -
            (Number(a.subscriber_count) || -1)
        if (sort === "group" || sort === "suborg")
          order = groupOf(a).localeCompare(groupOf(b))
        if (sort === "view_count")
          order = (Number(b.view_count) || -1) - (Number(a.view_count) || -1)
        return (
          order ||
          channelName(a, english).localeCompare(
            channelName(b, english),
            intlLocale(lang)
          ) ||
          a.id.localeCompare(b.id)
        )
      })
  }, [
    channels,
    streams,
    search,
    status,
    topic,
    group,
    language,
    sort,
    english,
    lang,
  ])
  const complete =
    !directory.isPending && !directory.hasNextPage && !directory.isError
  const filtered = !!(
    search ||
    topic ||
    group ||
    language ||
    status !== "current"
  )
  const liveAvatars = [...streams.values()]
    .filter((v) => v.status === "live")
    .slice(0, 5)
  useDocumentTitle(
    `${t("discovery.title")}${t("discovery.titleAccent")} · ${org}`
  )
  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-5 md:px-8 md:py-8">
      <header className="discovery-hero relative mb-5 overflow-hidden rounded-3xl border p-5 md:p-7">
        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <p className="mb-3 flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] text-complement uppercase">
              <BroadcastIcon className="size-4" />
              {t("discovery.eyebrow")}
            </p>
            <h1 className="max-w-lg text-3xl leading-[1.12] font-bold tracking-tight md:text-[2.65rem]">
              {t("discovery.title")}
              <span className="text-brand">{t("discovery.titleAccent")}</span>
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              {t("discovery.description")}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-5 lg:flex-col lg:items-start lg:gap-4 lg:pr-9">
            {!!liveAvatars.length && (
              <div className="hidden -space-x-3 sm:flex">
                {liveAvatars.map((video) => (
                  <Link
                    key={video.channel.id}
                    to={`/channel/${video.channel.id}`}
                    title={channelName(video.channel, english)}
                    className="rounded-full border-4 border-card transition-transform hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <ChannelAvatar channel={video.channel} size={44} />
                  </Link>
                ))}
              </div>
            )}
            <div className="flex gap-6">
              <div>
                <p className="text-2xl font-semibold tracking-tight text-live">
                  {scheduleKnown ? counts.live : "—"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t("discovery.liveTalents")}
                </p>
              </div>
              <div className="border-l pl-6">
                <p className="text-2xl font-semibold tracking-tight">
                  {scheduleKnown ? counts.upcoming : "—"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t("discovery.scheduledTalents")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>
      <section
        aria-label={t("discovery.filters")}
        className="mb-5 rounded-2xl border bg-card p-4"
      >
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="pointer-events-none absolute top-3.5 left-3.5 size-4 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(event) => update("q", event.target.value)}
              placeholder={t("discovery.searchPlaceholder")}
              aria-label={t("discovery.searchPlaceholder")}
              className="h-11 rounded-xl bg-background pr-9 pl-10"
            />
          </div>
          <div className="flex min-w-0 gap-2">
            <SimpleSelect
              value={org}
              onChange={(value) => update("org", value)}
              aria-label={t("discovery.organization")}
              className="h-11 min-w-0 flex-1 rounded-xl md:w-52"
              options={[
                ...new Set([
                  ALL_VTUBERS,
                  org,
                  ...(orgs.data?.map((item) => item.name) ?? []),
                ]),
              ].map((value) => ({ value, label: value }))}
            />
            <Button
              variant="outline"
              className="h-11 rounded-xl md:hidden"
              aria-expanded={showFilters}
              aria-controls="discovery-facets"
              onClick={() => setShowFilters((shown) => !shown)}
            >
              <SlidersHorizontalIcon />
              {t("discovery.moreFilters")}
            </Button>
          </div>
        </div>
        <div
          id="discovery-facets"
          className={cn(
            "mt-3 flex-wrap items-end gap-3 md:flex",
            showFilters ? "flex" : "hidden"
          )}
        >
          {(facets.groups.length > 0 || group) && (
            <label className="min-w-0 flex-1 basis-32 text-[11px] font-medium text-muted-foreground">
              {t("discovery.group")}
              <SimpleSelect
                value={group}
                onChange={(value) => update("group", value)}
                className="mt-1.5 w-full rounded-lg"
                options={[
                  { value: "", label: t("discovery.allGroups") },
                  ...[
                    ...new Set([...facets.groups, ...(group ? [group] : [])]),
                  ].map((value) => ({ value, label: value })),
                ]}
              />
            </label>
          )}
          <label className="min-w-0 flex-1 basis-32 text-[11px] font-medium text-muted-foreground">
            {t("discovery.topic")}
            <SimpleSelect
              value={topic}
              onChange={(value) => update("topic", value)}
              className="mt-1.5 w-full rounded-lg"
              options={[
                { value: "", label: t("discovery.allTopics") },
                ...[
                  ...new Set([
                    ...facets.topics.map(([value]) => value),
                    ...(topic ? [topic] : []),
                  ]),
                ].map((value) => ({ value, label: topicName(value) })),
              ]}
            />
          </label>
          {(facets.languages.length > 0 || language) && (
            <label className="min-w-0 flex-1 basis-32 text-[11px] font-medium text-muted-foreground">
              {t("discovery.language")}
              <SimpleSelect
                value={language}
                onChange={(value) => update("lang", value)}
                className="mt-1.5 w-full rounded-lg"
                options={[
                  { value: "", label: t("discovery.allLanguages") },
                  ...[
                    ...new Set([
                      ...facets.languages,
                      ...(language ? [language] : []),
                    ]),
                  ].map((value) => ({ value, label: value.toUpperCase() })),
                ]}
              />
            </label>
          )}
          <label className="min-w-0 flex-1 basis-32 text-[11px] font-medium text-muted-foreground">
            {t("views.search.sortByLabel")}
            <SimpleSelect
              value={sort}
              onChange={(value) => update("sort", value)}
              className="mt-1.5 w-full rounded-lg"
              options={[
                { value: "live", label: t("discovery.liveFirst") },
                { value: "name", label: t("discovery.nameSort") },
                { value: "group", label: t("discovery.group") },
                {
                  value: "subscribers",
                  label: t("views.channels.sortOptions.subscribers"),
                },
                {
                  value: "view_count",
                  label: t("component.channelInfo.totalViews"),
                },
                ...(["suborg", "subscriber_count"].includes(sort)
                  ? [
                      {
                        value: sort,
                        label: t(
                          sort === "suborg"
                            ? "discovery.group"
                            : "views.channels.sortOptions.subscribers"
                        ),
                      },
                    ]
                  : []),
              ]}
            />
          </label>
        </div>
        {!!quickTopics.length && (
          <div className="mt-3 flex items-center gap-2 overflow-x-auto border-t pt-3 md:flex-wrap">
            <span className="mr-1 hidden shrink-0 text-xs text-muted-foreground md:inline">
              {t("discovery.exploreTopics")}
            </span>
            {quickTopics.map(([value]) => (
              <button
                key={value}
                aria-pressed={topic === value}
                onClick={() => update("topic", topic === value ? "" : value)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-primary",
                  topic === value
                    ? "border-primary/40 bg-primary/10 text-brand"
                    : "border-transparent bg-muted text-muted-foreground hover:border-primary/30 hover:text-brand"
                )}
              >
                {topicName(value)}
              </button>
            ))}
          </div>
        )}
      </section>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div
          className="flex max-w-full gap-1 overflow-x-auto"
          aria-label={t("discovery.status")}
        >
          {(["current", "live", "upcoming", "archived"] as const).map(
            (value) => (
              <Button
                key={value}
                size="sm"
                variant={status === value ? "secondary" : "ghost"}
                aria-pressed={status === value}
                onClick={() => update("status", value)}
                className={cn(
                  "h-10 px-2 text-xs sm:px-3 sm:text-sm",
                  status === value && "text-brand",
                  value === "live" && "gap-2"
                )}
              >
                {value === "live" && (
                  <span className="size-1.5 rounded-full bg-live" />
                )}
                {t(
                  `discovery.${value === "current" ? "browseAll" : value === "live" ? "liveNow" : value}`
                )}
              </Button>
            )
          )}
        </div>
      </div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold tracking-tight">
          {filtered
            ? t("discovery.results")
            : org === ALL_VTUBERS
              ? t("discovery.directory")
              : org}
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {scheduleFiltered && !scheduleKnown ? "—" : results.length}
            {!complete && !(scheduleFiltered && !scheduleKnown) && "+"}
          </span>
        </h2>
        <div className="ml-auto flex items-center gap-2">
          {filtered && (
            <Button variant="ghost" size="sm" onClick={reset}>
              <XIcon />
              {t("discovery.clearFilters")}
            </Button>
          )}
          <div className="flex gap-1 rounded-lg border bg-card p-1">
            {[false, true].map((value) => (
              <Button
                key={String(value)}
                size="icon-sm"
                variant={list === value ? "secondary" : "ghost"}
                aria-label={t(
                  value ? "views.home.viewList" : "views.home.viewGrid"
                )}
                aria-pressed={list === value}
                onClick={() => update("view", value ? "list" : "grid")}
              >
                {value ? <RowsIcon /> : <GridFourIcon />}
              </Button>
            ))}
          </div>
        </div>
      </div>
      <div className="mb-5">
        <div>
          <p
            role="status"
            className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            {directory.isFetching && (
              <CircleNotchIcon className="size-3 animate-spin" />
            )}
            {t(
              complete
                ? "discovery.complete"
                : directory.isError
                  ? "discovery.partial"
                  : "discovery.loadingDirectory",
              { count: channels.length }
            )}
          </p>
        </div>
      </div>
      {!scheduleKnown && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border bg-muted/40 p-3 text-xs text-muted-foreground">
          <BroadcastIcon className="size-4" />
          {t(
            schedule.isError
              ? "discovery.scheduleError"
              : "discovery.scheduleLoading"
          )}
          {schedule.isError && (
            <Button
              size="xs"
              variant="outline"
              onClick={() => void schedule.refetch()}
            >
              {t("discovery.retry")}
            </Button>
          )}
        </div>
      )}
      {directory.isPending && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      )}
      {directory.isError && (
        <ErrorMessage
          error={directory.error}
          onRetry={() =>
            void (channels.length
              ? directory.fetchNextPage()
              : directory.refetch())
          }
        />
      )}
      <div
        className={
          list
            ? "grid gap-3"
            : "grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
        }
      >
        {results.slice(0, visible).map((channel) => (
          <ChannelCard
            key={channel.id}
            channel={channel}
            stream={streams.get(channel.id)}
            list={list}
            scheduleKnown={scheduleKnown}
            onTopic={(value) => update("topic", value)}
          />
        ))}
      </div>
      {!directory.isPending && !results.length && (
        <StateMessage
          icon={<UsersThreeIcon />}
          title={t(
            scheduleFiltered && !scheduleKnown
              ? "discovery.scheduleUnknown"
              : complete
                ? "discovery.noMatches"
                : "discovery.noMatchesYet"
          )}
          description={t(
            scheduleFiltered && !scheduleKnown
              ? schedule.isError
                ? "discovery.scheduleError"
                : "discovery.scheduleLoading"
              : complete
                ? "discovery.emptyHint"
                : "discovery.partialHint"
          )}
          children={
            filtered ? (
              <Button variant="outline" onClick={reset}>
                {t("discovery.clearFilters")}
              </Button>
            ) : undefined
          }
        />
      )}
      {results.length > visible && (
        <div className="mt-7 flex justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setVisible((count) => count + 48)}
          >
            {t("discovery.showMore", { count: results.length - visible })}
          </Button>
        </div>
      )}
      <p className="mt-8 text-center text-[11px] leading-relaxed text-muted-foreground">
        {t("discovery.dataNote")}
      </p>
    </main>
  )
}
