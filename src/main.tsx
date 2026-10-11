import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClientProvider } from "@tanstack/react-query"
import { createBrowserRouter, Navigate } from "react-router"
import { RouterProvider } from "react-router/dom"

import "./index.css"
import { AppShell } from "@/components/layout/app-shell"
import { setLanguage } from "@/lib/i18n"
import { queryClient } from "@/lib/queries"
import { applyTheme, systemMode } from "@/lib/theme/apply"
import { HomePage } from "@/pages/home"
import { LoginPage } from "@/pages/login"
import { NotFoundPage, NotReadyPage } from "@/pages/not-ready"
import { SearchPage } from "@/pages/search"
import { SettingsPage } from "@/pages/settings"
import { useSettings } from "@/stores/settings"

const settings = useSettings.getState()

// Apply the theme and language before the first render so nothing flashes.
applyTheme(
  settings.primaryColor,
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
  "/watch/:id?",
  "/channel",
  "/channel/:id/*",
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

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/home", element: <Navigate to="/" replace /> },
      { path: "/favorites", element: <HomePage favorites /> },
      { path: "/search", element: <SearchPage /> },
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
