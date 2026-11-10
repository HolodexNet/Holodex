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
import { ArrowSquareOutIcon } from "@/components/icons"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { useT } from "@/lib/i18n"
import { cardVariants } from "@/components/ui/card"

/** Index entries, in page order; labels are message keys. */
const CONTENTS = [
  { id: "hello", label: "component.mainNav.about" },
  { id: "numbers", label: "about.nav.numbers" },
  { id: "thanks", label: "about.nav.thanks" },
  { id: "pitch-in", label: "about.nav.pitchIn" },
  { id: "extras", label: "about.nav.extras" },
  { id: "faq", label: "about.nav.faq" },
  { id: "updates", label: "about.nav.updates" },
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
  contact: "faq-feedback",
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
      <div
        ref={ref}
        className={cn(cardVariants({ radius: "3xl" }), "p-5 md:p-7")}
      >
        <Changelog enabled={seen} />
      </div>
    </AboutSection>
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
        <FinePrint />
      </div>
    </div>
  )
}
