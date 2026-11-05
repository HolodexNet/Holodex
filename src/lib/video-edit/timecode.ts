/** Japanese comments and keyboards often produce full-width digits and colons. */
export function toHalfWidth(text: string): string {
  return text.replace(/[０-９：]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0xfee0)
  )
}

const pad = (value: number) => String(value).padStart(2, "0")

/** `1:02:03`, or `4:05` for anything under an hour. */
export function formatTimecode(seconds: number): string {
  const total = Math.max(0, Math.round(seconds))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const rest = total % 60
  return hours
    ? `${hours}:${pad(minutes)}:${pad(rest)}`
    : `${minutes}:${pad(rest)}`
}

function parseAbsolute(text: string, digitsAreSeconds: boolean): number | null {
  if (/^\d+(:\d{1,2}){1,2}$/.test(text)) {
    const parts = text.split(":").map(Number)
    if (parts.slice(1).some((part) => part >= 60)) return null
    return parts.reduce((total, part) => total * 60 + part, 0)
  }
  if (/^\d+$/.test(text)) {
    if (digitsAreSeconds) return Number(text)
    // Times typed without colons read from the right: 12345 is 1:23:45.
    const seconds = Number(text.slice(-2))
    const minutes = Number(text.slice(-4, -2) || 0)
    const hours = Number(text.slice(0, -4) || 0)
    return hours * 3600 + minutes * 60 + seconds
  }
  const units = /^(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+)s)?$/.exec(text)
  if (units && (units[1] || units[2] || units[3]))
    return (
      Number(units[1] ?? 0) * 3600 +
      Number(units[2] ?? 0) * 60 +
      Number(units[3] ?? 0)
    )
  return null
}

/**
 * Reads a time as someone would type it: `1:02:03`, `12345`, `3m20s`. With a
 * `base`, `+30` and `-1:00` are relative to it, so "end = start + 4 minutes" is
 * as easy as typing `+4:00` while the field still reads relative to `base`.
 */
export function parseTimecode(input: string, base?: number): number | null {
  const text = toHalfWidth(input).trim().toLowerCase()
  if (!text) return null
  const relative = /^([+-])\s*(.+)$/.exec(text)
  if (relative) {
    if (base === undefined) return null
    const amount = parseAbsolute(relative[2], true)
    if (amount === null) return null
    return Math.max(0, relative[1] === "+" ? base + amount : base - amount)
  }
  return parseAbsolute(text, false)
}
