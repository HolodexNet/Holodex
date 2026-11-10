import type { ReactNode } from "react"
import { toast } from "sonner"

import {
  CaretDownIcon,
  DotsThreeVerticalIcon,
  ExportIcon,
  FilmStripIcon,
  HandHeartIcon,
  LinkSimpleIcon,
  MonitorPlayIcon,
  ShieldCheckIcon,
} from "@/components/icons"
import { useT } from "@/lib/i18n"
import {
  AboutSection,
  ExternalLink,
  HashLink,
  LINKS,
  RichText,
  textLink,
  withSlot,
} from "./shared"
import { cn } from "cn"
import { cardVariants } from "@/components/ui/card"

/**
 * Answer ids, reachable as `/about#faq-<id>` (and `/about/faq#<id>`, the
 * addresses the previous redesign used).
 */
export const FAQ_IDS = [
  "youtube",
  "autoplay",
  "mobile",
  "music",
  "favorite-disappear",
  "gdpr",
  "subber",
  "video",
  "quit",
  "feedback",
  "support",
] as const

interface Item {
  id: (typeof FAQ_IDS)[number]
  question: string
  answer: ReactNode
}

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] break-all text-foreground">
      {children}
    </code>
  )
}

function SubHeading({ children }: { children: ReactNode }) {
  return <h4 className="mt-4 mb-1 font-semibold text-foreground">{children}</h4>
}

