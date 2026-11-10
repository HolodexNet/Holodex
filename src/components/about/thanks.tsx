import { cardVariants } from "@/components/ui/card"
import { useState, type CSSProperties, type ReactNode } from "react"
import { Link } from "react-router"
import { cn } from "cn"

import { ChannelAvatar } from "@/components/common/channel-avatar"
import { Logo } from "@/components/common/logo"
import { InfinityBoldIcon } from "@/components/icons"
import { UI_LANGS } from "@/lib/consts"
import { useT } from "@/lib/i18n"
import { useChannelInfos } from "@/lib/queries"
import type { StaticChannel } from "@/lib/types"
import { channelName } from "@/lib/video"
import { useSettings } from "@/stores/settings"
import { AboutSection, ExternalLink, useSeenOnce } from "./shared"

/** Live-chat Super Chat tiers, highest first: header, body, text. */
const TIERS = [
  ["#d00000", "#e62117", "#fff"],
  ["#c2185b", "#e91e63", "#fff"],
  ["#e65100", "#f57c00", "#fff"],
  ["#ffb300", "#ffca28", "rgb(0 0 0 / 0.87)"],
  ["#00bfa5", "#1de9b6", "rgb(0 0 0 / 0.87)"],
  ["#00b8d4", "#00e5ff", "rgb(0 0 0 / 0.87)"],
  ["#1565c0", "#1e88e5", "#fff"],
] as const

function SuperThanks({
  tier,
  to,
  index,
  shown,
  children,
}: {
  tier: number
  to: string
  index: number
  shown: boolean
  children: ReactNode
}) {
  const { t } = useT()
  const [head, body, text] = TIERS[tier]

  return (
    <article
      className={cn(
        "mb-3 break-inside-avoid overflow-hidden rounded-xl shadow-sm transition-[opacity,translate] duration-500 ease-out hover:-translate-y-0.5 motion-reduce:transition-none",
        !shown && "motion-safe:translate-y-3 motion-safe:opacity-0"
      )}
      style={
        {
          color: text,
          transitionDelay: shown ? `${index * 90}ms` : undefined,
        } as CSSProperties
      }
    >
      <header
        className="flex items-center gap-3 px-4 py-2.5"
        style={{ background: head }}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/90">
          <Logo className="size-5" />
        </span>
        <div className="min-w-0 leading-tight">
          <p className="text-[13px] opacity-75">{t("about.thanks.sender")}</p>
          <p className="text-[15px] font-bold">
            <InfinityBoldIcon className="mr-1 inline-block size-4" />
            {t("about.thanks.amount")}
          </p>
        </div>
      </header>
      <div className="px-4 py-3 text-[15px]" style={{ background: body }}>
        <h3 className="font-bold">{to}</h3>
        <p className="mt-0.5 text-pretty">{children}</p>
      </div>
    </article>
  )
}

export const ROLES = [
  "creator",
  "admin",
  "developer",
  "designer",
  "twitch",
  "editor",
] as const
export type Role = (typeof ROLES)[number]

/**
 * A crew member's fan profile. Only `name` and `roles` are required; each
 * other field is a personal touch that appears on the card once it is set.
 * New members can build theirs at /about/crew-card (pages/crew-card.tsx).
 */
export interface CrewMember {
  name: string
  roles: readonly Role[]
  /** Profile picture URL; `github()` gives any GitHub account's. */
  avatar?: string
  /**
   * YouTube channel id of their oshi. The oshi's avatar and name go on the
   * card, linked to their channel, and the channel banner becomes its header.
   */
  oshi?: string
  /** Oshi mark: the emoji a fan puts after their name, e.g. "🌸". */
  mark?: string
  /** Any CSS colour; fills the header where there is no oshi banner. */
  color?: string
  /** A line of their own: a greeting, a catchphrase, a favourite clip. */
  line?: string
}

export const github = (user: string) =>
  `https://github.com/${user}.png?size=128`
