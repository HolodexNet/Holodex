import { toast } from "sonner"

import {
  BookmarkSimpleIcon,
  CheckIcon,
  LogoGithubIcon,
  PuzzlePieceIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { useT } from "@/lib/i18n"
import { AboutSection, ExternalLink } from "./shared"
import { cn } from "cn"
import { cardVariants } from "@/components/ui/card"

const HOLODEX_PLUS = {
  chrome:
    "https://chrome.google.com/webstore/detail/holodex-plus/mjcecbpccklceljomllkhilglcdcncbh",
  firefox: "https://addons.mozilla.org/firefox/addon/holodex-plus/",
  github: "https://github.com/HolodexNet/Holodex-Plus",
}

const RAYCAST = {
  store: "https://www.raycast.com/uetchy/holodex",
  github: "https://github.com/HolodexNet/raycast-holodex",
}

/** Opens the YouTube video on the current tab (watch, shorts or live URL). */
function bookmarklet(host: string): string {
  return `javascript:!function(){let t=new URL(window.location);if(t.hostname.includes('youtube')){let a=t.searchParams.get('v')||(t.pathname.includes('/shorts/')?t.pathname.replace('/shorts/',''):t.pathname.includes('/live/')?t.pathname.replace('/live/',''):null);if(!a)return;t.searchParams.delete('v');window.location='https://${host}/watch/'+a+'?'+t.searchParams.toString()}}();`
}

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-sm">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <CheckIcon
            className="mt-0.5 size-4 shrink-0 text-brand"
            aria-hidden="true"
          />
          <span className="text-pretty">{item}</span>
        </li>
      ))}
    </ul>
  )
}

function Bookmarklet({ host, label }: { host: string; label: string }) {
  const { t } = useT()
  return (
    <a
      // React refuses javascript: URLs as props, so the href is set directly.
      ref={(el) => el?.setAttribute("href", bookmarklet(host))}
      onClick={(event) => {
        event.preventDefault()
        toast(t("about.bookmarklet.clickHint"))
      }}
      title={t("about.bookmarklet.dragHint")}
      draggable
      className="group inline-flex cursor-grab items-center gap-2 rounded-full border-2 border-dashed border-primary/50 bg-primary/8 px-4 py-2 text-sm font-semibold text-brand focus-ring transition-colors outline-none hover:border-primary hover:bg-primary/12 active:cursor-grabbing"
    >
      <BookmarkSimpleIcon className="size-4" aria-hidden="true" />
      {label}
    </a>
  )
}

export function Extras() {
  const { t, tl } = useT()

  return (
    <AboutSection
      id="extras"
      title={t("about.extensions.heading")}
      description={t("about.extensions.description")}
    >
      <article
        className={cn(
          cardVariants({ radius: "3xl" }),
          "grid overflow-hidden md:grid-cols-[1.1fr_1fr]"
        )}
      >
        <div className="bg-muted/50 p-4 md:p-6">
          <img
            src="/img/holodex-plus/holodex-plus-screenshot.webp"
            alt=""
            width={1170}
            height={660}
            loading="lazy"
            decoding="async"
            className="h-auto w-full rounded-xl border shadow-sm"
          />
        </div>
        <div className="flex flex-col gap-4 p-5 md:p-6">
          <h3 className="flex items-center gap-3 text-xl font-bold tracking-tight">
            <img
              src="/img/holodex-plus/holodex-plus-icon.png"
              alt=""
              width={36}
              height={36}
              className="size-9 rounded-lg"
            />
            {t("views.extension.title")}
          </h3>
          <FeatureList
            items={[
              t("views.extension.featureset.one"),
              t("views.extension.featureset.two"),
              t("views.extension.featureset.three"),
              t("views.extension.featureset.four"),
            ]}
          />
          <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
            <ExternalLink
              href={HOLODEX_PLUS.chrome}
              title="Chrome Web Store"
              className="rounded-lg focus-ring outline-none"
            >
              <img
                src="/img/holodex-plus/chrome-webstore.png"
                alt="Chrome Web Store"
                width={206}
                height={58}
                className="h-11 w-auto rounded-lg"
              />
            </ExternalLink>
            <ExternalLink
              href={HOLODEX_PLUS.firefox}
              title="Firefox Add-ons"
              className="rounded-lg focus-ring outline-none"
            >
              <img
                src="/img/holodex-plus/firefox-amo.png"
                alt="Firefox Add-ons"
                width={172}
                height={60}
                className="h-11 w-auto rounded-lg"
              />
            </ExternalLink>
            <Button
              variant="outline"
              size="lg"
              nativeButton={false}
              render={<ExternalLink href={HOLODEX_PLUS.github} />}
            >
              <LogoGithubIcon data-icon="inline-start" />
              {t("about.extensions.github")}
            </Button>
          </div>
        </div>
      </article>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <article
          className={cn(
            cardVariants({ radius: "3xl", padding: "lg" }),
            "flex flex-col gap-4"
          )}
        >
          <h3 className="flex items-center gap-3 text-lg font-bold tracking-tight">
            <span
              aria-hidden="true"
              className="flex size-9 items-center justify-center rounded-lg bg-[#ff6363] text-white"
            >
              <PuzzlePieceIcon className="size-5" />
            </span>
            {t("about.extensions.raycast")}
          </h3>
          <FeatureList items={tl("views.extension.raycast.features")} />
          <div className="mt-auto flex flex-wrap gap-2 pt-2">
            <Button
              nativeButton={false}
              render={<ExternalLink href={RAYCAST.store} />}
            >
              {t("about.extensions.raycastStore")}
            </Button>
            <Button
              variant="outline"
              nativeButton={false}
              render={<ExternalLink href={RAYCAST.github} />}
            >
              <LogoGithubIcon data-icon="inline-start" />
              GitHub
            </Button>
          </div>
        </article>

        <article
          className={cn(
            cardVariants({ radius: "3xl", padding: "lg" }),
            "flex flex-col gap-4"
          )}
        >
          <h3 className="flex items-center gap-3 text-lg font-bold tracking-tight">
            <span
              aria-hidden="true"
              className="flex size-9 items-center justify-center rounded-lg bg-primary/12 text-brand"
            >
              <BookmarkSimpleIcon className="size-5" />
            </span>
            {t("about.bookmarklet.title")}
          </h3>
          <p className="text-sm text-pretty text-muted-foreground">
            {t("about.bookmarklet.description")}
          </p>
          <div className="mt-auto flex flex-wrap gap-2 pt-2">
            <Bookmarklet
              host="holodex.net"
              label={t("about.bookmarklet.open")}
            />
            <Bookmarklet
              host="staging.holodex.net"
              label={t("about.bookmarklet.openBeta")}
            />
          </div>
        </article>
      </div>
    </AboutSection>
  )
}
