import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { HeartIcon, GridIcon, PlayIcon, CalendarIcon, LiveIcon } from '@/components/icons'
import { IconButton, Avatar } from './shared'
import type { Video } from '@/lib/types'
import { media } from '@/lib/api'
import { channelName, duration, formatCount, formatTime, relativeTime, topicName, videoDate } from '@/lib/format'
import { usePreferences } from '@/lib/preferences'
import { cn } from '@/lib/utils'

export function Thumbnail({ video, className, featured = false }: { video: Video; className?: string; featured?: boolean }) {
  const [failed, setFailed] = useState(false)
  const { preferences } = usePreferences()
  const source = preferences.thumbnails && media.thumbnail(video)
  return <div className={cn('thumbnail relative aspect-video overflow-hidden rounded-xl bg-muted', className)}>
    {source && !failed ? <img src={source} alt="" loading={featured ? 'eager' : 'lazy'} className="size-full object-cover transition-transform duration-500 group-hover/card:scale-105" onError={() => setFailed(true)} />
      : <div className="flex size-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-primary/10 via-muted to-background"><Avatar channel={video.channel} className="size-14" /><span className="max-w-[90%] truncate text-sm text-muted-foreground">{channelName(video.channel, preferences.englishNames)}</span></div>}
    <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
    {video.status === 'live' && <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-md bg-[#ef4444] px-2 py-1 text-[10px] font-bold tracking-wider text-white"><span className="size-1.5 rounded-full bg-white" />LIVE</span>}
    {video.status === 'upcoming' && <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-md bg-black/70 px-2 py-1 text-[10px] font-semibold tracking-wider text-white"><CalendarIcon className="size-3" />UPCOMING</span>}
    {Number(video.live_viewers) > 0 && video.status === 'live' && <span className="absolute right-2 bottom-2 flex items-center gap-1.5 rounded bg-black/70 px-2 py-1 text-[10px] font-medium text-white"><LiveIcon className="size-3" />{formatCount(video.live_viewers)} watching</span>}
    {!!video.duration && video.status === 'past' && <span className="absolute right-2 bottom-2 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-medium text-white">{duration(video.duration)}</span>}
    <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover/card:opacity-100"><span className="flex size-11 items-center justify-center rounded-full bg-white/95 text-black shadow-lg"><PlayIcon className="ml-0.5 size-5" /></span></span>
  </div>
}
export function VideoCard({ video, list = false, onAdd, selected = false }: { video: Video; list?: boolean; onAdd?: (video: Video) => void; selected?: boolean }) {
  const { preferences, favorites, toggleFavorite } = usePreferences()
  const favorite = favorites.some((channel) => channel.id === video.channel.id)
  const name = channelName(video.channel, preferences.englishNames)
  return <article className={cn('group/card video-card relative min-w-0', list && 'video-card-list')}>
    <Link to={`/watch/${encodeURIComponent(video.id)}`} className="block min-w-0 rounded-xl outline-offset-4" aria-label={`Watch ${video.title || 'untitled stream'}`}><Thumbnail video={video} /></Link>
    <div className={cn('mt-3.5 flex min-w-0 gap-2.5', list && 'mt-0')}>
      {!list && <Avatar channel={video.channel} className="mt-0.5 size-8" />}
      <div className="min-w-0 flex-1">
        <Link to={`/watch/${encodeURIComponent(video.id)}`} className="line-clamp-2 text-[13px] leading-[1.55] font-semibold text-foreground/95 hover:text-primary-readable">{video.title || 'Untitled stream'}</Link>
        <p className="mt-1.5 truncate text-xs text-muted-foreground">{name}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted-foreground"><Badge variant="secondary" className="rounded-md px-1.5 py-0.5 text-[9px] font-medium">{topicName(video.topic_id)}</Badge><span>{video.status === 'upcoming' ? formatTime(videoDate(video), preferences.timeZone, true) : video.status === 'live' ? 'Streaming now' : relativeTime(videoDate(video))}</span>{video.type === 'clip' && video.lang && <span className="uppercase">{video.lang}</span>}</div>
      </div>
      <div className="flex shrink-0 flex-col gap-1">
        <IconButton label={favorite ? `Unfavorite ${name}` : `Favorite ${name}`} size="icon-xs" className={cn('text-muted-foreground', favorite && 'text-primary-readable')} aria-pressed={favorite} onClick={() => toggleFavorite(video.channel)}><HeartIcon className={cn(favorite && 'fill-primary/15')} /></IconButton>
        {onAdd && video.status === 'live' && <IconButton label={selected ? 'Remove from multiview' : 'Add to multiview'} size="icon-xs" className={cn('text-muted-foreground', selected && 'bg-primary/10 text-primary-readable')} aria-pressed={selected} onClick={() => onAdd(video)}><GridIcon /></IconButton>}
      </div>
    </div>
  </article>
}
