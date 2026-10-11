import { Link, useLocation } from "react-router"
import { cn } from "cn"

import {
  HeartFillIcon,
  HeartIcon,
  HouseFillIcon,
  HouseIcon,
  PlaylistIcon,
  UsersThreeFillIcon,
  UsersThreeIcon,
} from "@/components/icons"
import { useT } from "@/lib/i18n"
import { queryClient } from "@/lib/queries"

/** Thumb-reach navigation for phones; the sidebar covers larger screens. */
export function BottomNav() {
  const { t } = useT()
  const location = useLocation()

  const items = [
    {
      label: t("component.mainNav.home"),
      to: "/",
      icon: <HouseIcon />,
      activeIcon: <HouseFillIcon />,
    },
    {
      label: t("component.mainNav.favorites"),
      to: "/favorites",
      icon: <HeartIcon />,
      activeIcon: <HeartFillIcon />,
    },
    {
      label: t("component.mainNav.channels"),
      to: "/channel",
      icon: <UsersThreeIcon />,
      activeIcon: <UsersThreeFillIcon />,
    },
    {
      label: t("component.mainNav.playlist"),
      to: "/playlists",
      icon: <PlaylistIcon />,
      activeIcon: <PlaylistIcon />,
    },
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-header pb-safe md:hidden">
      <ul className="flex h-14">
        {items.map((item) => {
          const active =
            item.to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.to)
          return (
            <li key={item.to} className="flex-1">
              <Link
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-0.5 text-[11px] outline-none focus-visible:bg-foreground/5 [&>svg]:size-5.5",
                  active ? "font-medium text-brand" : "text-muted-foreground"
                )}
                onClick={(event) => {
                  if (location.pathname !== item.to) return
                  event.preventDefault()
                  window.scrollTo({ top: 0, behavior: "smooth" })
                  void queryClient.invalidateQueries({ queryKey: ["live"] })
                }}
              >
                {active ? item.activeIcon : item.icon}
                <span className="max-w-full truncate px-1">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
