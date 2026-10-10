import { useMemo, useState } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { LiveIcon, ArrowRightIcon, ArrowUpRightIcon, PlayIcon, CalendarIcon, GridIcon, ListIcon, RefreshIcon, MusicIcon, HeartIcon, ClockIcon, GlobeIcon, LightningIcon, UsersIcon, CheckIcon } from '@/components/icons'
import { Avatar, EmptyState, ErrorState, GridSkeleton, IconButton, PageHeader, SectionHeading } from '@/components/shared'
import { Thumbnail, VideoCard } from '@/components/video-card'
import { api, media, queryString, request } from '@/lib/api'
import { usePreferences } from '@/lib/preferences'
import { useLive } from '@/lib/queries'
import { channelName, dateOf, formatCount, formatTime, relativeTime, topicName, videoDate } from '@/lib/format'
import type { Video } from '@/lib/types'
import { cn } from '@/lib/utils'

const categories = [
  { key: 'all', label: 'All streams' }, { key: 'gaming', label: 'Gaming' },
  { key: 'music', label: 'Music' }, { key: 'chatting', label: 'Just chatting' }, { key: 'events', label: 'Events' },
]
function categoryMatch(video: Video, category: string) {
  const topic = video.topic_id || ''
  if (category === 'all') return true
  if (category === 'music') return /singing|music|song|concert|karaoke/i.test(topic)
  if (category === 'chatting') return /talk|chat|zatsudan/i.test(topic)
  if (category === 'events') return /birthday|anniversary|3d|concert|celebration|debut/i.test(topic)
  return !!topic && !/singing|music|song|concert|karaoke|talk|chat|birthday|anniversary|3d|celebration|debut|membersonly|announce/i.test(topic)
}
function FeaturedStream({ video }: { video: Video }) {
  const { preferences } = usePreferences()
  return <article className="feature-stream group/card mb-8 grid overflow-hidden rounded-2xl border bg-card sm:grid-cols-[1fr_1.1fr]">
    <div className="flex flex-col items-start justify-between gap-5 p-6"><div><p className="mb-4 flex items-center gap-2 text-[10px] font-semibold tracking-[0.15em] uppercase text-primary-readable"><span className="size-1.5 rounded-full bg-primary" />In the spotlight</p><Link to={`/watch/${video.id}`} className="line-clamp-3 text-xl leading-snug font-semibold tracking-tight hover:text-primary-readable">{video.title || 'A moment worth tuning into'}</Link><div className="mt-4 flex items-center gap-2"><Avatar channel={video.channel} className="size-6" /><span className="truncate text-xs text-muted-foreground">{channelName(video.channel, preferences.englishNames)}</span></div></div><Button render={<Link to={`/watch/${video.id}`} />} size="sm"><PlayIcon />Watch stream<ArrowUpRightIcon className="ml-2" /></Button></div>
    <Link to={`/watch/${video.id}`} className="relative block min-h-48 overflow-hidden" aria-label={`Watch featured stream: ${video.title}`}><Thumbnail video={video} featured className="h-full rounded-none sm:absolute sm:inset-0 sm:aspect-auto" /></Link>
  </article>
}
export function UpcomingRail({ videos }: { videos: Video[] }) {
  const { preferences } = usePreferences()
  return <aside className="upcoming-rail">
    <div className="rounded-2xl border bg-card/60 p-5"><SectionHeading count={videos.length}>On the horizon</SectionHeading><p className="-mt-2 mb-5 text-xs text-muted-foreground">Your next reason to tune in.</p>
      {videos.length ? <div className="space-y-1">{videos.slice(0, 5).map((video) => <Link to={`/watch/${video.id}`} key={video.id} className="group flex gap-3 rounded-lg py-3"><div className="w-14 shrink-0 pt-0.5"><p className="text-xs font-semibold">{formatTime(videoDate(video), preferences.timeZone)}</p><p className="mt-1 text-[9px] text-muted-foreground">{dateOf(videoDate(video)) && dateOf(videoDate(video))!.getTime() < Date.now() ? 'Awaiting update' : relativeTime(videoDate(video))}</p></div><div className="min-w-0 border-l pl-3"><p className="line-clamp-2 text-xs leading-5 font-medium group-hover:text-primary-readable">{video.title || 'Scheduled stream'}</p><div className="mt-2 flex items-center gap-1.5"><Avatar channel={video.channel} className="size-4" /><span className="truncate text-[10px] text-muted-foreground">{channelName(video.channel, preferences.englishNames)}</span></div></div></Link>)}</div> : <p className="py-5 text-xs leading-5 text-muted-foreground">No upcoming streams in this selection. Check back soon.</p>}
      <Button variant="outline" render={<Link to="/schedule" />} className="mt-5 w-full text-xs"><CalendarIcon />See the full schedule<ArrowRightIcon /></Button>
      <p className="mt-3 text-center text-[9px] text-muted-foreground">Times in {preferences.timeZone === 'local' ? Intl.DateTimeFormat().resolvedOptions().timeZone.replaceAll('_', ' ') : preferences.timeZone.replaceAll('_', ' ')}</p>
    </div>
    <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-5"><HeartIcon className="mb-3 size-5 text-primary-readable" /><h3 className="text-sm font-semibold">Make yourself at home.</h3><p className="mt-2 text-xs leading-6 text-muted-foreground">Follow the channels you love. Find their live streams, all in one place.</p><Link to="/favorites" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-primary-readable">Your favorites<ArrowRightIcon className="size-3.5" /></Link></div>
  </aside>
}
export function HomePage({ favoritesOnly = false }: { favoritesOnly?: boolean }) {
  const { preferences, update, favorites } = usePreferences()
  const [tab, setTab] = useState('live')
  const [category, setCategory] = useState('all')
  const [selected, setSelected] = useState<Video[]>([])
  const navigate = useNavigate()
  const live = useLive(!favoritesOnly)
  const favoriteLive = useQuery({ queryKey: ['favoriteLive', favorites.map((c) => c.id).sort()], enabled: favoritesOnly && !!favorites.length,
    queryFn: ({ signal }) => request<Video[]>(`/v2/users/live?${queryString({ channels: favorites.map((c) => c.id).join(','), includePlaceholder: 1 })}`, { signal }), staleTime: 120000, refetchInterval: 120000,
  })
  const catalog = useInfiniteQuery({ queryKey: ['catalog', preferences.organization, tab, preferences.clipLanguage], enabled: tab !== 'live' && !favoritesOnly, initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) => api.videos(preferences.organization, tab === 'clips' ? 'clip' : 'stream', tab === 'clips' ? preferences.clipLanguage : 'all', pageParam, signal),
    getNextPageParam: (last, pages, cursor) => last.items.length && last.nextPage && last.nextPage !== cursor && !pages.slice(0, -1).some((p) => p.nextPage === last.nextPage) ? last.nextPage : undefined, staleTime: 180000,
  })
  const source = favoritesOnly ? favoriteLive : tab === 'live' ? live : catalog
  const allLive = useMemo(() => {
    const items = favoritesOnly ? favoriteLive.data || [] : live.data?.pages.flatMap((p) => p.items) || []
    return [...new Map(items.map((v) => [v.id, v])).values()].filter((v) => (!preferences.hidePlaceholders || !v.type.includes('placeholder')) && (!preferences.hideFreeChat || v.topic_id?.toLowerCase() !== 'freechat'))
  }, [favoritesOnly, favoriteLive.data, live.data, preferences.hidePlaceholders, preferences.hideFreeChat])
  const now = allLive.filter((v) => v.status === 'live').sort((a, b) => Number(b.live_viewers || 0) - Number(a.live_viewers || 0))
  const upcoming = allLive.filter((v) => v.status === 'upcoming').sort((a, b) => {
    const at = dateOf(videoDate(a))?.getTime() || Infinity
    const bt = dateOf(videoDate(b))?.getTime() || Infinity
    const aOverdue = at < Date.now(), bOverdue = bt < Date.now()
    return aOverdue !== bOverdue ? aOverdue ? 1 : -1 : at - bt
  })
  const videos = (tab === 'live' ? now : [...new Map((catalog.data?.pages.flatMap((p) => p.items) || []).map((v) => [v.id, v])).values()]).filter((v) => categoryMatch(v, category))
  const featured = !favoritesOnly && tab === 'live' && category === 'all' ? now.find((v) => v.topic_id !== 'membersonly') : undefined
  const displayed = featured ? videos.filter((v) => v.id !== featured.id) : videos
  const totalViewers = now.reduce((sum, v) => sum + Number(v.live_viewers || 0), 0)
  const add = (video: Video) => setSelected((s) => s.some((v) => v.id === video.id) ? s.filter((v) => v.id !== video.id) : s.length < 4 ? [...s, video] : s)
  const view = preferences.view
  return <>
    <PageHeader eyebrow={favoritesOnly ? 'Your own little corner' : 'Discover · Connect · Tune in'} title={favoritesOnly ? 'Close to your favorites.' : 'Your world, live.'} description={favoritesOnly ? 'All the channels you love, together in one place. Favorites are saved on this device.' : 'A familiar face. A new discovery. There’s always something happening.'} action={<div className="flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-medium text-muted-foreground"><span className="live-dot size-1.5 rounded-full bg-emerald-400" />A community that never sleeps</div>} />
    {favoritesOnly && !favorites.length ? <div className="mt-8"><EmptyState icon={HeartIcon} title="Your favorites start with a heart" description="Tap the heart beside any stream to follow its channel. Their live streams and upcoming events will appear here." action={<Button render={<Link to="/search" />}>Discover channels<ArrowRightIcon /></Button>} /></div> : <>
      <div className="home-tabs mt-8 flex flex-wrap items-center justify-between gap-3 border-b pb-4">{!favoritesOnly ? <Tabs value={tab} onValueChange={(value) => { setTab(String(value)); setCategory('all') }}><TabsList variant="line" className="gap-5 p-0"><TabsTrigger value="live" className="px-0"><LiveIcon />Live & upcoming<span className="ml-1 rounded bg-muted px-1.5 py-0.5 text-[10px]">{allLive.length}</span></TabsTrigger><TabsTrigger value="streams" className="px-0">Recent streams</TabsTrigger><TabsTrigger value="clips" className="px-0">Clips</TabsTrigger></TabsList></Tabs> : <h2 className="text-sm font-semibold">Live & upcoming<span className="ml-2 text-muted-foreground">{allLive.length}</span></h2>}<div className="flex items-center gap-1 text-muted-foreground"><IconButton label="Refresh streams" size="icon-sm" disabled={source.isFetching} onClick={() => void source.refetch()}><RefreshIcon className={cn(source.isFetching && 'animate-spin')} /></IconButton><span className="mx-2 h-4 w-px bg-border" /><IconButton label="Grid view" size="icon-sm" aria-pressed={view === 'grid'} onClick={() => update('view', 'grid')} className={cn(view === 'grid' && 'bg-muted text-foreground')}><GridIcon /></IconButton><IconButton label="List view" size="icon-sm" aria-pressed={view === 'list'} onClick={() => update('view', 'list')} className={cn(view === 'list' && 'bg-muted text-foreground')}><ListIcon /></IconButton></div></div>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4 pt-5"><div className="flex flex-wrap gap-2" aria-label="Stream categories">{categories.map((item) => <Button key={item.key} size="sm" variant={category === item.key ? 'secondary' : 'ghost'} aria-pressed={category === item.key} onClick={() => setCategory(item.key)} className={cn('h-7 px-3 text-[11px]', category === item.key && 'bg-foreground text-background hover:bg-foreground/90 hover:text-background')}>{item.label}</Button>)}</div>{tab === 'live' && totalViewers > 0 && <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><UsersIcon className="size-3.5" />{formatCount(totalViewers)} watching together</p>}</div>
      {source.isPending ? <GridSkeleton /> : source.error && !source.data ? <ErrorState error={source.error} retry={() => void source.refetch()} /> : <>
        {source.error && <div role="status" className="mb-5 rounded-lg border p-3 text-xs text-muted-foreground">Couldn’t refresh streams. Showing the last successful update. <button onClick={() => void source.refetch()} className="underline">Retry</button></div>}
        <div className={cn('home-content', tab !== 'live' && 'home-content-full')}><div className="min-w-0">{featured && <FeaturedStream video={featured} />}<SectionHeading count={videos.length}>{tab === 'live' ? <><span className="size-2 rounded-full bg-red-400" />Live right now</> : tab === 'clips' ? 'Fresh from the community' : 'Catch up on what you missed'}</SectionHeading>
          {displayed.length ? <div className={view === 'list' ? 'space-y-5' : 'video-grid'}>{displayed.map((video) => <VideoCard key={video.id} video={video} list={view === 'list'} onAdd={add} selected={selected.some((v) => v.id === video.id)} />)}</div> : <EmptyState icon={LiveIcon} title={featured ? 'You’re all caught up' : 'A quiet moment'} description={category === 'all' ? 'No live streams in this selection right now. Explore another organization or check the upcoming schedule.' : 'No streams match this category. Try another filter.'} action={category !== 'all' ? <Button variant="outline" onClick={() => setCategory('all')}>Show all streams</Button> : <Button variant="outline" render={<Link to="/search" />}>Explore the catalog</Button>} />}
          {(tab === 'live' ? live.hasNextPage && !favoritesOnly : catalog.hasNextPage) && <div className="mt-8 text-center"><Button variant="outline" disabled={tab === 'live' ? live.isFetchingNextPage : catalog.isFetchingNextPage} onClick={() => void (tab === 'live' ? live.fetchNextPage() : catalog.fetchNextPage())}>{(tab === 'live' ? live.isFetchingNextPage : catalog.isFetchingNextPage) ? 'Loading…' : 'Load more'}<ArrowRightIcon /></Button></div>}
        </div>{tab === 'live' && <UpcomingRail videos={upcoming} />}</div>
      </>}
    </>}
    {!favoritesOnly && <section className="mt-12 border-t pt-8"><SectionHeading>A different kind of rabbit hole</SectionHeading><div className="explore-grid">{[
      { title: 'A little music', subtitle: 'Singing, covers & concerts', topic: 'singing', icon: MusicIcon, color: 'purple' },
      { title: 'Pull up a chair', subtitle: 'Conversations & cozy moments', topic: 'talk', icon: GlobeIcon, color: 'green' },
      { title: 'Something special', subtitle: 'Birthdays, debuts & milestones', topic: 'Birthday', icon: LightningIcon, color: 'amber' },
    ].map(({ title, subtitle, topic, icon: Icon, color }) => <Link key={title} to={`/search?topic=${topic}`} className={`explore-card explore-${color}`}><span className="explore-icon"><Icon className="size-5" /></span><div><h3 className="text-sm font-semibold">{title}</h3><p className="mt-1.5 text-[11px] text-muted-foreground">{subtitle}</p></div><ArrowUpRightIcon className="ml-auto size-4 text-muted-foreground" /></Link>)}</div></section>}
    {selected.length > 0 && <div className="multiview-tray"><GridIcon className="size-5 text-primary-readable" /><span className="text-xs"><strong>{selected.length}/4</strong> streams selected</span><div className="hidden gap-1 sm:flex">{selected.map((video) => <Avatar key={video.id} channel={video.channel} className="size-6" />)}</div><Button size="sm" onClick={() => navigate(`/multiview?videos=${selected.map((v) => v.id).join(',')}`)}>Open multiview<ArrowUpRightIcon /></Button><IconButton label="Clear selected streams" size="icon-xs" onClick={() => setSelected([])}><CheckIcon /></IconButton></div>}
  </>
}
