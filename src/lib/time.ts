import { intlLocale, type Translator } from "@/lib/i18n"
import type { WireDate } from "@/lib/types"

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const formatters = new Map<string, Intl.DateTimeFormat>()

function dateFormat(locale: string, options: Intl.DateTimeFormatOptions) {
  const key = `${locale}|${JSON.stringify(options)}`
  let fmt = formatters.get(key)
  if (!fmt) {
    fmt = new Intl.DateTimeFormat(locale, options)
    formatters.set(key, fmt)
  }
  return fmt
}

const relativeFormatters = new Map<string, Intl.RelativeTimeFormat>()

function relative(locale: string, ms: number): string {
  let fmt = relativeFormatters.get(locale)
  if (!fmt) {
    fmt = new Intl.RelativeTimeFormat(locale, { numeric: "always" })
    relativeFormatters.set(locale, fmt)
  }
  const abs = Math.abs(ms)
  if (abs < HOUR) return fmt.format(Math.round(ms / MINUTE), "minute")
  return fmt.format(Math.round(ms / HOUR), "hour")
}

/** `1:02:03` or `4:05`. */
export function formatDuration(ms: number): string {
  const negative = ms < 0
  const secs = Math.floor(Math.abs(ms) / 1000)
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  const mm = h ? String(m).padStart(2, "0") : String(m)
  return `${negative ? "-" : ""}${h ? `${h}:` : ""}${mm}:${String(s).padStart(2, "0")}`
}

/** Compact distance for the sidebar: `12m`, `3h`. */
export function formatShortDistance(time: WireDate, now: number): string {
  const mins = Math.abs(new Date(time).getTime() - now) / MINUTE
  return mins >= 60 ? `${Math.round(mins / 60)}h` : `${Math.round(mins)}m`
}

function clock(locale: string, date: Date): string {
  return dateFormat(locale, { hour: "numeric", minute: "2-digit" }).format(date)
}

function calendarDay(locale: string, date: Date, now: number): string {
  const sameYear = date.getFullYear() === new Date(now).getFullYear()
  return dateFormat(locale, {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  }).format(date)
}

/**
 * Human distance to a video's time.
 *
 * Within a day it is relative ("in 2 hours (8:00 PM)", "3 hours ago");
 * further out it is a calendar date with the local clock time.
 */
export function formatDistance(
  time: WireDate | null | undefined,
  { t, lang }: Translator,
  now: number,
  { future = false }: { future?: boolean } = {}
): string {
  if (!time) return "?"
  const date = new Date(time)
  const diff = date.getTime() - now
  const locale = intlLocale(lang)

  if (Math.abs(diff) < MINUTE) return t("time.soon")
  // An upcoming stream that is late is still "soon", never "5 minutes ago".
  if (future && diff < 0) return t("time.soon")

  const time12 = clock(locale, date)
  if (diff > 0) {
    const when =
      diff < DAY ? relative(locale, diff) : calendarDay(locale, date, now)
    return t("time.diff_future_date", [when, time12])
  }
  if (-diff < DAY) return t("time.distance_past_date", [relative(locale, diff)])
  return `${calendarDay(locale, date, now)} (${time12})`
}

/** Full local time plus Japan time, for tooltips. */
export function formatAbsolute(
  time: WireDate | null | undefined,
  lang: string
): string {
  if (!time) return ""
  const date = new Date(time)
  const locale = intlLocale(lang)
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }
  const local = dateFormat(locale, options).format(date)
  const tokyo = dateFormat(locale, {
    ...options,
    timeZone: "Asia/Tokyo",
  }).format(date)
  return local === tokyo ? local : `${local}\n${tokyo}`
}

const countFormatters = new Map<string, Intl.NumberFormat>()

/** `12.3K`, localized. */
export function formatCount(n: number | string, lang: string): string {
  const locale = intlLocale(lang)
  let fmt = countFormatters.get(locale)
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, {
      notation: "compact",
      maximumSignificantDigits: 3,
    })
    countFormatters.set(locale, fmt)
  }
  return fmt.format(Number(n))
}
