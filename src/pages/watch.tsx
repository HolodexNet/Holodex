import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeftIcon, ArrowUpRightIcon, HeartIcon, PlayIcon, GridIcon, ShareIcon, CalendarIcon } from '@/components/icons'
import { Avatar, EmptyState, ErrorState } from '@/components/shared'
import { Thumbnail } from '@/components/video-card'
import { api, isYouTubeVideo, videoLink } from '@/lib/api'
import { channelName, formatCount, formatTime, topicName, videoDate } from '@/lib/format'
import { usePreferences } from '@/lib/preferences'

export function WatchPage() {
  const { id = '' } = useParams()
  const { preferences, favorites, toggleFavorite } = usePreferences()
  const [playing, setPlaying] = useState(false)
  const [notice, setNotice] = useState('')
  const video = useQuery({ queryKey: ['video', id], queryFn: ({ signal }) => api.video(id, signal), staleTime: 180000 })
  if (video.isPending) return <div className="space-y-5"><Skeleton className="aspect-video w-full rounded-2xl" /><Skeleton className="h-8 w-3/4" /><Skeleton className="h-12 w-1/3" /></div>
  if (video.error) return <ErrorState error={video.error} retry={() => void video.refetch()} />
  const data = video.data
  if (!data) return null
  const link = videoLink(data)
  const favorite = favorites.some((c) => c.id === data.channel.id)
  return <div className="mx-auto max-w-6xl"><Link to="/" className="mb-6 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"><ArrowLeftIcon className="size-4" />Back to discovery</Link>
    {isYouTubeVideo(data) ? <div className="group/card relative aspect-video overflow-hidden rounded-2xl border bg-black">{playing ? <iframe key={id} title={data.title || 'Holodex video player'} src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen className="absolute inset-0 size-full" /> : <><Thumbnail video={data} featured className="absolute inset-0 size-full rounded-none" /><button aria-label="Play video" className="absolute inset-0 flex items-center justify-center bg-black/20" onClick={() => setPlaying(true)}><span className="flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl"><PlayIcon className="ml-1 size-8" /></span></button></>}</div> : <EmptyState icon={CalendarIcon} title="An event beyond YouTube" description={link ? 'This event has an external destination. Open it to watch on its original platform.' : 'The catalog has not provided a watch link for this event yet.'} action={link ? <Button render={<a href={link} target="_blank" rel="noreferrer" />}>Open event<ArrowUpRightIcon /></Button> : undefined} />}
    <div className="mt-6 flex flex-wrap items-center gap-2"><Badge variant="secondary">{topicName(data.topic_id)}</Badge>{data.status === 'live' && <Badge className="bg-red-500/15 text-red-400">Live now{Number(data.live_viewers) > 0 && ` · ${formatCount(data.live_viewers)} watching`}</Badge>}{data.status === 'upcoming' && <span className="text-xs text-muted-foreground">Scheduled for {formatTime(videoDate(data), preferences.timeZone, true)}</span>}</div><h1 className="mt-4 text-xl leading-relaxed font-semibold tracking-tight md:text-2xl">{data.title || 'Untitled stream'}</h1>
    <div className="mt-6 flex flex-wrap items-center justify-between gap-5 border-b pb-6"><div className="flex items-center gap-3"><Avatar channel={data.channel} className="size-11" /><div><Link to={`/search?channel=${data.channel.id}&name=${encodeURIComponent(channelName(data.channel, preferences.englishNames))}`} className="text-sm font-semibold hover:text-primary-readable">{channelName(data.channel, preferences.englishNames)}</Link><p className="mt-1 text-xs text-muted-foreground">{data.channel.org}</p></div><Button variant={favorite ? 'secondary' : 'outline'} size="sm" aria-pressed={favorite} onClick={() => toggleFavorite(data.channel)}><HeartIcon />{favorite ? 'Favorited' : 'Favorite'}</Button></div><div className="flex gap-2">{isYouTubeVideo(data) && <Button variant="outline" size="sm" render={<Link to={`/multiview?videos=${id}`} />}><GridIcon />Multiview</Button>}<Button variant="outline" size="sm" onClick={async () => { try { await navigator.clipboard.writeText(window.location.href); setNotice('Link copied. Share a little discovery.') } catch { setNotice('Couldn’t copy the link. You can copy it from the address bar.') } }}><ShareIcon />Share</Button>{link && <Button variant="outline" size="sm" render={<a href={link} target="_blank" rel="noreferrer" />}><ArrowUpRightIcon />Open original</Button>}</div></div>
    {notice && <p role="status" className="mt-4 text-xs text-primary-readable">{notice}</p>}{data.description && <details className="mt-6 rounded-xl border bg-card p-5"><summary className="cursor-pointer text-sm font-medium">About this stream</summary><p className="mt-4 whitespace-pre-wrap text-xs leading-6 text-muted-foreground">{data.description}</p></details>}
  </div>
}
