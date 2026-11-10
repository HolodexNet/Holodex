import { useState } from "react"
import { Link, useLocation } from "react-router"

import { Logo, LogoOutline } from "@/components/common/logo"
import {
  ArrowLeftIcon,
  ListIcon,
  MagnifyingGlassIcon,
  MusicNotesFillIcon,
  PlayIcon,
  VideoCameraIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { MusicSearchBar } from "@/components/music/search-bar"
import { useT } from "@/lib/i18n"
import { isMusicLocation } from "@/lib/music-route"
import { useSettings } from "@/stores/settings"
import { SearchBar } from "./search-bar"
import { UserMenu } from "./user-menu"

const HOME_PATHS = {
  home: "/",
  favorites: "/favorites",
  multiview: "/multiview",
} as const

function SearchControl({
  music,
  autoFocus,
  onCommit,
}: {
  music: boolean
  autoFocus?: boolean
  onCommit?: () => void
}) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-1">
      <div
        role="group"
        aria-label="Search type"
        className="flex shrink-0 gap-0.5 rounded-2xl border border-input bg-background/60 p-0.5"
      >
        <Button
          variant={music ? "ghost" : "secondary"}
          size="icon-sm"
          render={
            <Link
              to="/search"
              aria-label="Video"
              title="Video"
              aria-current={!music ? "page" : undefined}
              onClick={onCommit}
            />
          }
        >
          <PlayIcon />
        </Button>
        <Button
          variant={music ? "secondary" : "ghost"}
          size="icon-sm"
          render={
            <Link
              to="/music/search"
              aria-label="Music"
              title="Music"
              aria-current={music ? "page" : undefined}
              onClick={onCommit}
            />
          }
        >
          <MusicNotesFillIcon />
        </Button>
      </div>
      {music ? (
        <MusicSearchBar autoFocus={autoFocus} onCommit={onCommit} />
      ) : (
        <SearchBar autoFocus={autoFocus} onCommit={onCommit} />
      )}
    </div>
  )
}

export function Header() {
  const { t } = useT()
  const { toggleSidebar } = useSidebar()
  const defaultOpen = useSettings((s) => s.defaultOpen)
  const [mobileSearch, setMobileSearch] = useState(false)
  const music = isMusicLocation(useLocation())

  return (
    <header className="sticky top-0 z-40 border-b bg-header pt-safe">
      {/* Decorative oversized outline mark bleeding off behind the brand. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <LogoOutline className="absolute top-1/2 left-24 h-[260%] -translate-y-1/2 -rotate-12 opacity-25 blur-[0.5px] drop-shadow-[0_0_10px_var(--primary)] sm:left-40 dark:opacity-30" />
      </div>
      <div className="relative flex h-(--header-height) items-center gap-1 px-2 sm:gap-2 sm:px-3">
        {mobileSearch ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("views.app.close_btn")}
              onClick={() => setMobileSearch(false)}
            >
              <ArrowLeftIcon className="size-5" />
            </Button>
            <SearchControl
              music={music}
              autoFocus
              onCommit={() => setMobileSearch(false)}
            />
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("component.mainNav.toggleSidebar")}
              onClick={toggleSidebar}
            >
              <ListIcon className="size-5" />
            </Button>

            <div className="flex min-w-0 items-center gap-2 sm:gap-3 md:max-w-[40%]">
              <Link
                to={HOME_PATHS[defaultOpen]}
                aria-label="holodex"
                className="flex shrink-0 items-center gap-2 rounded-lg p-1 outline-none focus-ring"
              >
                <Logo />
                <span className="hidden text-xl font-[750] tracking-tighter sm:inline">
                  holo<span className="text-brand">dex.</span>
                </span>
              </Link>
            </div>

            <div className="ml-auto hidden max-w-xl min-w-0 flex-1 md:block">
              <SearchControl music={music} />
            </div>

            <div className="ml-auto flex shrink-0 items-center md:ml-0">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label={t("component.search.searchLabel")}
                onClick={() => setMobileSearch(true)}
              >
                <MagnifyingGlassIcon className="size-5" />
              </Button>
              <UserMenu />
            </div>
          </>
        )}
      </div>
    </header>
  )
}
