import { describe, expect, it } from 'vitest'
import { DEFAULT_PREFERENCES, validateSaved } from './preferences'

describe('stored preferences', () => {
  it('defaults missing data safely', () => {
    expect(validateSaved(null)).toEqual({ preferences: DEFAULT_PREFERENCES, favorites: [] })
  })
  it('rejects invalid colors, enum values, boolean types, and time zones', () => {
    const data = validateSaved({ preferences: { primary: 'purple', appearance: 'unknown', density: 'huge', view: 'other', thumbnails: 'false', clipLanguage: 'unknown', timeZone: 'Not/AZone' } })
    expect(data.preferences).toEqual(DEFAULT_PREFERENCES)
  })
  it('preserves supported preferences and deduplicates valid favorites', () => {
    const channel = { id: 'UC123', name: 'Talent' }
    const data = validateSaved({ preferences: { primary: '#123456', appearance: 'system', englishNames: false, timeZone: 'Asia/Tokyo' }, favorites: [channel, channel, null, { id: 123 }, { name: 'No ID' }] })
    expect(data.preferences).toMatchObject({ primary: '#123456', appearance: 'system', englishNames: false, timeZone: 'Asia/Tokyo' })
    expect(data.favorites).toEqual([channel])
  })
})
