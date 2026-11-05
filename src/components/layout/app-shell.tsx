import { lazy, Suspense, useState, type CSSProperties } from "react"
import { Outlet, useLocation } from "react-router"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { SelectionActionHost } from "@/components/selection/action-dialog-host"
import { SelectionTray } from "@/components/selection/selection-tray"
import { QuickEditHost } from "@/components/video-edit/quick-edit"
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

/** The header, sidebar and everything else around an ordinary page. */
export function AppShell() {
  const location = useLocation()
  const sidebarOpen = useUi((s) => s.sidebarOpen)
  const setSidebarOpen = useUi((s) => s.setSidebarOpen)
  const hasMusic = useMusicPlayer((s) => !!s.current)
  // Stays mounted after the first song so the player can animate its own exit.
  const [playerLoaded, setPlayerLoaded] = useState(hasMusic)
  if (hasMusic && !playerLoaded) setPlayerLoaded(true)

  return (
    <SidebarProvider
      open={sidebarOpen}
      data-music-playing={hasMusic || undefined}
      onOpenChange={setSidebarOpen}
      className={location.pathname === "/" ? "home-shell flex-col" : "flex-col"}
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
      {playerLoaded && (
        <Suspense fallback={null}>
          <MusicPlayer />
        </Suspense>
      )}
      <SelectionTray />
      <SelectionActionHost />
      <QuickEditHost />
    </SidebarProvider>
  )
}
