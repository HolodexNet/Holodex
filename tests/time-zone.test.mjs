import assert from "node:assert/strict"
import test from "node:test"
import { formatWithTimeZoneAbbreviation } from "../src/lib/time-zone.ts"

function formatter(timeZone, locale = "en-US") {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  })
}

test("popular Asian zones use consistent abbreviations across UI languages", () => {
  const date = new Date("2026-10-29T13:30:00Z")
  for (const locale of ["en-US", "fr", "ja", "ko", "zh-TW"]) {
    for (const [zone, abbreviation] of [
      ["Asia/Tokyo", "JST"],
      ["Asia/Seoul", "KST"],
      ["Asia/Taipei", "CST"],
      ["Asia/Shanghai", "CST"],
      ["Asia/Chongqing", "CST"],
    ]) {
      const fmt = formatter(zone, locale)
      const expected = fmt
        .formatToParts(date)
        .map((part) =>
          part.type === "timeZoneName" ? abbreviation : part.value
        )
        .join("")
      assert.equal(formatWithTimeZoneAbbreviation(fmt, date), expected)
    }
  }
})

test("Paris changes abbreviations at the actual daylight saving boundaries", () => {
  const fmt = formatter("Europe/Paris")
  for (const [timestamp, abbreviation] of [
    ["2026-03-29T00:59:00Z", "CET"],
    ["2026-03-29T01:00:00Z", "CEST"],
    ["2026-10-25T00:59:00Z", "CEST"],
    ["2026-10-25T01:00:00Z", "CET"],
  ]) {
    assert.ok(
      formatWithTimeZoneAbbreviation(fmt, new Date(timestamp)).endsWith(
        abbreviation
      )
    )
  }
})

test("other zones preserve native formatting in winter and summer", () => {
  for (const zone of [
    "America/Los_Angeles",
    "America/New_York",
    "UTC",
    "Asia/Singapore",
  ]) {
    for (const locale of ["en-US", "fr", "ja"]) {
      const fmt = formatter(zone, locale)
      for (const timestamp of [
        "2026-01-15T12:00:00Z",
        "2026-07-15T12:00:00Z",
      ]) {
        const date = new Date(timestamp)
        assert.equal(
          formatWithTimeZoneAbbreviation(fmt, date),
          fmt.format(date)
        )
      }
    }
  }
})

test("historical offsets outside the mapping retain their native label", () => {
  const date = new Date("1900-01-01T12:00:00Z")
  const fmt = formatter("Europe/Paris")
  assert.equal(formatWithTimeZoneAbbreviation(fmt, date), fmt.format(date))
})
