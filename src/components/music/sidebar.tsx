import type { ReactNode } from "react"
import { Link, useLocation } from "react-router"
import {
  HeartFillIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  MusicNotesFillIcon,
  MusicNotesIcon,
  PlaylistIcon,
  RadioIcon,
  StarIcon,
} from "@/components/icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  playlistHref,
  playlistTitle,
  useMusicLibrary,
} from "@/components/music/playlists/shared"
import { useT } from "@/lib/i18n"
import type { PlaylistStub } from "@/lib/musicdex/types"
import { isMusicLocation } from "@/lib/music-route"
import { useSettings } from "@/stores/settings"

function LibraryMenu({
  label,
  items,
  loading,
  error,
}: {
  label: string
  items: PlaylistStub[]
  loading: boolean
  error: boolean
}) {
  const { t } = useT()
  const { setOpenMobile } = useSidebar()
  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger render={<SidebarMenuButton tooltip={label} />}>
          <StarIcon />
          <span>{label}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" className="w-64">
          <DropdownMenuGroup>
            <DropdownMenuLabel>{label}</DropdownMenuLabel>
            {loading ? (
              <DropdownMenuItem disabled>
                {t("musicdex.sidebar.loading")}
              </DropdownMenuItem>
            ) : error ? (
              <DropdownMenuItem disabled>
                {t("musicdex.sidebar.loadFailed")}
              </DropdownMenuItem>
            ) : !items.length ? (
              <DropdownMenuItem disabled>
                {t("musicdex.sidebar.noItems")}
              </DropdownMenuItem>
            ) : (
              items.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  render={
                    <Link
                      to={playlistHref(item)}
                      onClick={() => setOpenMobile(false)}
                    />
                  }
                >
                  {playlistTitle(item)}
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuItem
              render={
                <Link to="/#playlists" onClick={() => setOpenMobile(false)} />
              }
            >
              {t("musicdex.sidebar.openLibrary")}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}

export function MusicSidebar() {
  const { t } = useT()
  const location = useLocation()
  const { setOpenMobile } = useSidebar()
  const mode = useSettings((state) => state.musicSidebarMode)
  const nav: {
    to: string
    label: string
    icon: ReactNode
    activeIcon?: ReactNode
  }[] = [
    {
      to: "/#music",
      label: "Musicdex",
      icon: <MusicNotesIcon />,
      activeIcon: <MusicNotesFillIcon />,
    },
    {
      to: "/music/search",
      label: t("musicdex.sidebar.searchMusic"),
      icon: <MagnifyingGlassIcon />,
    },
    {
      to: "/music/liked",
      label: t("musicdex.sidebar.likedSongs"),
      icon: <HeartIcon />,
      activeIcon: <HeartFillIcon />,
    },
    { to: "/#radio", label: t("musicdex.sidebar.radios"), icon: <RadioIcon /> },
    {
      to: "/#playlists",
      label: t("musicdex.sidebar.playlists"),
      icon: <PlaylistIcon />,
    },
  ]
  const homeHash = location.pathname === "/" ? location.hash : null
  const isActive = (to: string) => {
    if (to === "/#music") {
      return (
        homeHash === "#music" ||
        location.pathname === "/music" ||
        location.pathname.startsWith("/music/org/") ||
        location.pathname.startsWith("/music/browse/")
      )
    }
    if (to === "/#playlists") {
      return (
        homeHash === "#playlists" ||
        location.pathname.startsWith("/music/playlist/")
      )
    }
    if (to === "/#radio") {
      return (
        homeHash === "#radio" || location.pathname.startsWith("/music/radio/")
      )
    }
    return location.pathname === to
  }

  const inMusic =
    nav.some((item) => isActive(item.to)) || isMusicLocation(location)

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {mode === "menu" ? (
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger
                  openOnHover
                  render={
                    <SidebarMenuButton tooltip="Musicdex" isActive={inMusic} />
                  }
                >
                  {inMusic ? <MusicNotesFillIcon /> : <MusicNotesIcon />}
                  <span>Musicdex</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="right"
                  align="start"
                  className="w-56"
                >
                  <DropdownMenuGroup className={"space-y-1"}>
                    {nav.map(({ to, label, icon }) => (
                      <DropdownMenuItem
                        key={to}
                        className={isActive(to) ? "bg-accent text-accent-foreground cursor-pointer" : 'cursor-pointer'}
                        render={
                          <Link to={to} onClick={() => setOpenMobile(false)} />
                        }
                      >
                        {icon}
                        <span>{label}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ) : (
            nav.map(({ to, label, icon, activeIcon }) => (
              <SidebarMenuItem key={to}>
                <SidebarMenuButton
                  tooltip={label}
                  isActive={isActive(to)}
                  render={<Link to={to} onClick={() => setOpenMobile(false)} />}
                >
                  {isActive(to) ? (activeIcon ?? icon) : icon}
                  <span>{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
