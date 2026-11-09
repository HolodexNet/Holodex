import type { ReactNode } from "react"

import { CaretDownIcon, ShieldCheckIcon } from "@/components/icons"
import { useT } from "@/lib/i18n"
import { useResolvedMode } from "@/lib/theme/use-theme"
import { AboutSection, ExternalLink, textLink, withSlot } from "./shared"

function H4({ children }: { children: ReactNode }) {
  return <h4 className="mt-6 font-semibold text-foreground">{children}</h4>
}

function H5({ children }: { children: ReactNode }) {
  return <h5 className="mt-4 font-medium text-foreground">{children}</h5>
}

/**
 * The policy as published on holodex.net (revised August 2023 for social
 * logins). It is legal text, so it stays in English, as it always has.
 */
function PrivacyPolicy() {
  return (
    <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
      <p>
        This Privacy Policy governs the manner in which Holodex collects, uses,
        maintains, and discloses information collected from users (each, a
        "User") of the Holodex website ("Site"). This privacy policy applies to
        the Site and all products and services offered by Holodex.
      </p>

      <H4>Holodex First Party Information collection and usage:</H4>
      <p>
        We collect limited personal identification information from Users in a
        variety of ways, including, but not limited to, when Users visit our
        Site, register on the Site, fill out a form, and in connection with
        other activities, services, features or resources we make available on
        our Site.
      </p>
      <p>
        We will collect personal identification information from Users only if
        they voluntarily submit such information to us. Users can always refuse
        to supply personal identification information and use the Site without
        logging in.
      </p>
      <p>
        i) Information Access: When you log in using your social media account,
        we will only access the basic information required to facilitate your
        login. This typically includes your email address or social media
        handle. We will not retrieve or store any other personal data from your
        social media account. We will also store the minimum amount of ID or
        email handle used to distinctly link a Holodex account with a Social
        Media Account so we may facilitate future logins.
      </p>
      <p>
        ii) Limited Use: The information obtained from your social media account
        is solely for the purpose of allowing you to log into our service. We
        will not use this information for identification purposes outside of
        this function or share it with third parties without your explicit
        consent.
      </p>
      <p>
        iii) No Posting: We will not post any content to your social media
        accounts on your behalf or access your contacts, friends, or followers.
      </p>
      <p>
        iv) Revoking Access: You can revoke our access to your social media
        account at any time through your social media platform's settings.
        Revoking our access will not affect your account with us, but you may
        need to set up an alternative login method for our service.
      </p>
      <p>
        Changes to This Clause: Any changes to our social media login policy
        will be updated on this page. We recommend that you periodically review
        this clause for any changes.
      </p>

      <H4>Third Party Information collection and usage:</H4>
      <H5>1. Google Analytics</H5>
      <p>
        We use Google Analytics, a service provided by Google, Inc., to analyze
        our website traffic. Google Analytics utilizes cookies to track visitor
        interactions and collects information about how visitors use our site.
        This data might include your IP address, browser type, browser version,
        the pages of our site that you visit, the time and date of your visit,
        the time spent on those pages, and other statistics.
      </p>
      <p>
        The data collected is primarily used to report on website usage to help
        us understand our visitors' preferences and to enhance the user
        experience. Please refer to Google's privacy policy.
      </p>
      <H5>2. YouTube & Twitch Embeds</H5>
      <p>
        Our website may feature embedded videos from YouTube (owned by Google,
        Inc.) or Twitch (owned by Twitch Interactive, Inc.). When you watch
        these videos, these platforms may set cookies on your device and collect
        data such as your IP address, your browser type, and the page you
        visited on our site.
      </p>
      <p>We've added links below to their respective privacy policies.</p>
      <H5>Your Choices</H5>
      <p>
        You can control and limit the data that third-party services collect by
        using the respective settings in your browser or device and by
        consulting the privacy settings specific to each third-party service.
      </p>

      <H4>Contact Us about Privacy</H4>
      <p>
        If you have concerns about the data these third parties collect or wish
        to find out more about your data protection rights, we encourage you to
        visit their respective privacy policies.
      </p>
      <p>
        Your privacy is of paramount importance to us, and we are committed to
        ensuring the best standards are upheld. If you have any questions or
        concerns regarding our use of social media logins, please contact our
        team on discord.
      </p>
      <p className="flex flex-col gap-1 pt-1">
        <ExternalLink
          href="https://policies.google.com/privacy"
          className={textLink}
        >
          Google and Youtube Privacy Policy
        </ExternalLink>
        <ExternalLink
          href="https://www.twitch.tv/p/en/legal/privacy-notice/"
          className={textLink}
        >
          Twitch Privacy Policy
        </ExternalLink>
      </p>
    </div>
  )
}

export function FinePrint() {
  const { t, tl } = useT()
  const mode = useResolvedMode()
  const credits = tl("about.credits.contents")

  return (
    <AboutSection
      id="fine-print"
      eyebrow={t("about.nav.finePrint")}
      title={t("about.finePrint.title")}
    >
      <div className="grid gap-6 text-sm leading-relaxed text-muted-foreground md:grid-cols-[1fr_auto]">
        <div className="space-y-3">
          <p>
            {credits[3]}{" "}
            <ExternalLink
              href="https://en.hololive.tv/terms"
              className={textLink}
            >
              {credits[4]}
            </ExternalLink>
            .
          </p>
          <p>{t("about.general.summary.2")}</p>
          <p>
            {withSlot(
              t("about.finePrint.youtubeTos"),
              <ExternalLink
                href="https://www.youtube.com/t/terms"
                className={textLink}
              >
                {t("about.finePrint.youtubeTosLink")}
              </ExternalLink>
            )}
          </p>
        </div>
        <ExternalLink
          href="https://developers.google.com/youtube"
          className="self-start rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <img
            src={
              mode === "dark"
                ? "https://developers.google.com/static/youtube/images/developed-with-youtube-sentence-case-light.png"
                : "https://developers.google.com/static/youtube/images/developed-with-youtube-sentence-case-dark.png"
            }
            alt="Developed with YouTube"
            loading="lazy"
            className="h-auto w-56"
          />
        </ExternalLink>
      </div>

      <details
        id="privacy"
        className="group/privacy mt-6 scroll-mt-[calc(var(--header-height)+env(safe-area-inset-top,0px)+1.5rem)] rounded-2xl border bg-card"
      >
        <summary className="flex cursor-pointer list-none items-center gap-3 rounded-2xl px-5 py-4 font-semibold outline-none select-none focus-visible:ring-[3px] focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
          <ShieldCheckIcon className="size-5 text-brand" aria-hidden="true" />
          <span className="flex-1">{t("about.privacyPolicy")}</span>
          <CaretDownIcon
            aria-hidden="true"
            className="size-4 text-muted-foreground transition-transform duration-200 group-open/privacy:rotate-180 motion-reduce:transition-none"
          />
        </summary>
        <div className="border-t px-5 py-5">
          <PrivacyPolicy />
        </div>
      </details>
    </AboutSection>
  )
}
