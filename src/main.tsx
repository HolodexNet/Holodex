import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClientProvider } from "@tanstack/react-query"
import { createBrowserRouter, Navigate } from "react-router"
import { RouterProvider } from "react-router/dom"

import "./index.css"
import { AppRoot } from "@/components/layout/app-root"
import { AppShell } from "@/components/layout/app-shell"
import { MusicPageLayout } from "@/components/layout/home-tabs-layout"
import { Spinner } from "@/components/ui/spinner"
import { setLanguage } from "@/lib/i18n"
import { queryClient } from "@/lib/queries"
import { applyTheme, systemMode } from "@/lib/theme/apply"
import { themeConfig } from "@/lib/theme/use-theme"
import { WatchPage } from "@/pages/watch"
import { ChannelPage } from "@/pages/channel"
import { ChannelsPage } from "@/pages/channels"
import { HomePage } from "@/pages/home"
import { LoginPage } from "@/pages/login"
import { NotFoundPage, NotReadyPage } from "@/pages/not-ready"
import { SearchPage } from "@/pages/search"
import { SettingsPage } from "@/pages/settings"
import { useSettings } from "@/stores/settings"

const settings = useSettings.getState()

// Apply the theme and language before the first render so nothing flashes.
applyTheme(
  themeConfig(settings),
  settings.themeMode === "system" ? systemMode() : settings.themeMode
)
void setLanguage(settings.lang)

// Opening the bare site lands on the page the viewer chose as their default.
if (
  window.location.pathname === "/" &&
  !window.location.hash &&
  settings.defaultOpen !== "home"
) {
  window.history.replaceState(null, "", `/${settings.defaultOpen}`)
}

/** Routes of the previous UI that have not been rebuilt yet. */
const PENDING_ROUTES = [
  "/add_placeholder",
  "/playlists",
  "/library",
  "/about",
  "/extension",
  "/tlclient",
  "/scripteditor",
  "/scriptmanager",
  "/relaybot",
  "/addChannel",
]

const router = createBrowserRouter([
  {
    element: <AppRoot />,
    HydrateFallback: () => (
      <div
        role="status"
        className="flex min-h-svh items-center justify-center gap-3"
      >
        <Spinner /> Loading Holodex…
      </div>
    ),
    children: [
      // A full-window application of its own, so outside the app shell.
      {
        path: "/multiview/:layout?",
        lazy: async () => ({
          Component: (await import("@/pages/multiview")).default,
        }),
      },
      // Also a full window: editing wants the room, and the video's own audio.
      {
        path: "/edit/video/:id/:tab?",
        lazy: async () => ({
          Component: (await import("@/pages/edit-video")).default,
        }),
      },
      {
        element: <AppShell />,
        children: [
          { path: "/", element: <HomePage /> },
          { path: "/home", element: <Navigate to="/" replace /> },
          { path: "/favorites", element: <HomePage favorites /> },
          { path: "/watch/:id?", element: <WatchPage /> },
          { path: "/channel", element: <ChannelsPage /> },
          { path: "/channels", element: <Navigate to="/channel" replace /> },
          { path: "/org/:org/channels", element: <ChannelsPage /> },
          { path: "/channel/:id/:tab?", element: <ChannelPage /> },
          { path: "/search", element: <SearchPage /> },
          { path: "/music", element: <Navigate to="/#music" replace /> },
          {
            path: "/music/org/:org",
            lazy: async () => ({
              Component: (await import("@/pages/music/home")).default,
            }),
          },
          {
            path: "/music/favorites",
            lazy: async () => ({
              Component: (await import("@/pages/music/home")).MusicFavorites,
            }),
          },
          { path: "/music/radios", element: <Navigate to="/#radio" replace /> },
          {
            path: "/music/playlists",
            element: <Navigate to="/#playlists" replace />,
          },
          {
            element: <MusicPageLayout />,
            children: [
              {
                path: "/music/search",
                lazy: async () => ({
                  Component: (await import("@/pages/music/search")).default,
                }),
              },
              {
                path: "/music/liked",
                lazy: async () => ({
                  Component: (await import("@/pages/music/home")).MusicLiked,
                }),
              },
              {
                path: "/music/browse/:type",
                lazy: async () => ({
                  Component: (await import("@/pages/music/home")).MusicBrowse,
                }),
              },
              {
                path: "/music/playlist/:id",
                lazy: async () => ({
                  Component: (await import("@/pages/music/playlist"))
                    .MusicPlaylistPage,
                }),
              },
              {
                path: "/music/radio/:id",
                lazy: async () => ({
                  Component: (await import("@/pages/music/radio"))
                    .MusicRadioPage,
                }),
              },
            ],
          },
          { path: "/settings", element: <SettingsPage /> },
          { path: "/login", element: <LoginPage /> },
          ...PENDING_ROUTES.map((path) => ({
            path,
            element: <NotReadyPage />,
          })),
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
])

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
)
