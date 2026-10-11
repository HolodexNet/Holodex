import { useEffect, type CSSProperties } from "react"
import { Outlet, ScrollRestoration } from "react-router"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { api } from "@/lib/api"
import { setLanguage } from "@/lib/i18n"
import { ThemeSync } from "@/lib/theme/use-theme"
import { useAuth } from "@/stores/auth"
import { useSettings } from "@/stores/settings"
import { useUi } from "@/stores/ui"
import { AppSidebar } from "./app-sidebar"
import { BottomNav } from "./bottom-nav"
import { Header } from "./header"

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
  const lang = useSettings((s) => s.lang)
  const sidebarOpen = useUi((s) => s.sidebarOpen)
  const setSidebarOpen = useUi((s) => s.setSidebarOpen)

  useSessionRefresh()

  useEffect(() => {
    void setLanguage(lang)
  }, [lang])

  return (
    <TooltipProvider delay={300}>
      <ThemeSync />
      <SidebarProvider
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        className="flex-col"
        style={{ "--sidebar-width": "15rem" } as CSSProperties}
      >
        <Header />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset className="min-w-0 pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
            <Outlet />
          </SidebarInset>
        </div>
        <BottomNav />
      </SidebarProvider>
      <Toaster position="bottom-center" />
      <ScrollRestoration />
    </TooltipProvider>
  )
}
