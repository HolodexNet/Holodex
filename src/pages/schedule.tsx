import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalendarIcon, ArrowUpRightIcon, DownloadIcon } from '@/components/icons'
import { Avatar, EmptyState, ErrorState, GridSkeleton, PageHeader } from '@/components/shared'
import { useLive } from '@/lib/queries'
import { usePreferences } from '@/lib/preferences'
import { channelName, dateOf, formatTime, topicName, videoDate } from '@/lib/format'
import { media } from '@/lib/api'
import type { Video } from '@/lib/types'

export function SchedulePage() {
  const { preferences } = usePreferences()
  const [range, setRange] = useState('all')
  const live = useLive()
  const timeZone = preferences.timeZone === 'local' ? Intl.DateTimeFormat().resolvedOptions().timeZone : preferences.timeZone
  const dateKey = (date: Date) => new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
  const grouped = useMemo(() => {
    const videos = [...new Map((live.data?.pages.flatMap((p) => p.items) || []).map((v) => [v.id, v])).values()].filter((v) => v.status === 'upcoming' && (!preferences.hidePlaceholders || !v.type.includes('placeholder')) && (!preferences.hideFreeChat || v.topic_id?.toLowerCase() !== 'freechat'))
    const result = new Map<string, Video[]>()
    for (const video of videos.sort((a, b) => (dateOf(videoDate(a))?.getTime() || Infinity) - (dateOf(videoDate(b))?.getTime() || Infinity))) {
      const date = dateOf(videoDate(video))
      if (range === 'today' && (!date || dateKey(date) !== dateKey(new Date()))) continue
      if (range === 'week' && (!date || date.getTime() < Date.now() || date.getTime() > Date.now() + 7 * 86400000)) continue
      const label = !date ? 'Time to be announced' : date.getTime() < Date.now() ? 'Awaiting an updated time' : new Intl.DateTimeFormat('en', { timeZone, weekday: 'long', month: 'long', day: 'numeric' }).format(date)
      result.set(label, [...(result.get(label) || []), video])
    }
    return [...result.entries()].sort(([a], [b]) => a === 'Awaiting an updated time' ? 1 : b === 'Awaiting an updated time' ? -1 : 0)
  }, [live.data, range, preferences.hidePlaceholders, preferences.hideFreeChat, timeZone])
  return <><PageHeader eyebrow="Something to look forward to" title="Save a little time for this." description={`Upcoming streams in ${preferences.organization === 'All Vtubers' ? 'all organizations' : preferences.organization}. Times shown in ${timeZone.replaceAll('_', ' ')}.`} action={<Button variant="outline" render={<a href={media.calendar(preferences.organization)} download="holodex-schedule.ics" />}><DownloadIcon />Add to calendar</Button>} /><Tabs className="my-8" value={range} onValueChange={(v) => setRange(String(v))}><TabsList><TabsTrigger value="all">All upcoming</TabsTrigger><TabsTrigger value="today">Today</TabsTrigger><TabsTrigger value="week">Next 7 days</TabsTrigger></TabsList></Tabs>{live.isPending ? <GridSkeleton /> : live.error && !live.data ? <ErrorState error={live.error} retry={() => void live.refetch()} /> : grouped.length ? <div className="mx-auto max-w-4xl space-y-8">{grouped.map(([label, videos]) => <section key={label}><h2 className="mb-4 text-sm font-semibold">{label}<span className="ml-3 text-xs font-normal text-muted-foreground">{videos.length} streams</span></h2><div className="divide-y rounded-2xl border bg-card">{videos.map((video) => <Link key={video.id} to={`/watch/${video.id}`} className="group flex items-center gap-4 p-5"><span className="w-20 shrink-0 text-xs font-semibold text-primary-readable">{formatTime(videoDate(video), preferences.timeZone)}</span><Avatar channel={video.channel} className="hidden size-10 sm:inline-flex" /><div className="min-w-0 flex-1"><h3 className="line-clamp-2 text-sm font-medium group-hover:text-primary-readable">{video.title || 'Scheduled stream'}</h3><p className="mt-1.5 text-xs text-muted-foreground">{channelName(video.channel, preferences.englishNames)} · {topicName(video.topic_id)}</p></div><ArrowUpRightIcon className="size-4 shrink-0 text-muted-foreground" /></Link>)}</div></section>)}</div> : <EmptyState icon={CalendarIcon} title="A little room in your calendar" description="No upcoming streams match this range. Try all upcoming or another organization." />}{live.hasNextPage && <div className="mt-8 text-center"><Button variant="outline" disabled={live.isFetchingNextPage} onClick={() => void live.fetchNextPage()}>{live.isFetchingNextPage ? 'Loading…' : 'Load more scheduled streams'}</Button></div>}{live.error && live.data && <p role="status" className="mt-5 text-xs text-muted-foreground">The latest refresh failed. Showing the last successful schedule.</p>}</>
}
