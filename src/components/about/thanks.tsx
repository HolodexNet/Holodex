import type { CSSProperties, ReactNode } from "react"
import { cn } from "cn"

import { Logo } from "@/components/common/logo"
import {
  InfinityBoldIcon,
  PlusIcon,
  UsersThreeFillIcon,
} from "@/components/icons"
import { UI_LANGS } from "@/lib/consts"
import { useT } from "@/lib/i18n"
import {
  AboutSection,
  ExternalLink,
  LINKS,
  textLink,
  useSeenOnce,
} from "./shared"

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
          
          <p className="text-[15px] font-bold"><InfinityBoldIcon className="size-4 inline-block mr-1" />{t("about.thanks.amount")}</p>
        </div>
      </header>
      <div className="px-4 py-3 text-[15px]" style={{ background: body }}>
        <h3 className="font-bold">{to}</h3>
        <p className="mt-0.5 text-pretty">{children}</p>
      </div>
    </article>
  )
}

const CREW = [
  { name: "RiceCakes", roles: ["creator", "admin"] },
  { name: "Xrave", roles: ["admin"] },
  { name: "Uetchy", roles: ["developer", "designer"] },
  { name: "MadeT", roles: ["designer"] },
  { name: "NeloBlivion", roles: ["twitch", "editor"] },
] as const

function StaffPass({
  avatar,
  name,
  roles,
  dashed = false,
  hue,
}: {
  avatar: ReactNode
  name: ReactNode
  roles: ReactNode
  dashed?: boolean
  hue?: number
}) {
  const { t } = useT()
  return (
    <li
      className={cn(
        "relative flex flex-col items-center rounded-2xl bg-card px-3 pt-6 pb-4 text-center transition-transform duration-200 hover:-rotate-1 motion-reduce:transition-none",
        dashed ? "border-2 border-dashed" : "border"
      )}
    >
      {/* The lanyard slot of a staff pass. */}
      <span
        aria-hidden="true"
        className="absolute top-2.5 left-1/2 h-1.5 w-10 -translate-x-1/2 rounded-full bg-muted"
      />
      <span className="mt-1 rounded bg-primary px-2 py-px text-[10px] font-bold tracking-[0.2em] text-primary-foreground uppercase">
        {t("about.thanks.staff")}
      </span>
      <span
        aria-hidden="true"
        className="mt-3 flex size-14 items-center justify-center rounded-full text-xl font-bold text-white shadow-inner"
        style={
          hue === undefined
            ? undefined
            : {
                background: `linear-gradient(${hue}deg, var(--primary), var(--complement))`,
              }
        }
      >
        {avatar}
      </span>
      <p className="mt-2 font-bold">{name}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{roles}</p>
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
    { to: t("about.thanks.you.to"), message: t("about.thanks.you.message") },
  ]

  return (
    <AboutSection
      id="thanks"
      eyebrow={t("about.credits.title")}
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
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {CREW.map((member, i) => (
          <StaffPass
            key={member.name}
            hue={120 + i * 45}
            avatar={member.name.slice(0, 1)}
            name={member.name}
            roles={member.roles.map((r) => t(`about.roles.${r}`)).join(" · ")}
          />
        ))}
        <StaffPass
          hue={300}
          avatar={<UsersThreeFillIcon className="size-7" />}
          name={t("about.thanks.editorsCount")}
          roles={t("about.thanks.editorsCountRole")}
        />
        <StaffPass
          dashed
          avatar={
            <span className="flex size-full items-center justify-center rounded-full border-2 border-dashed text-muted-foreground">
              <PlusIcon className="size-6" />
            </span>
          }
          name={
            <ExternalLink href={LINKS.discord} className={textLink}>
              {t("about.thanks.yourName")}
            </ExternalLink>
          }
          roles={t("about.general.credits.addRequest")}
        />
      </ul>

      <h3 className="mt-10 text-lg font-bold tracking-tight">
        {t("about.thanks.translatorsTitle")}
      </h3>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {TRANSLATIONS.map((lang) => (
          <li
            key={lang.val}
            lang={lang.val.startsWith("lol-") ? "en" : lang.val}
            className="rounded-xl border bg-card px-4 py-3"
          >
            <p className="text-lg font-bold text-brand">
              {THANK_YOU[lang.val] ?? "Thank you!"}
            </p>
            <p className="mt-0.5 text-sm">
              <span className="font-medium">{lang.display}</span>
              <span className="text-muted-foreground">
                {" · "}
                {translatorNames(lang.credit)}
              </span>
            </p>
          </li>
        ))}
      </ul>
    </AboutSection>
  )
}
