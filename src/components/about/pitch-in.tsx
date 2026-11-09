import type { ReactNode } from "react"
import { Link } from "react-router"
import { cn } from "cn"

import {
  ArrowSquareOutIcon,
  CaretRightIcon,
  CodeIcon,
  CoffeeIcon,
  LogoDiscordIcon,
  LogoGithubIcon,
  MusicNotesFillIcon,
  TranslateIcon,
  UserCircleIcon,
} from "@/components/icons"
import { useT } from "@/lib/i18n"
import { useAuth } from "@/stores/auth"
import { AboutSection, ExternalLink, LINKS } from "./shared"

interface Tile {
  key: string
  icon: ReactNode
  /** Background and text colour of the icon chip. */
  chip: string
  title: string
  body: string
  action?: string
  href?: string
  to?: string
  wide?: boolean
}

function TileCard({ tile }: { tile: Tile }) {
  const inner = (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-105 group-hover:-rotate-6 motion-reduce:transition-none [&_svg]:size-6",
          tile.chip
        )}
      >
        {tile.icon}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-bold">{tile.title}</h3>
        <p className="mt-1 text-sm text-pretty text-muted-foreground">
          {tile.body}
        </p>
        {tile.action && (
          <p className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand">
            {tile.action}
            {tile.href ? (
              <ArrowSquareOutIcon className="size-3.5" aria-hidden="true" />
            ) : tile.to ? (
              <CaretRightIcon className="size-3.5" aria-hidden="true" />
            ) : null}
          </p>
        )}
      </div>
    </>
  )
  const className = cn(
    "group flex h-full gap-4 rounded-2xl border bg-card p-4 md:p-5",
    (tile.href || tile.to) &&
      "transition-colors outline-none hover:border-primary/40 hover:bg-primary/[0.03] focus-visible:ring-[3px] focus-visible:ring-ring/50"
  )

  if (tile.href)
    return (
      <ExternalLink href={tile.href} className={className}>
        {inner}
      </ExternalLink>
    )
  if (tile.to)
    return (
      <Link to={tile.to} className={className}>
        {inner}
      </Link>
    )
  return <div className={className}>{inner}</div>
}

export function PitchIn() {
  const { t } = useT()
  const loggedIn = useAuth((s) => !!s.jwt)

  const tiles: Tile[] = [
    {
      key: "discord",
      icon: <LogoDiscordIcon />,
      chip: "bg-[#5865F2] text-white",
      title: t("about.pitchIn.discord.title"),
      body: t("about.pitchIn.discord.body"),
      action: t("about.discordBtn"),
      href: LINKS.discord,
      wide: true,
    },
    {
      key: "translate",
      icon: <TranslateIcon />,
      chip: "bg-complement-soft text-complement",
      title: t("about.pitchIn.translate.title"),
      body: t("about.pitchIn.translate.body"),
      action: t("about.pitchIn.translate.action"),
      href: LINKS.crowdin,
    },
    {
      key: "edit",
      icon: <MusicNotesFillIcon />,
      chip: "bg-primary/12 text-brand",
      title: t("about.pitchIn.edit.title"),
      body: loggedIn
        ? `${t("about.pitchIn.edit.body")} ${t("about.pitchIn.edit.loggedIn")}`
        : t("about.pitchIn.edit.body"),
      action: loggedIn ? undefined : t("about.pitchIn.edit.action"),
      to: loggedIn ? undefined : "/login",
    },
    {
      key: "request",
      icon: <UserCircleIcon />,
      chip: "bg-primary/12 text-brand",
      title: t("views.about.add_my_channel"),
      body: t("about.pitchIn.request.body"),
      action: t("views.about.add_my_channel"),
      to: "/addChannel",
    },
    {
      key: "github",
      icon: <LogoGithubIcon />,
      chip: "bg-foreground text-background",
      title: t("about.pitchIn.github.title"),
      body: t("about.pitchIn.github.body"),
      action: "GitHub",
      href: LINKS.github,
    },
    {
      key: "api",
      icon: <CodeIcon />,
      chip: "bg-complement-soft text-complement",
      title: t("about.pitchIn.api.title"),
      body: t("about.pitchIn.api.body"),
      action: t("about.quicklink.apiDocs"),
      href: LINKS.apiDocs,
    },
    {
      key: "kofi",
      icon: <CoffeeIcon />,
      chip: "bg-[#ff5e5b] text-white",
      title: t("about.pitchIn.kofi.title"),
      body: t("about.pitchIn.kofi.body"),
      action: "Ko-fi",
      href: LINKS.kofi,
    },
  ]

  return (
    <AboutSection
      id="pitch-in"
      eyebrow={t("about.pitchIn.eyebrow")}
      title={t("about.pitchIn.title")}
      description={t("about.pitchIn.description")}
    >
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <li key={tile.key} className={cn(tile.wide && "sm:col-span-2")}>
            <TileCard tile={tile} />
          </li>
        ))}
      </ul>
    </AboutSection>
  )
}
