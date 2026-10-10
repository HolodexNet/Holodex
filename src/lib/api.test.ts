import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, isYouTubeVideo, normalizeSearch, queryString, request, videoLink } from './api'
import type { Video } from './types'

afterEach(() => vi.unstubAllGlobals())
describe('v3 response contracts', () => {
  it('decodes raw search hits, absent channels, approximate totals, and array cursors', () => {
    const sort = [1791504000000, 'abcdefghijk']
    const page = normalizeSearch({ hits: { total: { value: 10000, relation: 'gte' }, hits: [{ _id: 'abcdefghijk', _source: { title: 'Concert', type: 'stream', status: 'past' } as Video, sort }] }, took: 3 })
    expect(page.items[0].id).toBe('abcdefghijk')
    expect(page.items[0].channel.name).toBe('Unknown channel')
    expect(page.approximate).toBe(true)
    expect(page.cursor).toBe(sort)
  })
  it('ends empty search pagination without manufacturing a cursor', () => {
    expect(normalizeSearch({ hits: { total: 0, hits: [] } })).toMatchObject({ items: [], total: 0, cursor: undefined })
  })
  it('encodes opaque GET cursors without changing their contents', () => {
    const cursor = 'opaque+/=cursor'
    const query = new URLSearchParams(queryString({ nextPage: cursor, org: 'Phase Connect', offset: 0, absent: undefined }))
    expect(query.get('nextPage')).toBe(cursor)
    expect(query.get('offset')).toBe('0')
    expect(query.has('absent')).toBe(false)
  })
})
describe('transport and external watch links', () => {
  it('reads successful JSON scalars and empty responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response('1', { headers: { 'content-type': 'application/json' } })).mockResolvedValueOnce(new Response(null, { status: 204 })))
    expect(await request('/count')).toBe(1)
    expect(await request('/empty')).toBe('')
  })
  it('handles plain text rate limits and carries Retry-After', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Too many requests', { status: 429, headers: { 'Retry-After': '120' } })))
    await expect(request('/limited')).rejects.toMatchObject({ status: 429, retryAfter: 120, message: 'Too many requests' })
  })
  it('handles JSON access denials and does not surface HTML to the user', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response('{"error":"Illegal Access."}', { status: 403, headers: { 'content-type': 'application/json' } })).mockResolvedValueOnce(new Response('<html>proxy failure</html>', { status: 502 })))
    await expect(request('/denied')).rejects.toMatchObject({ status: 403, message: 'Illegal Access.' })
    await expect(request('/proxy')).rejects.toThrow(ApiError)
  })
  it('does not embed placeholders, Twitch IDs, or unsafe external links', () => {
    const video = { id: 'abcdefghijk', type: 'stream', platform: 'youtube', channel: { id: 'UC1', name: 'Talent' }, status: 'live' } as Video
    expect(isYouTubeVideo(video)).toBe(true)
    expect(videoLink(video)).toBe('https://www.youtube.com/watch?v=abcdefghijk')
    expect(isYouTubeVideo({ ...video, type: 'placeholder' })).toBe(false)
    expect(isYouTubeVideo({ ...video, platform: 'twitch' })).toBe(false)
    expect(videoLink({ ...video, type: 'placeholder', link: 'javascript:alert(1)' })).toBeUndefined()
    expect(videoLink({ ...video, type: 'placeholder', link: 'https://example.com/event' })).toBe('https://example.com/event')
  })
})