export const discord = (user: string, sha: string) =>
  `https://cdn.discordapp.com/avatars/${user}/${sha}.png?size=1024`
export const CREW: CrewMember[] = [
  {
    name: "RiceCakes",
    roles: ["creator", "admin"],
    avatar: discord("113871822914584584", "94aecc290deaa0a62686d799ef00c007"),
  },
  {
    name: "Xrave",
    roles: ["admin", "developer"],
    avatar: discord("140425843108216832", "db2bafe69eab71a91fe3aabd83509c3b"),
    color: "#f13da3",
  },
  {
    name: "Uetchy",
    roles: ["developer", "designer"],
    avatar: github("uetchy"),
  },
  { name: "MadeT", roles: ["designer"] },
  {
    name: "NeloBlivion",
    roles: ["admin", "editor"],
    avatar: github("NeloBlivion"),
  },
]

const OSHI_IDS = CREW.flatMap((member) => (member.oshi ? [member.oshi] : []))

function CrewAvatar({ member }: { member: CrewMember }) {
  // Keyed by URL so a new avatar gets its own chance to load.
  const [failedSrc, setFailedSrc] = useState<string>()
  return (
    // Positioned so it paints over the banner it overlaps.
    <span className="relative -mt-8 flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xl font-bold text-muted-foreground ring-4 ring-card">
      {member.avatar && member.avatar !== failedSrc ? (
        <img
          src={member.avatar}
          alt=""
          width={64}
          height={64}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="size-full object-cover"
          onError={() => setFailedSrc(member.avatar)}
        />
      ) : (
        <span aria-hidden="true">{Array.from(member.name)[0]}</span>
      )}
    </span>
  )
}

