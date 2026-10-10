import type { Channel, Video, WireDate } from './types'
export function channelName(channel: Channel, english = true) { return (english && channel.english_name) || channel.name || 'Unknown channel' }
export function videoDate(video: Video) { return video.status === 'upcoming' ? video.start_scheduled || video.available_at : video.start_actual || video.available_at || video.published_at }
export function dateOf(value?: WireDate | null) { if (value === undefined || value === null || value === '') return undefined; const date = new Date(value); return Number.isNaN(date.getTime()) ? undefined : date }
export function formatTime(value: WireDate | null | undefined, zone: string, date = false) {
  const time = dateOf(value)
  return time ? new Intl.DateTimeFormat('en', { ...(zone === 'local' ? {} : { timeZone: zone }), ...(date ? { month: 'short', day: 'numeric' } : {}), hour: 'numeric', minute: '2-digit' }).format(time) : 'Time to be announced'
}
export function relativeTime(value?: WireDate | null) {
  const date = dateOf(value)
  if (!date) return 'Time to be announced'
  const seconds = (date.getTime() - Date.now()) / 1000
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  for (const [unit, scale] of [['year', 31536000], ['month', 2592000], ['day', 86400], ['hour', 3600], ['minute', 60]] as const) if (Math.abs(seconds) >= scale) return formatter.format(Math.round(seconds / scale), unit)
  return 'just now'
}
export function formatCount(count: number | string | null | undefined) { return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(count) || 0) }
export function duration(value?: number | null) { if (!value) return ''; const seconds = Math.max(0, Math.floor(value)); return [Math.floor(seconds / 3600), Math.floor(seconds % 3600 / 60), seconds % 60].filter((_, i) => i > 0 || seconds >= 3600).map((v, i) => i === 0 ? String(v) : String(v).padStart(2, '0')).join(':') }
export function topicName(value?: string | null) { return value?.replaceAll('_', ' ') || 'Stream' }
