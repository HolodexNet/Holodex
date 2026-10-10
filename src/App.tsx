import { lazy } from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Layout } from '@/components/layout'
import { EmptyState } from '@/components/shared'
import { HomePage } from '@/pages/home'
import { PreferencesProvider } from '@/lib/preferences'
import { ApiError } from '@/lib/api'

const SearchPage = lazy(() => import('@/pages/search').then((m) => ({ default: m.SearchPage })))
const SettingsPage = lazy(() => import('@/pages/settings').then((m) => ({ default: m.SettingsPage })))
const SchedulePage = lazy(() => import('@/pages/schedule').then((m) => ({ default: m.SchedulePage })))
const WatchPage = lazy(() => import('@/pages/watch').then((m) => ({ default: m.WatchPage })))
const MultiviewPage = lazy(() => import('@/pages/multiview').then((m) => ({ default: m.MultiviewPage })))

const queryClient = new QueryClient({ defaultOptions: { queries: {
  retry: (attempt, error) => attempt < 1 && (!(error instanceof ApiError) || error.status >= 500),
  refetchOnWindowFocus: true,
} } })
export default function App() {
  return <QueryClientProvider client={queryClient}><PreferencesProvider><TooltipProvider><BrowserRouter><Routes><Route element={<Layout />}>
    <Route index element={<HomePage />} /><Route path="favorites" element={<HomePage favoritesOnly />} />
    <Route path="search" element={<SearchPage />} /><Route path="settings" element={<SettingsPage />} />
    <Route path="schedule" element={<SchedulePage />} /><Route path="multiview" element={<MultiviewPage />} />
    <Route path="watch/:id" element={<WatchPage />} />
    <Route path="*" element={<EmptyState title="A little off the beaten path" description="This page isn’t part of the new Holodex yet. Let’s get you back to a familiar place." action={<Button render={<Link to="/" />}>Back to home</Button>} />} />
  </Route></Routes></BrowserRouter></TooltipProvider></PreferencesProvider></QueryClientProvider>
}
