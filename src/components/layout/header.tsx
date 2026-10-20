import { useState } from "react"
import { Link } from "react-router"

import { Logo } from "@/components/common/logo"
import {
  ArrowLeftIcon,
  ListIcon,
  MagnifyingGlassIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { useT } from "@/lib/i18n"
import { useSettings } from "@/stores/settings"
import { OrgSelector } from "./org-selector"
import { SearchBar } from "./search-bar"
import { UserMenu } from "./user-menu"

const HOME_PATHS = {
  home: "/",
  favorites: "/favorites",
  multiview: "/multiview",
} as const

export function Header() {
  const { t } = useT()
  const { toggleSidebar } = useSidebar()
  const defaultOpen = useSettings((s) => s.defaultOpen)
  const [mobileSearch, setMobileSearch] = useState(false)

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
            <SearchBar autoFocus onCommit={() => setMobileSearch(false)} />
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
                  Holo<span className="text-brand">dex</span>
                </span>
              </Link>
              <OrgSelector />
            </div>

            <div className="mx-auto hidden w-full max-w-xl min-w-0 md:mx-6 md:block">
              <SearchBar />
            </div>

            <div className="ml-auto flex shrink-0 items-center md:w-24 md:justify-end lg:w-40">
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
