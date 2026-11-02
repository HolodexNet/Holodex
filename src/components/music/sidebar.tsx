import { Link, useLocation } from "react-router"
import {
  HeartIcon,
  MagnifyingGlassIcon,
  MusicalNotesIcon,
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
import type { PlaylistStub } from "@/lib/musicdex/types"

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
              <DropdownMenuItem disabled>Loading…</DropdownMenuItem>
            ) : error ? (
              <DropdownMenuItem disabled>Could not load items</DropdownMenuItem>
            ) : !items.length ? (
              <DropdownMenuItem disabled>No items yet</DropdownMenuItem>
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
                <Link
                  to="/music/playlists"
                  onClick={() => setOpenMobile(false)}
                />
              }
            >
              Open music library
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}

export function MusicSidebar() {
  const location = useLocation()
  const { setOpenMobile } = useSidebar()
  const nav = [
    { to: "/#music", label: "Musicdex", icon: <MusicalNotesIcon /> },
    {
      to: "/music/search",
      label: "Search music",
      icon: <MagnifyingGlassIcon />,
    },
    { to: "/music/liked", label: "Liked songs", icon: <HeartIcon /> },
    { to: "/music/radios", label: "Radios", icon: <RadioIcon /> },
    {
      to: "/music/playlists",
      label: "Musicdex Playlists",
      icon: <PlaylistIcon />,
    },
  ]
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {nav.map(({ to, label, icon }) => (
            <SidebarMenuItem key={to}>
              <SidebarMenuButton
                tooltip={label}
                isActive={
                  location.pathname === to ||
                  (to === "/music" &&
                    (location.pathname.startsWith("/music/org/") ||
                      location.pathname.startsWith("/music/browse/"))) ||
                  (to === "/music/playlists" &&
                    location.pathname.startsWith("/music/playlist/")) ||
                  (to === "/music/radios" &&
                    location.pathname.startsWith("/music/radio/"))
                }
                render={<Link to={to} onClick={() => setOpenMobile(false)} />}
              >
                {icon}
                <span>{label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
