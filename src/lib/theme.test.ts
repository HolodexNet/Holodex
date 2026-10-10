import { describe, expect, it } from 'vitest'
import { complementaryHue, contrast, deriveTheme, isHex, oklchToHex, PRIMARY_COLORS } from './theme'

describe('adaptive theme', () => {
  const samples = [...PRIMARY_COLORS.map((c) => c.hex), '#000000', '#ffffff', '#ff0000', '#0000ff', '#00ff00', '#123456', '#777777']
  it('validates colors and falls back for malformed input', () => {
    expect(isHex('#abcdef')).toBe(true)
    expect(isHex('red')).toBe(false)
    expect(isHex('#fff')).toBe(false)
    expect(deriveTheme('invalid', true)['--primary']).toBe(PRIMARY_COLORS[0].hex)
  })
  it('keeps every primary button at WCAG AA text contrast', () => {
    for (const primary of samples) for (const dark of [true, false]) {
      const theme = deriveTheme(primary, dark)
      expect(contrast(primary, theme['--primary-foreground'])).toBeGreaterThanOrEqual(4.5)
    }
  })
  it('keeps accent text readable on the brightest dark and darkest light surface', () => {
    for (const primary of samples) for (const dark of [true, false]) {
      const theme = deriveTheme(primary, dark)
      const surface = oklchToHex(dark ? .255 : .945, .009, complementaryHue(primary))
      expect(contrast(theme['--primary-readable'], surface)).toBeGreaterThanOrEqual(4.5)
    }
  })
  it('uses the complementary hue consistently across layered surfaces', () => {
    for (const primary of samples) {
      const hue = complementaryHue(primary)
      expect(hue).toBeGreaterThanOrEqual(0)
      expect(hue).toBeLessThan(360)
      expect(deriveTheme(primary, true)['--background']).toContain(hue.toFixed(2))
      expect(deriveTheme(primary, true)['--background']).not.toBe(deriveTheme(primary, false)['--background'])
    }
    expect(complementaryHue('#f5c542')).not.toBe(complementaryHue('#a78bfa'))
  })
})
