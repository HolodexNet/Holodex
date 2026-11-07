import { useEffect, useRef, type ReactNode } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router"
import { cn } from "cn"

import { BroadcastIcon, MagnifyingGlassIcon } from "@/components/icons"
import { MusicdexLogo } from "@/components/music/page-header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useT } from "@/lib/i18n"

export type HomeTab =
  "live" | "archive" | "clips" | "music" | "radio" | "playlists"

export const TAB_BY_HASH: Record<string, HomeTab> = {
  "#archive": "archive",
  "#clips": "clips",
  "#music": "music",
  "#radio": "radio",
  "#playlists": "playlists",
}

/**
 * Phones keep the compact tabs. On desktop each tab stands on the toolbar's
 * border, so hovering lights up a tab shape and previews its underline.
 */
const tabTriggerClass = cn(
  "flex-none px-1",
  "md:h-[calc(100%-0.375rem)] md:self-end md:rounded-t-lg md:rounded-b-none md:px-2.5 md:pt-0 md:pb-1.5 md:text-[13px] md:font-[550] md:after:bg-primary md:group-data-horizontal/tabs:after:-bottom-px md:focus-visible:ring-inset xl:px-3",
  "md:hover:not-data-active:bg-muted/60 md:hover:not-data-active:after:opacity-40"
)

function CountBadge({
  value,
  live = false,
}: {
  value?: number
  live?: boolean
}) {
  return (
    <span
      className={
        live && value
          ? "min-w-5 rounded-md bg-live px-1 text-center text-xs leading-5 font-medium text-white tabular-nums"
          : "min-w-5 rounded-md bg-muted px-1 text-center text-xs leading-5 font-medium text-muted-foreground tabular-nums"
      }
    >
      {value ?? "–"}
    </span>
  )
}

export function MusicSearchLink() {
  const active = useLocation().pathname === "/music/search"
  return (
    <Button
      variant={active ? "secondary" : "ghost"}
      size="icon"
      nativeButton={false}
      aria-label="Search music"
      aria-current={active ? "page" : undefined}
      title="Search music"
      render={<Link to="/music/search" />}
    >
      <MagnifyingGlassIcon />
    </Button>
  )
}

/**
 * The header shared by the home and favorites tabs and every /music/* page.
 * Counts stay undefined where the live feed isn't loaded, so nothing claims 0.
 */
export function HomeTabsLayout({
  tab,
  liveCount,
  upcomingCount,
  controls,
  children,
}: {
  tab: HomeTab
  liveCount?: number
  upcomingCount?: number
  controls: ReactNode
  children: ReactNode
}) {
  const { t } = useT()
  const location = useLocation()
  const navigate = useNavigate()
  const toolbarRef = useRef<HTMLDivElement>(null)
  const tabListRef = useRef<HTMLDivElement>(null)

  // The toolbar starts at the top of the page, so any scrolling sticks it. The
  // attribute is set directly so that scrolling never re-renders the page.
  useEffect(() => {
    const toolbar = toolbarRef.current
    if (!toolbar) return
    const update = () =>
      toolbar.toggleAttribute("data-stuck", window.scrollY > 8)
    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [])

  // On phones the tab strip scrolls, and a link can land on a tab past its edge.
  useEffect(() => {
    const list = tabListRef.current
    const active = list?.querySelector("[data-active]")
    if (!list || !active) return
    const listBox = list.getBoundingClientRect()
    const activeBox = active.getBoundingClientRect()
    // scrollBy moves only the strip; scrollIntoView could move the page too.
    list.scrollBy({
      left:
        activeBox.left - listBox.left - (listBox.width - activeBox.width) / 2,
    })
  }, [tab])

  const onHome = ["/", "/favorites"].includes(location.pathname)
  const tabProps = (value: HomeTab) => ({
    value,
    className: tabTriggerClass,
    // Not onValueChange: on a music page the highlighted tab must still lead
    // back to its list, and Tabs only reports changes.
    onClick: () => {
      window.scrollTo({ top: 0 })
      const hash = value === "live" ? "" : value
      if (onHome) {
        void navigate({ search: location.search, hash }, { replace: true })
      } else {
        void navigate({ pathname: "/", hash })
      }
    },
  })

  // "Live / Upcoming" is one translated string; split it to place the counts.
  const [, liveLabel, upcomingLabel] =
    /^(.+?)\s*([/／・].+)$/.exec(t("views.home.liveOrUpcomingHeading")) ?? []

  return (
    <div className="flex flex-1 flex-col px-3 pb-10 md:px-8">
      {/* The margin makes up for the height lost when stuck, so the page below
          doesn't move and short pages can't bounce between the two sizes. */}
      <div
        ref={toolbarRef}
        className="group/toolbar sticky top-[calc(var(--header-height)+env(safe-area-inset-top,0px))] z-30 -mx-3 flex items-center border-b border-border/50 bg-background/95 px-3 backdrop-blur-md md:-mx-8 md:border-border md:px-8 md:transition-[margin-bottom] md:duration-200 md:data-stuck:mb-5 md:motion-reduce:transition-none"
      >
        <Tabs value={tab} className="-ml-3 min-w-0 flex-1 md:-ml-3.5 xl:-ml-4">
          <TabsList
            ref={tabListRef}
            variant="line"
            className="h-11! w-full scrollbar-none justify-start gap-2 overflow-x-auto overflow-y-hidden pl-0 sm:w-fit sm:gap-3 md:h-16! md:gap-1 md:py-0 md:pl-0.75 md:transition-[height] md:duration-200 md:group-data-stuck/toolbar:h-11! md:motion-reduce:transition-none"
          >
            <TabsTrigger {...tabProps("live")}>
              <BroadcastIcon className="size-4 text-brand" />
              {liveLabel ?? t("views.home.liveOrUpcomingHeading")}
              <CountBadge value={liveCount} live />
              {upcomingLabel}
              {upcomingLabel && <CountBadge value={upcomingCount} />}
            </TabsTrigger>
            <TabsTrigger {...tabProps("archive")}>
              {t("views.home.recentVideoToggles.official")}
            </TabsTrigger>
            <TabsTrigger {...tabProps("clips")}>
              {t("views.home.recentVideoToggles.subber")}
            </TabsTrigger>
            <span
              aria-hidden
              className="mx-1 h-5 w-px flex-none bg-foreground/30 md:mx-2 md:h-7"
            />
            <TabsTrigger {...tabProps("music")} aria-label="Musicdex">
              {/* Centered larger text sits lower; lift it onto the labels' baseline. */}
              <MusicdexLogo className="text-[15px] md:-translate-y-px md:text-[16px] xl:-translate-y-0.5 xl:text-[18px]" />
            </TabsTrigger>
            <TabsTrigger {...tabProps("radio")}>Radio</TabsTrigger>
            <TabsTrigger {...tabProps("playlists")}>Playlists</TabsTrigger>
          </TabsList>
        </Tabs>
        {controls}
      </div>
      <div className="flex flex-1 flex-col pt-6 md:pt-9">{children}</div>
    </div>
  )
}

/** Route layout for the /music/* pages, which live outside the home page. */
export function MusicPageLayout() {
  const { pathname } = useLocation()
  const tab = pathname.startsWith("/music/radio/")
    ? "radio"
    : pathname.startsWith("/music/playlist/")
      ? "playlists"
      : "music"
  return (
    <HomeTabsLayout tab={tab} controls={<MusicSearchLink />}>
      <Outlet />
    </HomeTabsLayout>
  )
}
