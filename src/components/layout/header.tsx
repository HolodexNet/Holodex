import { useState } from "react"
import { Link, useLocation } from "react-router"

import { Logo } from "@/components/common/logo"
import {
  ArrowLeftIcon,
  ListIcon,
  MagnifyingGlassIcon,
  MusicalNotesIcon,
  VideoCameraIcon,
  CaretDownIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSidebar } from "@/components/ui/sidebar"
import { MusicSearchBar } from "@/components/music/search-bar"
import { useT } from "@/lib/i18n"
import { isMusicPath } from "@/lib/music-route"
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
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Search scope: ${music ? "Musicdex" : "Holodex videos"}`}
          render={<Button variant="ghost" size="sm" className="gap-1 px-2" />}
        >
          {music ? <MusicalNotesIcon /> : <VideoCameraIcon />}
          <span className="hidden text-xs lg:inline">
            {music ? "Music" : "Videos"}
          </span>
          <CaretDownIcon className="size-3" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem render={<Link to="/search" onClick={onCommit} />}>
            <VideoCameraIcon /> Holodex Video Search
          </DropdownMenuItem>
          <DropdownMenuItem
            render={<Link to="/music/search" onClick={onCommit} />}
          >
            <MusicalNotesIcon /> Musicdex Search
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
  const music = isMusicPath(useLocation().pathname)

  return (
    <header className="sticky top-0 z-40 border-b bg-header pt-safe">
      <div className="flex h-(--header-height) items-center gap-1 px-2 sm:gap-2 sm:px-3">
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
                aria-label="Holodex"
                className="flex shrink-0 items-center gap-2 rounded-lg p-1 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <Logo />
                <span className="hidden text-xl font-medium tracking-tight sm:inline">
                  Holo<span className="text-brand">dex.</span>
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
