import { lazy, Suspense, useEffect, type CSSProperties } from "react"
import { Outlet, ScrollRestoration, useLocation } from "react-router"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SelectionActionHost } from "@/components/selection/action-dialog-host"
import { SelectionTray } from "@/components/selection/selection-tray"
import { api } from "@/lib/api"
import { setLanguage } from "@/lib/i18n"
import { ThemeSync } from "@/lib/theme/use-theme"
import { useAuth } from "@/stores/auth"
import { useSettings } from "@/stores/settings"
import { useUi } from "@/stores/ui"
import { useMusicPlayer } from "@/stores/music-player"
import { AppSidebar } from "./app-sidebar"
import { BottomNav } from "./bottom-nav"
import { Header } from "./header"

const MusicPlayer = lazy(() =>
  import("@/components/music/player").then((module) => ({
    default: module.MusicPlayer,
  }))
)

/** Confirms a stored login is still valid and picks up role changes. */
function useSessionRefresh() {
  useEffect(() => {
    if (!useAuth.getState().jwt) return
    const controller = new AbortController()
    api
      .refreshSession(controller.signal)
      .then((session) => {
        if (session?.jwt && session.user) useAuth.getState().setSession(session)
      })
      // A rejected token already logged the user out; anything else (offline,
      // server down) should leave the session alone.
      .catch(() => {})
    return () => controller.abort()
  }, [])
}

export function AppShell() {
  const location = useLocation()
  const lang = useSettings((s) => s.lang)
  const sidebarOpen = useUi((s) => s.sidebarOpen)
  const setSidebarOpen = useUi((s) => s.setSidebarOpen)
  const hasMusic = useMusicPlayer((s) => !!s.current)

  useSessionRefresh()

  useEffect(
    () =>
      useAuth.subscribe((session, previous) => {
        if (previous.user && session.user?.id !== previous.user.id)
          useMusicPlayer.getState().close()
      }),
    []
  )

  useEffect(() => {
    void setLanguage(lang)
  }, [lang])

  return (
    <TooltipProvider delay={300}>
      <ThemeSync />
      <SidebarProvider
        open={sidebarOpen}
        data-music-playing={hasMusic || undefined}
        onOpenChange={setSidebarOpen}
        className={
          location.pathname === "/" ? "home-shell flex-col" : "flex-col"
        }
        style={
          {
            "--sidebar-width": "15rem",
            "--sidebar-width-icon": "4rem",
          } as CSSProperties
        }
      >
        <Header />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset className="min-w-0 pb-[calc(var(--music-player-height,0px)+3.5rem+env(safe-area-inset-bottom,0px))] md:pb-[var(--music-player-height,0px)]">
            <Outlet />
          </SidebarInset>
        </div>
        <BottomNav />
        {hasMusic && (
          <Suspense fallback={null}>
            <MusicPlayer />
          </Suspense>
        )}
        <SelectionTray />
        <SelectionActionHost />
        <Toaster
          position="bottom-center"
          offset={{ bottom: hasMusic ? "6.5rem" : "1.5rem" }}
          mobileOffset={{
            bottom: `calc(${hasMusic ? "9rem" : "4.5rem"} + env(safe-area-inset-bottom,0px))`,
          }}
        />
      </SidebarProvider>
      <ScrollRestoration />
    </TooltipProvider>
  )
}
