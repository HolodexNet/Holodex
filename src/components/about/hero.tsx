import { useMemo, useState, type ReactNode } from "react"
import { Link } from "react-router"
import { cn } from "cn"

import { ChannelAvatar } from "@/components/common/channel-avatar"
import { LogoOutline } from "@/components/common/logo"
import {
  HeartFillIcon,
  LogoDiscordIcon,
  QuestionIcon,
  SparkleIcon,
} from "@/components/icons"
import { OrgIcon } from "@/components/layout/org-selector"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ALL_VTUBERS } from "@/lib/consts"
import { useT } from "@/lib/i18n"
import { useOrgLive, useOrgs } from "@/lib/queries"
import type { ChannelSummary } from "@/lib/types"
import { channelName, videoTitle, watchPath } from "@/lib/video"
import { isVideoPlaceholder, videoSource } from "@/lib/video-source"
import { useOrgStore } from "@/stores/org"
import { useSettings } from "@/stores/settings"
import { ExternalLink, HashLink, LINKS } from "./shared"

interface Face {
  id: string
  label: string
  /** In-app destination; `href` instead for one on another site. */
  to?: string
  href?: string
  render: (size: number) => ReactNode
}

const MAX_FACES = 40
/** Below this, a wall of live faces looks sparse; organizations stand in. */
const MIN_FACES = 10

/**
 * Who is streaming in the viewer's organization right now (the home page has
 * usually fetched this already), falling back to the organizations themselves.
 */
function useWallFaces() {
  const org = useOrgStore((s) => s.currentOrg)
  const live = useOrgLive(org.name)
  const orgs = useOrgs()
  const blocked = useSettings((s) => s.blockedChannels)
  const preferEnglish = useSettings((s) => s.useEnglishName)
  const redirectMode = useSettings((s) => s.redirectMode)

  return useMemo(() => {
    const blockedIds = new Set(blocked.map((c) => c.id))
    const seen = new Set<string>()
    const onAir: Face[] = []
    const soon: Face[] = []

    for (const video of live.data ?? []) {
      const channel: ChannelSummary = video.channel
      if (video.status !== "live" && video.status !== "upcoming") continue
      if (blockedIds.has(channel.id) || seen.has(channel.id)) continue
      seen.add(channel.id)
      const isLive = video.status === "live"
      const name = channelName(channel, preferEnglish)
      // A live face opens the stream itself, the way its video card would.
      const stream = isLive && !isVideoPlaceholder(video)
      const external = stream && redirectMode ? videoSource(video).url : null
        ; (isLive ? onAir : soon).push({
          id: channel.id,
          label: stream ? `${name} · ${videoTitle(video, preferEnglish)}` : name,
          ...(external
            ? { href: external }
            : { to: stream ? watchPath(video.id) : `/channel/${channel.id}` }),
          render: (size) => (
            <ChannelAvatar
              channel={channel}
              size={size}
              live={isLive}
              className="ring-offset-card"
            />
          ),
        })
    }

    let faces = [...onAir, ...soon].slice(0, MAX_FACES)
    // Wait for the schedule rather than flashing organizations first.
    if (faces.length < MIN_FACES && !live.isPending && orgs.data?.length) {
      faces = orgs.data
        .filter((o) => o.icon && o.name !== ALL_VTUBERS)
        .slice(0, MAX_FACES)
        .map((o) => ({
          id: o.name,
          label: o.name,
          to: `/channel?${new URLSearchParams({ org: o.name })}`,
          render: (size) => (
            <OrgIcon org={o} size={size} className="size-full" />
          ),
        }))
    }

    return {
      faces,
      loading: faces.length === 0 && (live.isPending || orgs.isPending),
      liveCount: onAir.length,
      orgName: org.name,
      allOrgs: org.name === ALL_VTUBERS,
    }
  }, [
    live.data,
    live.isPending,
    orgs.data,
    orgs.isPending,
    blocked,
    preferEnglish,
    redirectMode,
    org.name,
  ])
}

/** Seconds for one face to slide past: about 18px a second, slow to aim at. */
const SECONDS_PER_FACE = 3.5

/**
 * A face is a mouse and touch shortcut only: the live pill above leads
 * keyboard and screen reader users to the same streams without forty tab
 * stops. It never drags, so a click that wobbles still lands.
 */
function FaceLink({ face, size }: { face: Face; size: number }) {
  const props = {
    title: face.label,
    tabIndex: -1,
    draggable: false,
    className:
      "relative block shrink-0 rounded-full p-1 transition-transform duration-200 select-none hover:z-10 hover:scale-110 motion-reduce:transition-none [&_img]:pointer-events-none",
    style: { width: size + 8, height: size + 8 },
  }
  return face.href ? (
    <ExternalLink href={face.href} {...props}>
      {face.render(size)}
    </ExternalLink>
  ) : (
    <Link to={face.to ?? "/"} {...props}>
      {face.render(size)}
    </Link>
  )
}

