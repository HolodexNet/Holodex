import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClientProvider } from "@tanstack/react-query"
import {
  createBrowserRouter,
  Navigate,
  type LoaderFunctionArgs,
} from "react-router"
import { RouterProvider } from "react-router/dom"

import "./index.css"
import { AppShell } from "@/components/layout/app-shell"
import { Spinner } from "@/components/ui/spinner"
import { setLanguage } from "@/lib/i18n"
import { musicHomeQueryOptions } from "@/lib/musicdex/queries"
import { queryClient } from "@/lib/queries"
import { applyTheme, systemMode } from "@/lib/theme/apply"
import { WatchPage } from "@/pages/watch"
import { ChannelPage } from "@/pages/channel"
import { ChannelsPage } from "@/pages/channels"
import { HomePage } from "@/pages/home"
import { LoginPage } from "@/pages/login"
import { NotFoundPage, NotReadyPage } from "@/pages/not-ready"
import { SearchPage } from "@/pages/search"
import { SettingsPage } from "@/pages/settings"
import { useSettings } from "@/stores/settings"
import { useOrgStore } from "@/stores/org"

const settings = useSettings.getState()

// Apply the theme and language before the first render so nothing flashes.
applyTheme(
  settings.primaryColor,
  settings.themeMode === "system" ? systemMode() : settings.themeMode,
  settings.themeColorOverrides
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
  "/edit/video/:id/:tab?",
  "/add_placeholder",
  "/multiview/:layout?",
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

function loadMusicHome({ params }: LoaderFunctionArgs) {
  const queries = musicHomeQueryOptions(
    params.org ?? useOrgStore.getState().currentOrg.name
  )
  // Start alongside the lazy route import; neither request blocks the page shell.
  void queryClient.prefetchQuery(queries.discovery)
  void queryClient.prefetchQuery(queries.trending)
  return null
}

const router = createBrowserRouter([
  {
    element: <AppShell />,
    HydrateFallback: () => (
      <div
        role="status"
        className="flex min-h-svh items-center justify-center gap-3"
      >
        <Spinner /> Loading Holodex…
      </div>
    ),
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
      {
        path: "/music",
        loader: loadMusicHome,
        lazy: async () => ({
          Component: (await import("@/pages/music/home")).default,
        }),
      },
      {
        path: "/music/org/:org",
        loader: loadMusicHome,
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
        path: "/music/radios",
        lazy: async () => ({
          Component: (await import("@/pages/music/home")).MusicRadios,
        }),
      },
      {
        path: "/music/browse/:type",
        lazy: async () => ({
          Component: (await import("@/pages/music/home")).MusicBrowse,
        }),
      },
      {
        path: "/music/playlists",
        lazy: async () => ({
          Component: (await import("@/pages/music/library")).MusicLibraryPage,
        }),
      },
      {
        path: "/music/playlist/:id",
        lazy: async () => ({
          Component: (await import("@/pages/music/playlist")).MusicPlaylistPage,
        }),
      },
      {
        path: "/music/radio/:id",
        lazy: async () => ({
          Component: (await import("@/pages/music/radio")).MusicRadioPage,
        }),
      },
      { path: "/settings", element: <SettingsPage /> },
      { path: "/login", element: <LoginPage /> },
      ...PENDING_ROUTES.map((path) => ({ path, element: <NotReadyPage /> })),
      { path: "*", element: <NotFoundPage /> },
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