export function CrewCard({
  member,
  oshi,
}: {
  member: CrewMember
  oshi?: StaticChannel
}) {
  const { t } = useT()
  const preferEnglish = useSettings((s) => s.useEnglishName)
  const [bannerFailedFor, setBannerFailedFor] = useState<string>()

  return (
    <li
      className={cn(
        cardVariants({ radius: "2xl" }),
        "flex flex-col overflow-hidden"
      )}
    >
      <div
        aria-hidden="true"
        className="relative h-14 bg-muted"
        style={member.color ? { backgroundColor: member.color } : undefined}
      >
        {member.oshi && member.oshi !== bannerFailedFor && (
          <img
            src={`/statics/channelImg/${encodeURIComponent(member.oshi)}/banner/1.jpeg`}
            alt=""
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="absolute inset-0 size-full object-cover"
            onError={() => setBannerFailedFor(member.oshi)}
          />
        )}
      </div>
      <div className="flex flex-1 flex-col px-4 pb-4">
        <CrewAvatar member={member} />
        <p className="mt-2 font-bold">
          {member.name}
          {member.mark && (
            <span className="ml-1 font-normal">{member.mark}</span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          {member.roles.map((r) => t(`about.roles.${r}`)).join(" · ")}
        </p>
        {member.line && (
          <p className="mt-2 text-sm text-pretty">{member.line}</p>
        )}
        {member.oshi && (
          <Link
            to={`/channel/${member.oshi}`}
            className="mt-auto flex items-center gap-2 rounded-xl pt-3 focus-ring outline-none hover:text-brand"
          >
            <ChannelAvatar
              channel={{ id: member.oshi, name: oshi?.name ?? "" }}
              size={28}
            />
            <span className="min-w-0 leading-tight">
              <span className="block text-[11px] text-muted-foreground">
                {t("about.thanks.oshi")}
              </span>
              {oshi && (
                <span className="block truncate text-sm font-medium">
                  {channelName(oshi, preferEnglish)}
                </span>
              )}
            </span>
          </Link>
        )}
      </div>
    </li>
  )
}

/** "Thank you", in the language each volunteer translated Holodex into. */
const THANK_YOU: Record<string, string> = {
  "lol-UWU": "Thank chu!! (◕ᴗ◕✿)",
  "lol-PEKO": "Thank you peko!",
  ja: "ありがとう！",
  zh: "謝謝！",
  "zh-CN": "谢谢！",
  ko: "감사합니다!",
  "es-ES": "¡Gracias!",
  es: "¡Gracias!",
  ms: "Terima kasih!",
  id: "Terima kasih!",
  ru: "Спасибо!",
  pt: "Obrigado!",
  de: "Danke!",
  it: "Grazie!",
  fr: "Merci !",
  tr: "Teşekkürler!",
  vi: "Cảm ơn!",
  hu: "Köszönöm!",
  th: "ขอบคุณ!",
}

/** Discord tags predate usernames; the discriminator is noise here. */
function translatorNames(credit: string): string {
  return credit
    .split(",")
    .map((name) =>
      name
        .trim()
        .replace(/^#/, "")
        .replace(/#\d{4}$/, "")
    )
    .filter(Boolean)
    .join(", ")
}

const TRANSLATIONS = UI_LANGS.filter((lang) => lang.credit !== "@Holodex")

export function Thanks() {
  const { t, tl } = useT()
  const [ref, seen] = useSeenOnce<HTMLDivElement>()
  const credits = tl("about.credits.contents")
  const oshis = useChannelInfos(OSHI_IDS)

  const thanks: { to: string; message: ReactNode }[] = [
    {
      to: t("about.thanks.talents.to"),
      message: t("about.thanks.talents.message"),
    },
    { to: t("about.thanks.subbers.to"), message: credits[2] },
    {
      to: t("about.thanks.editors.to"),
      message: t("about.thanks.editors.message"),
    },
    {
      to: t("about.thanks.holotools.to"),
      message: (
        <>
          {credits[0]}{" "}
          <ExternalLink
            href="https://hololive.jetri.co/"
            className="font-bold underline underline-offset-2"
          >
            HoloTools
          </ExternalLink>{" "}
          {credits[1]}{" "}
          <ExternalLink
            href="https://github.com/holofans/holoapi"
            className="font-bold underline underline-offset-2"
          >
            holoapi
          </ExternalLink>
          .
        </>
      ),
    },
    {
      to: t("about.thanks.translators.to"),
      message: t("about.thanks.translators.message", {
        n: TRANSLATIONS.length,
      }),
    },
    {
      to: t("about.thanks.contributors.to"),
      message: t("about.thanks.contributors.message"),
    },
  ]

  return (
    <AboutSection
      id="thanks"
      title={t("about.thanks.title")}
      description={t("about.thanks.description")}
    >
      <div ref={ref} className="columns-1 gap-3 sm:columns-2 lg:columns-3">
        {thanks.map((item, i) => (
          <SuperThanks key={i} tier={i} index={i} shown={seen} to={item.to}>
            {item.message}
          </SuperThanks>
        ))}
      </div>

      <h3 className="mt-10 text-lg font-bold tracking-tight">
        {t("about.thanks.crew")}
      </h3>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {CREW.map((member) => (
          <CrewCard
            key={member.name}
            member={member}
            oshi={member.oshi ? oshis.get(member.oshi) : undefined}
          />
        ))}
      </ul>
      <p className="mt-3 text-sm text-muted-foreground">
        {t("about.general.credits.addRequest")}
      </p>

      <h3 className="mt-10 text-lg font-bold tracking-tight">
        {t("about.thanks.translatorsTitle")}
      </h3>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {TRANSLATIONS.map((lang) => (
          <li
            key={lang.val}
            className={cn(cardVariants({ radius: "xl" }), "px-4 py-3")}
          >
            <p className="font-semibold text-pretty">
              {translatorNames(lang.credit)}
            </p>
            <p
              lang={lang.val.startsWith("lol-") ? "en" : lang.val}
              className="mt-0.5 text-sm text-muted-foreground"
            >
              {lang.display}
              {" · "}
              <span className="text-brand">
                {THANK_YOU[lang.val] ?? "Thank you!"}
              </span>
            </p>
          </li>
        ))}
      </ul>
    </AboutSection>
  )
}