function Question({ item }: { item: Item }) {
  const { t } = useT()

  const copyLink = async () => {
    const hash = `#faq-${item.id}`
    window.history.replaceState(window.history.state, "", hash)
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/about${hash}`
      )
      toast.success(t("about.faqExtra.linkCopied"))
    } catch {
      // Clipboard can be refused; the address bar now holds the link anyway.
    }
  }

  return (
    <li className="group/item relative border-b last:border-b-0">
      <details
        id={`faq-${item.id}`}
        className="peer group/faq scroll-mt-[calc(var(--header-height)+env(safe-area-inset-top,0px)+1.5rem)]"
      >
        <summary className="flex cursor-pointer list-none items-start gap-3 rounded-lg py-4 pr-10 font-semibold focus-ring outline-none select-none [&::-webkit-details-marker]:hidden">
          <span className="flex-1 text-pretty">{item.question}</span>
          <CaretDownIcon
            aria-hidden="true"
            className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open/faq:rotate-180 motion-reduce:transition-none"
          />
        </summary>
        <div className="pr-2 pb-5 text-sm leading-relaxed text-pretty text-muted-foreground [&_li]:mt-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
          {item.answer}
        </div>
      </details>
      <button
        type="button"
        onClick={copyLink}
        title={t("about.faqExtra.copyLink")}
        aria-label={`${t("about.faqExtra.copyLink")}: ${item.question}`}
        className="absolute top-3.5 right-7 rounded-md p-1 text-muted-foreground opacity-0 focus-ring transition-opacity outline-none group-hover/item:opacity-100 peer-open:opacity-100 hover:text-foreground focus-visible:opacity-100"
      >
        <LinkSimpleIcon className="size-4" aria-hidden="true" />
      </button>
    </li>
  )
}

export function Faq() {
  const { t, tl } = useT()
  const subber = tl("about.faq.subber.contents")
  const android = tl("about.faq.mobile.content.android")
  const ios = tl("about.faq.mobile.content.ios")
  const inlineIcon = "mx-0.5 inline size-4 align-text-bottom text-brand"

  const item = (id: Item["id"], question: string, answer: ReactNode): Item => ({
    id,
    question: question.trim(),
    answer,
  })

  const groups: { title: string; icon: ReactNode; items: Item[] }[] = [
    {
      title: t("about.faqGroups.watching"),
      icon: <MonitorPlayIcon />,
      items: [
        item(
          "youtube",
          t("about.faq.ytchatHeader"),
          <>
            <p>{t("about.faqExtra.ytchatWhy")}</p>
            <SubHeading>{t("about.faqExtra.ytchatQuickFix")}</SubHeading>
            <p>{t("about.faqExtra.ytchatLearnMore")}</p>
            <SubHeading>{t("about.faqExtra.ytchatFirefox")}</SubHeading>
            <ol>
              <li>
                {withSlot(
                  t("about.faqExtra.ytchatFirefoxSteps.0"),
                  <Code>about:config</Code>
                )}
              </li>
              <li>
                {withSlot(
                  t("about.faqExtra.ytchatFirefoxSteps.1"),
                  <Code>privacy.restrict3rdpartystorage.skip_list</Code>
                )}
              </li>
              <li>
                {withSlot(
                  t("about.faqExtra.ytchatFirefoxSteps.2"),
                  <Code>{`${window.location.origin},https://www.youtube.com`}</Code>
                )}
              </li>
            </ol>
            <SubHeading>{t("about.faqExtra.ytchatOther")}</SubHeading>
            <p>
              {t("about.faq.ytchatContent")}{" "}
              <ExternalLink
                href="https://support.mozilla.org/en-US/kb/third-party-cookies-firefox-tracking-protection"
                className={textLink}
              >
                {t("about.faq.ytchatFirefox")}
              </ExternalLink>
            </p>
          </>
        ),
        item(
          "autoplay",
          t("about.faq.autoplayHeader"),
          <>
            <p>{t("about.faq.autoplayContent")}</p>
            <p>{t("about.faqExtra.autoplayHint")}</p>
          </>
        ),
        item(
          "mobile",
          t("about.faq.mobile.title"),
          <>
            <p>{t("about.faq.mobile.content.summary")}</p>
            <ul className="mt-2">
              <li>
                {android[0]}
                <DotsThreeVerticalIcon
                  className={inlineIcon}
                  aria-hidden="true"
                />
                {android[1]}
              </li>
              <li>
                {ios[0]}
                <ExportIcon className={inlineIcon} aria-hidden="true" />
                {ios[1]}
              </li>
            </ul>
          </>
        ),
        item(
          "music",
          t("about.faq.musicPlayer"),
          <p>{t("about.faq.musicPlayerContent")}</p>
        ),
      ],
    },
    {
      title: t("about.faqGroups.account"),
      icon: <ShieldCheckIcon />,
      items: [
        item(
          "favorite-disappear",
          t("about.faq.favorite.disappear.title"),
          <p>{t("about.faq.favorite.contents.0")}</p>
        ),
        item(
          "gdpr",
          t("about.gdpr"),
          <>
            <p>
              {t("about.gdprContent")}{" "}
              <strong className="text-foreground">
                {t("about.gdprDeletion")}
              </strong>
            </p>
            <p>
              <HashLink to="privacy" className={textLink}>
                {t("about.privacyPolicy")}
              </HashLink>
            </p>
          </>
        ),
      ],
    },
    {
      title: t("about.faqGroups.creators"),
      icon: <FilmStripIcon />,
      items: [
        item(
          "subber",
          t("about.faq.subber.title"),
          <p>
            {subber[0]}{" "}
            <ExternalLink
              href="https://forms.gle/xkN4w8fyPr6YTGfx6"
              className={textLink}
            >
              {subber[1]}
            </ExternalLink>
            {subber[2]}
          </p>
        ),
        item(
          "video",
          t("about.faq.videoLinkage"),
          <p>{t("about.faq.videoLinkageContent")}</p>
        ),
        item(
          "quit",
          t("about.faq.quitHolodex"),
          <p>{t("about.faq.quitHolodexContent")}</p>
        ),
      ],
    },
    {
      title: t("about.faqGroups.project"),
      icon: <HandHeartIcon />,
      items: [
        item(
          "feedback",
          t("about.faq.feedback.title"),
          <>
            <p>{t("about.faq.feedback.contents.0")}</p>
            <p className="flex flex-wrap gap-x-4 gap-y-1">
              <ExternalLink href={LINKS.discord} className={textLink}>
                {t("about.contact.discord")}
              </ExternalLink>
              <ExternalLink href={LINKS.twitterDm} className={textLink}>
                {t("about.contact.twitter")}
              </ExternalLink>
              <ExternalLink href={LINKS.issues} className={textLink}>
                {t("about.contact.issues")}
              </ExternalLink>
            </p>
          </>
        ),
        item(
          "support",
          t("about.faq.support.title"),
          <p>
            <RichText html={t("about.faq.support.contents.0")} />
          </p>
        ),
      ],
    },
  ]

  return (
    <AboutSection id="faq" title={t("about.faq.title")}>
      <div className={cn(cardVariants({ radius: "3xl" }), "divide-y")}>
        {groups.map((group) => (
          <div
            key={group.title}
            className="grid gap-x-8 px-5 py-2 md:grid-cols-[13rem_1fr] md:px-6"
          >
            <h3 className="flex items-center gap-2 pt-4 pb-1 text-sm font-semibold text-brand md:pb-4 [&_svg]:size-4.5">
              <span aria-hidden="true">{group.icon}</span>
              {group.title}
            </h3>
            <ul>
              {group.items.map((entry) => (
                <Question key={entry.id} item={entry} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </AboutSection>
  )
}
