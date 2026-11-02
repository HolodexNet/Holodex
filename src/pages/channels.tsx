import { useMemo } from "react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router"
import { cn } from "cn"
import { ChannelAvatar } from "@/components/common/channel-avatar"
import { ChannelActions } from "@/components/common/channel-actions"
import { ChannelBanner } from "@/components/common/channel-banner"
import { LoadMore } from "@/components/common/load-more"
import { SimpleSelect } from "@/components/common/simple-select"
import { ErrorMessage, StateMessage } from "@/components/common/state-message"
import {
  GraduationCapIcon,
  GridFourIcon,
  RowsIcon,
  UsersThreeIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { useChannels } from "@/lib/channel-queries"
import { ALL_VTUBERS } from "@/lib/consts"
import { useT } from "@/lib/i18n"
import { useOrgs } from "@/lib/queries"
import type { Channel } from "@/lib/types"
import { formatCount } from "@/lib/time"
import { channelName } from "@/lib/video"
import { useOrgStore } from "@/stores/org"
import { useSettings } from "@/stores/settings"

export function ChannelCard({
  channel,
  list = false,
  showOrg,
}: {
  channel: Channel
  list?: boolean
  showOrg: boolean
}) {
  const { t, lang } = useT()
  const english = useSettings((s) => s.useEnglishName)
  const name = channelName(channel, english)
  // Keep some color at rest; inactive talent should feel quiet, not memorialized.
  const inactiveStyle = channel.inactive
    ? "saturate-45 transition-[filter] duration-300 ease-out group-hover:saturate-100 group-focus-within:saturate-100 motion-reduce:transition-none"
    : undefined
  return (
    <article
      className={cn(
        "group relative flex overflow-hidden rounded-2xl border bg-card transition-colors hover:border-primary/50",
        list ? "items-center gap-3 p-3" : "flex-col",
        channel.inactive && "focus-within:border-primary/50"
      )}
    >
      <Link
        to={`/channel/${channel.id}`}
        className={cn(
          "flex min-w-0 flex-1 gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-primary",
          list ? "items-center" : "w-full flex-col",
          inactiveStyle
        )}
      >
        {!list && (
          <ChannelBanner
            channel={channel}
            curved
            resolveBanner={!channel.inactive}
            curtain={!!channel.inactive}
            className="h-24 w-full"
          />
        )}
        <div
          className={cn(
            "relative shrink-0",
            !list && "z-10 -mt-10 ml-4 w-fit rounded-full ring-4 ring-card"
          )}
        >
          <ChannelAvatar channel={channel} size={list ? 48 : 64} />
          {channel.inactive && (
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute -right-1 -bottom-1 flex items-center justify-center rounded-full border border-complement/20 bg-complement-soft text-complement ring-2 ring-card",
                list ? "size-5" : "size-6"
              )}
            >
              <GraduationCapIcon className={list ? "size-3.5" : "size-4"} />
            </span>
          )}
        </div>
        <div
          className={cn("min-w-0", !list && "flex flex-1 flex-col px-4 pb-4")}
        >
          <h3 className="line-clamp-2 text-sm font-semibold group-hover:text-brand">
            {name}
          </h3>
          {channel.english_name && channel.english_name !== name && (
            <p className="truncate text-xs text-muted-foreground">
              {channel.english_name}
            </p>
          )}
          {showOrg && (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {channel.org}
            </p>
          )}
          {channel.subscriber_count != null &&
            Number.isFinite(Number(channel.subscriber_count)) && (
              <p className="mt-1 text-xs text-muted-foreground">
                {t("component.channelInfo.subscriberCount", {
                  n: formatCount(channel.subscriber_count, lang),
                })}
              </p>
            )}
          {!list && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {channel.top_topics?.slice(0, 2).map((topic) => (
                <span
                  key={topic}
                  className="max-w-full truncate rounded bg-muted px-2 py-1 text-[10px] text-muted-foreground capitalize"
                >
                  {topic.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
      <div
        className={cn(
          !list && "absolute top-3 right-3 rounded-full bg-card/95 shadow-sm"
        )}
      >
        <ChannelActions channel={channel} compact />
      </div>
    </article>
  )
}

export function ChannelsPage() {
  const { t } = useT()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { org: routeOrg } = useParams()
  const currentOrg = useOrgStore((s) => s.currentOrg.name)
  const org = routeOrg ?? params.get("org") ?? currentOrg
  const sort =
    (["subscriber_count", "view_count"] as const).find(
      (value) => value === params.get("sort")
    ) ?? "suborg"
  const list = params.get("view") === "list"
  const channels = useChannels(org, sort)
  const orgs = useOrgs()
  const scroll = useSettings((s) => s.scrollMode)
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    next.set(key, value)
    if (key === "org" && routeOrg) void navigate(`/channel?${next}`)
    else setParams(next)
  }
  const groups = useMemo(() => {
    const result = new Map<string, Channel[]>()
    const seen = new Set<string>()
    for (const channel of channels.data?.pages.flat() ?? []) {
      if (seen.has(channel.id)) continue
      seen.add(channel.id)
      const group =
        sort === "suborg"
          ? channel.group || channel.suborg?.slice(2) || t("channelPages.other")
          : ""
      const key =
        sort === "suborg" && org === ALL_VTUBERS
          ? `${channel.org || t("channelPages.independent")} · ${group}`
          : group
      if (!result.has(key)) result.set(key, [])
      result.get(key)!.push(channel)
    }
    return [...result.entries()]
  }, [channels.data, org, sort, t])
  useDocumentTitle(`${org} · ${t("component.mainNav.channels")}`)
  return (
    <main className="mx-auto w-full max-w-[1600px] p-4 md:p-8">
      <header className="mb-6 flex flex-wrap justify-end gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <SimpleSelect
            value={org}
            onChange={(v) => update("org", v)}
            aria-label={t("views.channels.sortOptions.org")}
            className="max-w-52"
            options={[
              ...new Set([
                ALL_VTUBERS,
                org,
                ...(orgs.data?.map((o) => o.name) ?? []),
              ]),
            ].map((o) => ({ value: o, label: o }))}
          />
          <SimpleSelect
            value={sort}
            onChange={(v) => update("sort", v)}
            aria-label={t("views.search.sortByLabel")}
            options={[
              { value: "suborg", label: t("views.channels.sortOptions.group") },
              {
                value: "subscriber_count",
                label: t("views.channels.sortOptions.subscribers"),
              },
              {
                value: "view_count",
                label: t("component.channelInfo.totalViews"),
              },
            ]}
          />
          <div className="flex gap-1 rounded-lg border p-1">
            <Button
              size="icon-sm"
              variant={!list ? "secondary" : "ghost"}
              aria-label={t("views.home.viewGrid")}
              aria-pressed={!list}
              onClick={() => update("view", "grid")}
            >
              <GridFourIcon />
            </Button>
            <Button
              size="icon-sm"
              variant={list ? "secondary" : "ghost"}
              aria-label={t("views.home.viewList")}
              aria-pressed={list}
              onClick={() => update("view", "list")}
            >
              <RowsIcon />
            </Button>
          </div>
        </div>
      </header>
      {channels.isPending && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 12 }, (_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      )}
      {channels.isError && (
        <ErrorMessage
          error={channels.error}
          onRetry={() => void channels.refetch()}
        />
      )}
      {groups.map(([group, items]) => (
        <section key={group} className="mb-8">
          {group && (
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              {group}
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {items.length}
              </span>
            </h2>
          )}
          <div
            className={
              list
                ? "grid gap-2 xl:grid-cols-2"
                : "grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] sm:gap-4"
            }
          >
            {items.map((channel) => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                list={list}
                showOrg={org === ALL_VTUBERS}
              />
            ))}
          </div>
        </section>
      ))}
      {!channels.isPending && !channels.isError && !groups.length && (
        <StateMessage
          icon={<UsersThreeIcon />}
          title={t("channelPages.noChannels")}
        />
      )}
      {channels.isFetchNextPageError && (
        <ErrorMessage
          error={channels.error}
          onRetry={() => void channels.fetchNextPage()}
        />
      )}
      <LoadMore
        hasMore={!!channels.hasNextPage && !channels.isFetchNextPageError}
        loading={channels.isFetchingNextPage}
        auto={scroll}
        onLoadMore={() => void channels.fetchNextPage()}
      />
    </main>
  )
}
