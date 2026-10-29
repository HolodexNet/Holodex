// Match both the IANA zone and its offset at the timestamp. In particular,
// Paris alternates between CET and CEST; an offset alone cannot identify a zone.
const TIME_ZONE_ABBREVIATIONS: Record<string, Record<string, string>> = {
  "Asia/Tokyo": { "GMT+09:00": "JST" },
  "Asia/Seoul": { "GMT+09:00": "KST" },
  "Asia/Taipei": { "GMT+08:00": "CST" },
  "Asia/Shanghai": { "GMT+08:00": "CST" },
  "Europe/Paris": { "GMT+01:00": "CET", "GMT+02:00": "CEST" },
}

const offsetFormatters = new Map<string, Intl.DateTimeFormat>()

/** Preserve localized date parts while giving popular zones consistent labels. */
export function formatWithTimeZoneAbbreviation(
  formatter: Intl.DateTimeFormat,
  date: Date
): string {
  // Resolving also handles aliases and the browser's local zone.
  const timeZone = formatter.resolvedOptions().timeZone
  const abbreviations = TIME_ZONE_ABBREVIATIONS[timeZone]
  if (!abbreviations) return formatter.format(date)

  let offsetFormatter = offsetFormatters.get(timeZone)
  if (!offsetFormatter) {
    offsetFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "longOffset",
    })
    offsetFormatters.set(timeZone, offsetFormatter)
  }
  const offset = offsetFormatter
    .formatToParts(date)
    .find((part) => part.type === "timeZoneName")?.value
  const abbreviation = offset && abbreviations[offset]
  if (!abbreviation) return formatter.format(date)

  return formatter
    .formatToParts(date)
    .map((part) => (part.type === "timeZoneName" ? abbreviation : part.value))
    .join("")
}
