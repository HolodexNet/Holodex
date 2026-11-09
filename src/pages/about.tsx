import { useEffect } from "react"
import { useLocation, useParams } from "react-router"
import { cn } from "cn"

import { Changelog } from "@/components/about/changelog"
import { FAQ_IDS, Faq } from "@/components/about/faq"
import { Extras } from "@/components/about/extras"
import { FinePrint } from "@/components/about/fine-print"
import { AboutHero } from "@/components/about/hero"
import { PitchIn } from "@/components/about/pitch-in"
import {
  AboutSection,
  ExternalLink,
  LINKS,
  revealOnPage,
  textLink,
  useSeenOnce,
} from "@/components/about/shared"
import { ArchiveStats } from "@/components/about/stats"
import { Thanks } from "@/components/about/thanks"
import { AboutToc, type TocItem } from "@/components/about/toc"
import { Logo } from "@/components/common/logo"
import {
  ArrowSquareOutIcon,
  LogoDiscordIcon,
  LogoGithubIcon,
  LogoTwitterIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { useT } from "@/lib/i18n"

/** Index entries, in page order; labels are message keys. */
const CONTENTS = [
  { id: "hello", label: "component.mainNav.about" },
  { id: "numbers", label: "about.nav.numbers" },
  { id: "thanks", label: "about.nav.thanks" },
  { id: "pitch-in", label: "about.nav.pitchIn" },
  { id: "extras", label: "about.nav.extras" },
  { id: "faq", label: "about.nav.faq" },
  { id: "updates", label: "about.nav.updates" },
  { id: "contact", label: "about.nav.contact" },
  { id: "fine-print", label: "about.nav.finePrint" },
] as const

/**
 * `/about/<section>` addresses, including the ones the previous redesign's
 * sub-pages used, mapped to the element they land on.
 */
const SECTION_PATHS: Record<string, string> = {
  stats: "numbers",
  numbers: "numbers",
  credits: "thanks",
  thanks: "thanks",
  contribute: "pitch-in",
  "pitch-in": "pitch-in",
  extension: "extras",
  extensions: "extras",
  extras: "extras",
  bookmarklet: "extras",
  faq: "faq",
  changelog: "updates",
  updates: "updates",
  contact: "contact",
  privacy: "privacy",
  gdpr: "faq-gdpr",
  terms: "fine-print",
}

function resolveTarget(section: string | undefined, hash: string) {
  const id = decodeURIComponent(hash.slice(1))
  if (id) {
    const faqId = FAQ_IDS.find((faq) => faq === id)
    return section === "faq" && faqId ? `faq-${faqId}` : id
  }
  return section ? SECTION_PATHS[section] : undefined
}

function Updates() {
  const { t } = useT()
  // The changelog is a separate download; fetch it once it is nearly in view.
  const [ref, seen] = useSeenOnce<HTMLDivElement>()

  return (
    <AboutSection
      id="updates"
      eyebrow={t("about.changelog.title")}
      title={t("about.changelog.heading")}
      description={
        <ExternalLink
          href={LINKS.changelog}
          className={cn(textLink, "inline-flex items-center gap-1")}
        >
          {t("about.changelog.full")}
          <ArrowSquareOutIcon className="size-3.5" aria-hidden="true" />
        </ExternalLink>
      }
    >
      <div ref={ref} className="rounded-3xl border bg-card p-5 md:p-7">
        <Changelog enabled={seen} />
      </div>
    </AboutSection>
  )
}

/** The closing card, like the end screen of a stream. */
function Outro() {
  const { t } = useT()
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="relative isolate scroll-mt-[calc(var(--header-height)+env(safe-area-inset-top,0px)+1.5rem)] overflow-hidden rounded-3xl border bg-card px-6 py-12 text-center md:py-16"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: [
            "radial-gradient(60% 90% at 50% 120%, color-mix(in oklch, var(--primary) 22%, transparent), transparent)",
            "radial-gradient(40% 60% at 50% -20%, color-mix(in oklch, var(--complement) 16%, transparent), transparent)",
          ].join(", "),
        }}
      />
      <Logo className="mx-auto size-12" />
      <p className="mt-4 text-xs font-semibold tracking-[0.14em] text-brand uppercase">
        {t("about.outro.eyebrow")}
      </p>
      <h2
        id="contact-title"
        className="mt-1.5 text-2xl font-bold tracking-tight text-balance md:text-3xl"
      >
        {t("about.outro.title")}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-pretty text-muted-foreground">
        {t("about.outro.body")}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button
          size="lg"
          nativeButton={false}
          className="bg-[#5865F2] text-white hover:bg-[#4752c4]"
          render={<ExternalLink href={LINKS.discord} />}
        >
          <LogoDiscordIcon data-icon="inline-start" />
          {t("about.contact.discord")}
        </Button>
        <Button
          size="lg"
          variant="outline"
          nativeButton={false}
          render={<ExternalLink href={LINKS.twitterDm} />}
        >
          <LogoTwitterIcon data-icon="inline-start" />
          {t("about.contact.twitter")}
        </Button>
        <Button
          size="lg"
          variant="outline"
          nativeButton={false}
          render={<ExternalLink href={LINKS.issues} />}
        >
          <LogoGithubIcon data-icon="inline-start" />
          {t("about.outro.issues")}
        </Button>
      </div>
    </section>
  )
}

export default function AboutPage() {
  const { t } = useT()
  const { section } = useParams()
  const { hash } = useLocation()

  useDocumentTitle(t("component.mainNav.about"))
  const contents: TocItem[] = CONTENTS.map((item) => ({
    id: item.id,
    label: t(item.label),
  }))

  // Land on the section or answer the address names, unfolding it if needed.
  useEffect(() => {
    const target = resolveTarget(section, hash)
    if (!target) return
    const frame = requestAnimationFrame(() => revealOnPage(target, false))
    return () => cancelAnimationFrame(frame)
  }, [section, hash])

  return (
    // On desktop the right padding leaves the index rail its own lane.
    <div className="mx-auto flex w-full max-w-6xl flex-col px-4 pt-4 pb-16 md:px-8 md:pt-6 md:pointer-fine:pr-14">
      <AboutHero />
      <AboutToc items={contents} />
      <div className="mt-10 flex flex-col gap-16 md:mt-14 md:gap-24">
        <ArchiveStats />
        <Thanks />
        <PitchIn />
        <Extras />
        <Faq />
        <Updates />
        <Outro />
        <FinePrint />
      </div>
    </div>
  )
}