/** One endlessly sliding row of two identical halves. */
function MarqueeRow({
  faces,
  size,
  paused,
  reverse = false,
}: {
  faces: Face[]
  size: number
  paused: boolean
  reverse?: boolean
}) {
  // Repeat short rows so each half is wider than the screen.
  const half = useMemo(() => {
    const times = Math.max(1, Math.ceil(16 / Math.max(faces.length, 1)))
    return Array.from({ length: times }, () => faces).flat()
  }, [faces])

  const strip = (copy: number) => (
    <div key={copy} className="flex shrink-0 items-center gap-3 pr-3">
      {half.map((face, i) => (
        <FaceLink key={`${face.id}-${i}`} face={face} size={size} />
      ))}
    </div>
  )

  return (
    <div
      className="flex w-max animate-marquee motion-reduce:animate-none"
      // Inline longhands override the shorthand from the animate-* utility.
      style={{
        animationDuration: `${half.length * SECONDS_PER_FACE}s`,
        animationDirection: reverse ? "reverse" : "normal",
        animationPlayState: paused ? "paused" : "running",
      }}
    >
      {strip(0)}
      {strip(1)}
    </div>
  )
}

function OshiWall() {
  const { tc } = useT()
  const { faces, loading, liveCount, orgName, allOrgs } = useWallFaces()
  // Held still under a mouse, and from the first touch of a tap, so the face
  // being aimed at is still there when the click lands.
  const [paused, setPaused] = useState(false)

  if (loading)
    return (
      <div
        aria-hidden="true"
        className="flex flex-col gap-2 overflow-hidden px-6 pt-10 pb-6 md:px-10"
      >
        {[0, 1].map((row) => (
          <div key={row} className={cn("flex gap-3", row === 1 && "pl-7")}>
            {Array.from({ length: 24 }, (_, i) => (
              <Skeleton key={i} className="m-1 size-11 shrink-0 rounded-full" />
            ))}
          </div>
        ))}
      </div>
    )
  if (faces.length === 0) return null

  const rows = [
    faces.filter((_, i) => i % 2 === 0),
    faces.filter((_, i) => i % 2 === 1),
  ].filter((row) => row.length > 0)

  return (
    <div className="relative pb-6">
      {liveCount > 0 && (
        <div className="px-6 pb-3 md:px-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-live/10 px-3 py-1 text-xs font-semibold text-live transition-colors outline-none hover:bg-live/15 focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <span className="relative flex size-2" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-live opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-live" />
            </span>
            {allOrgs
              ? tc("about.hero.liveNowAll", liveCount)
              : tc("about.hero.liveNow", liveCount, { org: orgName })}
          </Link>
        </div>
      )}
      <div
        aria-hidden="true"
        onPointerEnter={() => setPaused(true)}
        onPointerDown={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        className="flex flex-col gap-2 overflow-hidden mask-[linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] py-1.5"
      >
        {rows.map((row, i) => (
          <MarqueeRow
            key={i}
            faces={row}
            size={44}
            paused={paused}
            reverse={i === 1}
          />
        ))}
      </div>
    </div>
  )
}

export function AboutHero() {
  const { t } = useT()

  return (
    <header
      id="hello"
      className="relative isolate scroll-mt-[calc(var(--header-height)+env(safe-area-inset-top,0px)+1.5rem)] overflow-hidden rounded-3xl border bg-card"
    >
      <div className="absolute inset-0 -z-10">
        <LogoOutline className="pointer-events-none absolute -top-12 -right-14 -z-10 size-72 rotate-12 opacity-25 md:size-96" />
        <SparkleIcon
          aria-hidden="true"
          className="pointer-events-none absolute top-8 right-[38%] -z-10 hidden size-5 text-primary/60 md:block"
        />
        <SparkleIcon
          aria-hidden="true"
          className="pointer-events-none absolute top-[45%] right-10 -z-10 size-3 text-complement/70"
        />
      </div>
      <div className="px-6 pt-8 pb-6 md:px-10 md:pt-10">
        <h1 className="max-w-3xl text-3xl font-extrabold tracking-tight text-balance md:text-4xl">
          {t("about.hero.title")}
        </h1>
        <p className="mt-3 max-w-2xl text-base text-pretty text-muted-foreground">
          {t("about.general.summary.1")}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button
            size="lg"
            nativeButton={false}
            className="bg-[#5865F2] text-white hover:bg-[#4752c4]"
            render={<ExternalLink href={LINKS.discord} />}
          >
            <LogoDiscordIcon data-icon="inline-start" />
            {t("about.discordBtn")}
          </Button>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            className="bg-background/60 backdrop-blur"
            render={<HashLink to="faq" />}
          >
            <QuestionIcon data-icon="inline-start" />
            {t("about.nav.faq")}
          </Button>
        </div>
      </div>

      <OshiWall />
    </header>
  )
}
