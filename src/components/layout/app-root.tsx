import { useEffect } from "react"
import { Outlet, ScrollRestoration } from "react-router"

import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { api } from "@/lib/api"
import { setLanguage } from "@/lib/i18n"
import { ThemeSync } from "@/lib/theme/use-theme"
import { useAuth } from "@/stores/auth"
import { useMusicPlayer } from "@/stores/music-player"
import { useSettings } from "@/stores/settings"

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

/**
 * What every page shares, whether it sits in the app shell or takes over the
 * whole window: theme, language, the session and toasts.
 */
export function AppRoot() {
  const lang = useSettings((s) => s.lang)
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
      <Outlet />
      <Toaster
        position="bottom-center"
        offset={{ bottom: hasMusic ? "6.5rem" : "1.5rem" }}
        mobileOffset={{
          bottom: `calc(${hasMusic ? "9rem" : "4.5rem"} + env(safe-area-inset-bottom,0px))`,
        }}
      />
      <ScrollRestoration />
    </TooltipProvider>
  )
}
