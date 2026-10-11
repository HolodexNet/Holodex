import { useMemo, useState, type MouseEvent, type ReactNode } from "react"
import { Link, useLocation } from "react-router"
import { cn } from "cn"

import { ChannelAvatar } from "@/components/common/channel-avatar"
import {
  CaretDownIcon,
  CoffeeIcon,
  FilesIcon,
  GearSixFillIcon,
  GearSixIcon,
  GlobeIcon,
  HeartFillIcon,
  HeartIcon,
  HouseFillIcon,
  HouseIcon,
  KeyboardIcon,
  LogoTwitterIcon,
  NotePencilIcon,
  PlaylistIcon,
  QuestionIcon,
  RobotIcon,
  SquaresFourIcon,
  UsersThreeFillIcon,
  UsersThreeIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { useNowMinutes } from "@/hooks/use-now"
import { musicdexURL, UI_LANGS } from "@/lib/consts"
import { useT } from "@/lib/i18n"
import {
  queryClient,
  useFavorites,
  useFavoritesLive,
} from "@/lib/queries"
import { formatAbsolute, formatShortDistance } from "@/lib/time"
import type { ChannelSummary, Video } from "@/lib/types"
import { channelName } from "@/lib/video"
import { useAuth } from "@/stores/auth"
import { useOrgStore } from "@/stores/org"
import { useSettings } from "@/stores/settings"

interface NavItem {
  label: string
  to: string
  icon: ReactNode
  activeIcon?: ReactNode
  external?: boolean
}

function MusicdexIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        className="fill-primary"
        d="M4.5 2a2 2 0 0 1 3-1.7L23 9.6a2 2 0 0 1 0 3.5L7.6 22.4a2 2 0 0 1-3-1.7V2Z"
      />
      <path
        className="fill-complement"
        d="M0 2A2 2 0 0 1 3 .3l15.5 9.3a2 2 0 0 1 0 3.5L3.1 22.4A2 2 0 0 1 0 20.7V2Z"
      />
    </svg>
  )
}

/** Scrolls up and refreshes when the page you are already on is clicked. */
function refreshCurrentPage() {
  window.scrollTo({ top: 0, behavior: "smooth" })
  void queryClient.invalidateQueries({ queryKey: ["live"] })
  void queryClient.invalidateQueries({ queryKey: ["videos"] })
}

