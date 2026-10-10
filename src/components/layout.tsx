import { Suspense, useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { HomeOutlineIcon, SearchIcon, HeartIcon, GridIcon, CalendarIcon, SettingsOutlineIcon, ArrowUpRightIcon, ListIcon, GlobeIcon, SunIcon, MoonIcon, GithubIcon, DiscordIcon, PlayIcon } from '@/components/icons'
import { Avatar, Choice, GridSkeleton, IconButton } from './shared'
import { usePreferences } from '@/lib/preferences'
import { useOrganizations } from '@/lib/queries'
import { channelName } from '@/lib/format'
import { cn } from '@/lib/utils'

export function Brand() { return <Link to="/" className="flex items-center gap-2.5" aria-label="Holodex home"><span className="brand-mark flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><PlayIcon className="ml-0.5 size-5" /></span><span className="text-[23px] font-bold tracking-[-0.065em]">holodex<span className="text-primary-readable">.</span></span></Link> }
const navigation = [
  { to: '/', label: 'Home', icon: HomeOutlineIcon, end: true },
  { to: '/favorites', label: 'Favorites', icon: HeartIcon },
  { to: '/search', label: 'Search & discover', icon: SearchIcon },
  { to: '/multiview', label: 'Multiview', icon: GridIcon },
  { to: '/schedule', label: 'Schedule', icon: CalendarIcon },
]
function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { preferences, favorites } = usePreferences()
  return <div className="flex h-full flex-col px-4 pb-5">
    <div className="px-3 pt-8 pb-9"><Brand /></div>
    <p className="eyebrow px-3 pb-3">Your space</p>
    <nav aria-label="Main navigation" className="space-y-1">{navigation.map(({ to, label, icon: Icon, end }) => <NavLink end={end} key={to} to={to} onClick={onNavigate} className={({ isActive }) => cn('nav-item', isActive && 'nav-item-active')}><Icon className="size-[19px]" /><span>{label}</span>{to === '/favorites' && favorites.length > 0 && <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px]">{favorites.length}</span>}</NavLink>)}</nav>
    <Separator className="my-6" />
    <div className="flex items-center justify-between px-3"><p className="eyebrow">Following</p><Link to="/search" onClick={onNavigate} aria-label="Find channels to follow" className="text-muted-foreground hover:text-foreground"><SearchIcon className="size-3.5" /></Link></div>
    <div className="mt-4 flex-1 space-y-1 overflow-y-auto">
      {favorites.slice(0, 8).map((channel) => <Link key={channel.id} to={`/search?channel=${encodeURIComponent(channel.id)}&name=${encodeURIComponent(channelName(channel, preferences.englishNames))}`} onClick={onNavigate} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"><Avatar channel={channel} className="size-6" /><span className="truncate">{channelName(channel, preferences.englishNames)}</span></Link>)}
      {!favorites.length && <div className="px-3 py-1"><p className="text-xs leading-5 text-muted-foreground">A little heart goes a long way.<br />Favorite a channel to find it here.</p><Link to="/search" onClick={onNavigate} className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary-readable">Find your favorites<ArrowUpRightIcon className="size-3.5" /></Link></div>}
    </div>
    <div className="mt-6 rounded-xl border bg-background/40 p-3.5"><div className="mb-2 flex items-center gap-2"><span className="size-1.5 rounded-full bg-primary" /><span className="text-xs font-semibold">Made by fans, for fans.</span></div><p className="text-[11px] leading-5 text-muted-foreground">A window into the VTuber world.<br />Powered by our community.</p><a href="https://github.com/HolodexNet/Holodex" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-primary-readable">Make Holodex better<ArrowUpRightIcon className="size-3" /></a></div>
    <NavLink to="/settings" onClick={onNavigate} className={({ isActive }) => cn('nav-item mt-4', isActive && 'nav-item-active')}><SettingsOutlineIcon className="size-[19px]" /><span>Settings</span></NavLink>
    <div className="mt-4 flex items-center justify-between px-3 text-[10px] text-muted-foreground"><span>Holodex · community first</span><div className="flex gap-3"><a href="https://github.com/HolodexNet/Holodex" aria-label="GitHub" target="_blank" rel="noreferrer"><GithubIcon className="size-3.5" /></a><a href="https://discord.gg/jctkgHBt4b" aria-label="Discord community" target="_blank" rel="noreferrer"><DiscordIcon className="size-3.5" /></a></div></div>
  </div>
}
export function Layout() {
  const { preferences, update, storageError } = usePreferences()
  const orgs = useOrganizations()
  const navigate = useNavigate()
  const location = useLocation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState('')
  const [drawer, setDrawer] = useState(false)
  useEffect(() => {
    const key = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key === 'k') { event.preventDefault(); inputRef.current?.focus() } }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [])
  useEffect(() => { document.getElementById('main-content')?.scrollTo(0, 0); window.scrollTo(0, 0) }, [location.pathname])
  const orgOptions = [...new Set(['All Vtubers', 'Hololive', 'Nijisanji', 'Independents', ...(orgs.data || []).map((o) => o.name), preferences.organization])].map((name) => ({ value: name, label: name === 'All Vtubers' ? 'All organizations' : name }))
  const activeDark = preferences.appearance === 'dark' || (preferences.appearance === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)
  return <div className="app-shell">
    <a href="#main-content" className="skip-link">Skip to content</a>
    <aside className="desktop-sidebar"><Sidebar /></aside>
    <div className="app-body">
      <header className="app-header">
        <div className="flex items-center gap-3 lg:hidden"><Sheet open={drawer} onOpenChange={setDrawer}><SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open navigation" />}><ListIcon /></SheetTrigger><SheetContent side="left" className="w-64 gap-0 p-0"><SheetHeader className="sr-only"><SheetTitle>Navigation</SheetTitle></SheetHeader><Sidebar onNavigate={() => setDrawer(false)} /></SheetContent></Sheet><span className="hidden sm:block"><Brand /></span></div>
        <form className="header-search relative flex-1" role="search" onSubmit={(event) => { event.preventDefault(); if (search.trim()) { navigate(`/search?q=${encodeURIComponent(search.trim())}`); setSearch(''); inputRef.current?.blur() } }}>
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input ref={inputRef} value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search streams, clips and channels" placeholder="Search streams, clips, channels…" className="h-10 rounded-xl border-transparent bg-muted/60 pr-14 pl-10 text-xs" />
          <kbd className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:block">⌘ K</kbd>
        </form>
        <div className="flex items-center gap-2 md:gap-4"><div className="hidden items-center gap-2 sm:flex"><GlobeIcon className="size-4 text-muted-foreground" /><Choice label="Organization" value={preferences.organization} onChange={(value) => update('organization', value)} options={orgOptions} className="max-w-44 border-transparent bg-transparent" /></div><span className="hidden h-5 w-px bg-border md:block" /><IconButton label={activeDark ? 'Switch to light theme' : 'Switch to dark theme'} onClick={() => update('appearance', activeDark ? 'light' : 'dark')}>{activeDark ? <SunIcon /> : <MoonIcon />}</IconButton><Link to="/settings" className="flex size-8 items-center justify-center rounded-full border bg-muted text-xs font-semibold" aria-label="Your preferences">H</Link></div>
      </header>
      <main id="main-content" tabIndex={-1} className="main-content"><div className="sm:hidden"><Choice label="Organization" value={preferences.organization} onChange={(value) => update('organization', value)} options={orgOptions} className="mb-5 w-full" /></div>{storageError && <p role="alert" className="mb-5 rounded-lg border border-destructive/30 p-3 text-sm">Your browser couldn’t save preferences. Changes will last for this session.</p>}<Suspense fallback={<GridSkeleton />}><Outlet /></Suspense></main>
      <footer className="main-footer"><p>Find something worth staying up for.</p><span>Built with love, by the Holodex community <span className="ml-1 text-primary-readable">✦</span></span></footer>
    </div>
  </div>
}
