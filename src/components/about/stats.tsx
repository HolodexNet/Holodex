import { useMemo, type ReactNode } from "react"
import { Link } from "react-router"
import { cn } from "cn"

import {
  FilmStripIcon,
  MusicNotesFillIcon,
  SubtitlesIcon,
  UsersThreeFillIcon,
} from "@/components/icons"
import { OrgIcon } from "@/components/layout/org-selector"
import { Skeleton } from "@/components/ui/skeleton"
import { useNowMinutes } from "@/hooks/use-now"
import { ALL_VTUBERS } from "@/lib/consts"
import { intlLocale, useT } from "@/lib/i18n"
import { useOrgs, useSiteStats } from "@/lib/queries"
import { formatDistance } from "@/lib/time"
import { AboutSection } from "./shared"

interface StatProps {
  icon: ReactNode
  label: string
  value: number
  delta?: string
  tone: "brand" | "complement"
  format: Intl.NumberFormat
}

function Stat({ icon, label, value, delta, tone, format }: StatProps) {
  return (
    // The label comes first for screen readers; flex order puts the number first.
    <div className="@container flex flex-col items-start rounded-2xl border bg-card p-4 md:p-5">
      <span
        aria-hidden="true"
        className={cn(
          "order-1 flex size-9 items-center justify-center rounded-xl [&_svg]:size-5",
          tone === "brand"
            ? "bg-primary/12 text-brand"
            : "bg-complement-soft text-complement"
        )}
      >
        {icon}
      </span>
      <dt className="order-3 mt-1.5 text-sm font-medium text-muted-foreground">
        {label}
      </dt>
      <dd className="order-2 mt-4 w-full text-[min(2.5rem,14cqi)] leading-none font-extrabold tracking-tight tabular-nums">
        {format.format(value)}
      </dd>
      {delta && (
        <dd
          className={cn(
            "order-4 mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
            tone === "brand"
              ? "bg-primary/10 text-brand"
              : "bg-complement-soft/60 text-complement"
          )}
        >
          {delta}
        </dd>
      )}
    </div>
  )
}

function OrgConstellation() {
  const { t } = useT()
  const orgs = useOrgs()
  const list = useMemo(
    () => (orgs.data ?? []).filter((org) => org.name !== ALL_VTUBERS),
    [orgs.data]
  )
  if (list.length === 0) return null

  return (
    <div className="mt-6 rounded-2xl border border-dashed p-4 md:p-5">
      <p className="text-sm font-medium">
        {t("about.stats.orgs", { n: list.length })}
      </p>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {list.map((org) => (
          <li key={org.name}>
            <Link
              to={`/channel?${new URLSearchParams({ org: org.name })}`}
              title={org.name}
              className="block rounded-full transition-transform duration-150 outline-none hover:z-10 hover:scale-125 focus-ring-sm motion-reduce:transition-none"
            >
              <span className="sr-only">{org.name}</span>
              <OrgIcon
                org={org}
                size={50}
                className="size-8 ring-2 ring-card"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ArchiveStats() {
  const translator = useT()
  const { t, lang } = translator
  const now = useNowMinutes()
  const stats = useSiteStats()
  const format = useMemo(() => new Intl.NumberFormat(intlLocale(lang)), [lang])
  const s = stats.data?.statistics
  const generatedAt = stats.data?.generatedAt

  const lastMonth = (n?: number) =>
    n ? t("about.stats.lastMonth", { n: format.format(n) }) : undefined
  const yesterday = (n?: number) =>
    n ? t("about.stats.yesterday", { n: format.format(n) }) : undefined

  return (
    <AboutSection id="numbers" title={t("about.stats.title")}>
      {stats.isError ? (
        <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          {t("about.stats.unavailable")}
        </p>
      ) : !s ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : (
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat
            icon={<UsersThreeFillIcon />}
            label={t("about.stats.vtubers")}
            value={s.channelCount?.vtuber ?? 0}
            delta={lastMonth(s.monthlyChannels?.vtuber)}
            tone="brand"
            format={format}
          />
          <Stat
            icon={<SubtitlesIcon />}
            label={t("about.stats.subbers")}
            value={s.channelCount?.subber ?? 0}
            delta={lastMonth(s.monthlyChannels?.subber)}
            tone="complement"
            format={format}
          />
          <Stat
            icon={<FilmStripIcon />}
            label={t("about.stats.videos")}
            value={s.totalVideos?.count ?? 0}
            delta={yesterday(s.dailyVideos?.count)}
            tone="brand"
            format={format}
          />
          <Stat
            icon={<MusicNotesFillIcon />}
            label={t("about.stats.songs")}
            value={s.totalSongs?.count ?? 0}
            tone="complement"
            format={format}
          />
        </dl>
      )}
      {generatedAt && (
        <p className="mt-2 text-right text-xs text-muted-foreground">
          {Math.abs(generatedAt - now) < 60_000
            ? t("about.stats.updatedNow")
            : t("about.stats.updated", {
                time: formatDistance(generatedAt, translator, now),
              })}
        </p>
      )}
      <OrgConstellation />
    </AboutSection>
  )
}
