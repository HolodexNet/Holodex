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

interface ParsedTime {
  seconds: number
  /** Whether hours were written, rather than only minutes and seconds. */
  hasHours: boolean
}

const HOUR_WORDS = "hours|hour|hrs|hr|h|時間|時|小时|小時|시간"
const MINUTE_WORDS = "minutes|minute|mins|min|m|分钟|分鐘|分|분"
const SECOND_WORDS = "seconds|second|secs|sec|s|秒钟|秒鐘|秒|초"
const WORDS = new RegExp(
  `^(?:(\\d+)\\s*(?:${HOUR_WORDS}))?\\s*(?:(\\d+)\\s*(?:${MINUTE_WORDS}))?\\s*(?:(\\d+)\\s*(${SECOND_WORDS})?)?$`
)
/** Past this, an end isn't plausibly the same song having carried on into the next hour. */
const LONGEST_SONG_ACROSS_HOURS = 20 * 60

/**
 * Whatever a keyboard, an input method or a copied line calls these. NFKC folds the
 * full-width forms, and the rest are the dashes and primes it leaves alone.
 */
function foldTimeText(input: string): string {
  return input
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[−–—―ー‐‑]/g, "-")
    .replace(/′′|″|"/g, "")
    .replace(/[′';]/g, ":")
    .replace(/^[\s[(<{【「『《〈]+|[\s\])>}】」』》〉]+$/g, "")
    .replace(/\s*:\s*/g, ":")
}

function parseClock(text: string): ParsedTime | null {
  const match = /^(\d*):(\d*)(?::(\d*))?(?:[.,]\d+)?$/.exec(text)
  if (!match) return null
  const parts = match.slice(1).filter((part) => part !== undefined)
  if (parts.every((part) => !part)) return null
  // Only the leftmost part may run over: 75:00 is fine, 1:75 is a typo.
  if (parts.slice(1).some((part) => part.length > 2 || Number(part) >= 60))
    return null
  return {
    seconds: parts.reduce((total, part) => total * 60 + Number(part || 0), 0),
    hasHours: parts.length === 3 && !!parts[0],
  }
}

/** Digits alone are seconds, as in `+30`. */
function parseAbsolute(text: string): ParsedTime | null {
  // A phone's number pad offers a dot or a comma where a colon would go.
  if (/^\d+(?:[.,]\d*){1,2}$/.test(text))
    return parseClock(text.replace(/[.,]/g, ":"))
  if (text.includes(":")) return parseClock(text)
  const words = WORDS.exec(text)
  if (!words || !(words[1] || words[2] || words[3])) return null
  const [, hours, minutes, rest, restUnit] = words
  // "1h30" is an hour and a half, and "3m20" is three minutes twenty.
  const restIsMinutes = !restUnit && !!hours && !minutes
  return {
    seconds:
      Number(hours ?? 0) * 3600 +
      Number((restIsMinutes ? rest : minutes) ?? 0) * 60 +
      (restIsMinutes ? 0 : Number(rest ?? 0)),
    hasHours: !!hours,
  }
}

/**
 * An end can't come before its start, so on a long stream `9:30` typed for a song
 * starting at 1:05:30 can only mean 1:09:30. Nothing is assumed beyond that, so a
 * time further off stays what it says and gets pointed out as being out of order.
 */
function inferHours(seconds: number, after: number): number {
  if (seconds > after || seconds >= 3600) return seconds
  const hours = Math.floor((after - seconds) / 3600) + 1
  const candidate = seconds + hours * 3600
  return candidate - after <= LONGEST_SONG_ACROSS_HOURS ? candidate : seconds
}

export interface TimeContext {
  /** What `+` and `-` count from. */
  base?: number
  /** What this has to come after, which can settle an hour that was left out. */
  after?: number
  /** Nothing past this exists, such as the end of the video. */
  max?: number
}

export type TimeReading =
  /** Nothing to go on yet, including a lone sign on its way to being `+30`. */
  | { kind: "empty" }
  | { kind: "invalid" }
  | { kind: "time"; seconds: number; clamped: boolean }

function resolveTime(text: string, context: TimeContext): number | null {
  const relative = /^([+-])\s*(.+)$/.exec(text)
  if (relative) {
    const from = context.base
    if (from === undefined) return null
    const amount = parseAbsolute(relative[2])
    if (!amount) return null
    return Math.max(
      0,
      relative[1] === "+" ? from + amount.seconds : from - amount.seconds
    )
  }
  const parsed = parseAbsolute(text)
  if (!parsed) return null
  return context.after !== undefined && !parsed.hasHours
    ? inferHours(parsed.seconds, context.after)
    : parsed.seconds
}

/**
 * Reads a time however someone might give one: `1:02:03`, `3m20s`,
 * `1時間2分3秒`, `12.34` from a phone's number pad, or a copied `[12:34]`. `+30` and `-1:00` are relative, see `TimeContext`.
 */
export function readTime(
  input: string,
  context: TimeContext = {}
): TimeReading {
  const text = foldTimeText(input)
  if (!text || text === "+" || text === "-") return { kind: "empty" }
  const seconds = resolveTime(text, context)
  if (seconds === null) return { kind: "invalid" }
  const clamped = !!context.max && seconds > context.max
  return {
    kind: "time",
    seconds: clamped ? context.max! : seconds,
    clamped,
  }
}

/** Just the number, for when there's nobody to explain anything to. */
export function parseTimecode(input: string, base?: number): number | null {
  const reading = readTime(input, { base })
  return reading.kind === "time" ? reading.seconds : null
}

/** How much one step moves each part of a time, counted from the right. */
export const SEGMENT_SECONDS: readonly number[] = [1, 60, 3600]

/** Which part of `1:02:03` the caret is in, from the right: 0 is the seconds. */
export function timeSegmentAt(text: string, caret: number): number {
  return Math.min(text.slice(caret).split(":").length - 1, 2)
}

/** Where a part of a time sits in its text, to select it again after a step. */
export function timeSegmentRange(
  text: string,
  fromRight: number
): [number, number] {
  const parts = text.split(":")
  const index = Math.max(0, parts.length - 1 - fromRight)
  const start = parts
    .slice(0, index)
    .reduce((total, part) => total + part.length + 1, 0)
  return [start, start + parts[index].length]
}
