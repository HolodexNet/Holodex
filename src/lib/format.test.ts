import { describe, expect, it } from 'vitest'
import { channelName, dateOf, duration, formatTime, videoDate } from './format'
import { parseVideoId } from '@/pages/multiview'
import type { Video } from './types'
describe('wire dates and video IDs', () => {
  it('supports epoch and ISO dates, with honest missing-time labels', () => {
    expect(dateOf(1791504000000)?.getTime()).toBe(dateOf('2026-10-09T00:00:00Z')?.getTime())
    expect(dateOf('not a date')).toBeUndefined()
    expect(formatTime(null, 'UTC')).toBe('Time to be announced')
  })
  it('uses scheduled time for upcoming streams and actual time for live streams', () => {
    const video = { status: 'upcoming', start_scheduled: 1, start_actual: 2, available_at: 3 } as Video
    expect(videoDate(video)).toBe(1)
    expect(videoDate({ ...video, status: 'live' })).toBe(2)
  })
  it('falls back to the original channel name and formats durations', () => {
    expect(channelName({ id: 'UC1', name: '名前' })).toBe('名前')
    expect(duration(65)).toBe('1:05')
    expect(duration(3661)).toBe('1:01:01')
  })
  it('extracts only valid IDs from YouTube destinations', () => {
    for (const input of ['abcdefghijk', 'https://youtu.be/abcdefghijk?t=12', 'https://www.youtube.com/watch?v=abcdefghijk', 'https://youtube.com/live/abcdefghijk']) expect(parseVideoId(input)).toBe('abcdefghijk')
    expect(parseVideoId('https://example.com/watch?v=abcdefghijk')).toBeUndefined()
    expect(parseVideoId('invalid')).toBeUndefined()
  })
})