function NavList({ items }: { items: NavItem[] }) {
  const location = useLocation()
  const { setOpenMobile } = useSidebar()

  return (
    <SidebarMenu>
      {items.map((item) => {
        const path = item.to.split("?")[0]
        const active =
          !item.external &&
          (path === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(path))
        const onClick = (event: MouseEvent) => {
          setOpenMobile(false)
          if (location.pathname === path) {
            event.preventDefault()
            refreshCurrentPage()
          }
        }
        return (
          <SidebarMenuItem key={item.to}>
            <SidebarMenuButton
              isActive={active}
              tooltip={item.label}
              className={cn(active && "text-brand!")}
              render={
                item.external ? (
                  <a href={item.to} target="_blank" rel="noopener noreferrer" />
                ) : (
                  <Link to={item.to} onClick={onClick} />
                )
              }
            >
              {active ? (item.activeIcon ?? item.icon) : item.icon}
              <span>{item.label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}

interface FavoriteEntry {
  channel: ChannelSummary
  video?: Video
  /** Set when the favorite is a guest on someone else's stream. */
  host?: ChannelSummary
}

function useFavoriteEntries(): FavoriteEntry[] {
  const { favorites } = useFavorites()
  const live = useFavoritesLive()
  const blocked = useSettings((s) => s.blockedChannels)
  const preferEnglish = useSettings((s) => s.useEnglishName)

  return useMemo(() => {
    const favoriteIds = new Set(favorites.map((f) => f.id))
    const blockedIds = new Set(blocked.map((c) => c.id))
    const streaming = new Map<string, FavoriteEntry>()
    const videos = live.data ?? []

    // The list is sorted by start time, so the first hit is the next stream.
    for (const video of videos) {
      const id = video.channel.id
      if (favoriteIds.has(id) && !streaming.has(id)) {
        streaming.set(id, { channel: video.channel, video })
      }
    }
    for (const video of videos) {
      if (blockedIds.has(video.channel.id)) continue
      for (const mention of video.mentions ?? []) {
        if (
          favoriteIds.has(mention.id) &&
          !streaming.has(mention.id) &&
          !blockedIds.has(mention.id)
        ) {
          streaming.set(mention.id, {
            channel: mention,
            video,
            host: video.channel,
          })
        }
      }
    }

    const idle = favorites
      .filter((f) => !streaming.has(f.id))
      .sort((a, b) =>
        channelName(a, preferEnglish).localeCompare(channelName(b, preferEnglish))
      )
      .map((channel) => ({ channel }))

    return [...streaming.values(), ...idle]
  }, [favorites, live.data, blocked, preferEnglish])
}

const COLLAPSED_FAVORITES = 8

function FavoritesSection() {
  const { t, lang } = useT()
  const now = useNowMinutes()
  const location = useLocation()
  const { setOpenMobile } = useSidebar()
  const loggedIn = useAuth((s) => !!s.jwt)
  const preferEnglish = useSettings((s) => s.useEnglishName)
  const entries = useFavoriteEntries()
  const [expanded, setExpanded] = useState(false)

  const visible =
    expanded || entries.length <= COLLAPSED_FAVORITES
      ? entries
      : entries.slice(0, COLLAPSED_FAVORITES)

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("component.mainNav.favorites")}</SidebarGroupLabel>
      <SidebarGroupContent>
        {entries.length === 0 ? (
          <div className="flex flex-col items-start gap-2 px-3 pb-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
            {loggedIn
              ? t("views.channels.favoritesAreEmpty")
              : t("views.app.loginCallToAction")}
            <Button
              nativeButton={false}
              variant="outline"
              size="sm"
              render={<Link
                  to={loggedIn ? "/channel" : "/login"}
                  onClick={() => setOpenMobile(false)}
                />
              }
            >
              {loggedIn
                ? t("views.favorites.manageFavorites")
                : t("component.mainNav.login")}
            </Button>
          </div>
        ) : (
          <SidebarMenu>
            {visible.map(({ channel, video, host }) => {
              const isLive = video?.status === "live"
              const name = channelName(channel, preferEnglish)
              const to = `/channel/${channel.id}`
              return (
                <SidebarMenuItem key={`${channel.id}${video?.id ?? ""}`}>
                  <SidebarMenuButton
                    isActive={location.pathname.startsWith(to)}
                    tooltip={name}
                    className="group-data-[collapsible=icon]:p-0.5!"
                    render={<Link to={to} onClick={() => setOpenMobile(false)} />}
                  >
                    <ChannelAvatar
                      channel={channel}
                      size={24}
                      live={isLive}
                      className={cn(isLive && "ring-offset-1")}
                    />
                    <span className="flex-1">{name}</span>
                    {video?.available_at && (
                      <time
                        dateTime={new Date(video.available_at).toISOString()}
                        title={formatAbsolute(video.available_at, lang)}
                        className={cn(
                          "flex shrink-0 items-center gap-1 text-xs tabular-nums",
                          isLive
                            ? "font-medium text-live"
                            : "text-muted-foreground"
                        )}
                      >
                        {host && <ChannelAvatar channel={host} size={16} />}
                        {formatShortDistance(video.available_at, now)}
                      </time>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
            {entries.length > COLLAPSED_FAVORITES && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="text-muted-foreground"
                  tooltip={
                    expanded
                      ? t("views.favorites.close")
                      : t("views.favorites.showall")
                  }
                  onClick={() => setExpanded(!expanded)}
                >
                  <CaretDownIcon
                    className={cn("transition-transform", expanded && "rotate-180")}
                  />
                  <span>
                    {expanded
                      ? t("views.favorites.close")
                      : t("views.favorites.showall")}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function AppSidebar() {
  const { t } = useT()
  const orgName = useOrgStore((s) => s.currentOrg.name)
  const lang = useSettings((s) => s.lang)
  const [showTools, setShowTools] = useState(false)

  const main: NavItem[] = [
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
      to: `/channel?${new URLSearchParams({ org: orgName })}`,
      icon: <UsersThreeIcon />,
      activeIcon: <UsersThreeFillIcon />,
    },
    {
      label: t("component.mainNav.playlist"),
      to: "/playlists",
      icon: <PlaylistIcon />,
    },
  ]
  const apps: NavItem[] = [
    {
      label: t("component.mainNav.multiview"),
      to: "/multiview",
      icon: <SquaresFourIcon />,
    },
    { label: "Musicdex", to: musicdexURL, icon: <MusicdexIcon />, external: true },
  ]
  const site: NavItem[] = [
    { label: t("component.mainNav.about"), to: "/about", icon: <QuestionIcon /> },
    {
      label: t("component.mainNav.settings"),
      to: "/settings",
      icon: <GearSixIcon />,
      activeIcon: <GearSixFillIcon />,
    },
  ]
  const tools: NavItem[] = [
    { label: "TL Client", to: "/tlclient", icon: <KeyboardIcon /> },
    { label: "Script Editor", to: "/scripteditor", icon: <NotePencilIcon /> },
    { label: "Script Manager", to: "/scriptmanager", icon: <FilesIcon /> },
    { label: "Relay Bot Setting", to: "/relaybot", icon: <RobotIcon /> },
  ]

  return (
    <Sidebar
      collapsible="icon"
      className="top-[calc(var(--header-height)+env(safe-area-inset-top,0px))] h-[calc(100svh-var(--header-height)-env(safe-area-inset-top,0px))]!"
    >
      <SidebarContent className="gap-0">
        <SidebarGroup>
          <SidebarGroupContent>
            <NavList items={main} />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator className="mx-0" />
        <SidebarGroup>
          <SidebarGroupContent>
            <NavList items={apps} />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator className="mx-0" />
        <SidebarGroup>
          <SidebarGroupContent>
            <NavList items={site} />
            {showTools && <NavList items={tools} />}
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  size="sm"
                  className="text-muted-foreground"
                  aria-expanded={showTools}
                  tooltip={
                    showTools
                      ? t("component.description.showLess")
                      : t("component.description.showMore")
                  }
                  onClick={() => setShowTools(!showTools)}
                >
                  <CaretDownIcon
                    className={cn("transition-transform", showTools && "rotate-180")}
                  />
                  <span>
                    {showTools
                      ? t("component.description.showLess")
                      : t("component.description.showMore")}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator className="mx-0" />
        <FavoritesSection />
      </SidebarContent>

      <SidebarFooter className="flex-row items-center gap-1 border-t px-3 py-1.5 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
        <a
          href="https://twitter.com/holodex"
          target="_blank"
          rel="noopener noreferrer"
          title="Twitter"
          className="rounded-md p-1 hover:text-foreground"
        >
          <LogoTwitterIcon className="size-4" />
        </a>
        <a
          href="https://ko-fi.com/holodex"
          target="_blank"
          rel="noopener noreferrer"
          title="Support Holodex (Ko-fi)"
          className="rounded-md p-1 hover:text-foreground"
        >
          <CoffeeIcon className="size-4" />
        </a>
        <span className="shrink-0">© Holodex</span>
        <Link
          to="/settings"
          className="ml-auto flex min-w-0 items-center gap-1 rounded-md p-1 hover:text-foreground"
        >
          <GlobeIcon className="size-3.5 shrink-0" />
          <span className="truncate">
            {UI_LANGS.find((l) => l.val === lang)?.display ?? "English"}
          </span>
        </Link>
      </SidebarFooter>
    </Sidebar>
  )
}
