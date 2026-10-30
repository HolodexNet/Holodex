import assert from "node:assert/strict"
import test from "node:test"
import {
  isVideoPlaceholder,
  videoEmbedUrl,
  videoSource,
} from "../src/lib/video-source.ts"

test("native Twitch streams need no placeholder fields", () => {
  const video = { id: "tw:Some_Talent:123456789", type: "stream" }
  const source = videoSource(video)
  assert.deepEqual(source, {
    provider: "twitch",
    channel: "some_talent",
    url: "https://www.twitch.tv/some_talent",
  })
  const embed = new URL(videoEmbedUrl(source, "staging.holodex.net"))
  assert.equal(embed.searchParams.get("channel"), "some_talent")
  assert.equal(embed.searchParams.get("parent"), "staging.holodex.net")
  assert.equal(embed.searchParams.get("autoplay"), "false")
  assert.equal(embed.searchParams.has("video"), false)
  assert.equal(isVideoPlaceholder(video), false)
})

test("native Twitch identity wins over stale placeholder links and categories", () => {
  const video = {
    id: "tw:talent:123",
    type: "placeholder",
    link: "https://example.com",
  }
  assert.equal(videoSource(video).provider, "twitch")
  assert.equal(isVideoPlaceholder(video), false)
})

test("older Twitch external streams remain playable without rewriting their IDs", () => {
  for (const host of ["twitch.tv", "www.twitch.tv", "m.twitch.tv"]) {
    const video = {
      id: "placeholder-id",
      type: "placeholder",
      placeholderType: "external-stream",
      link: `https://${host}/Talent/?ref=holodex`,
    }
    assert.equal(videoSource(video).channel, "talent")
    assert.equal(isVideoPlaceholder(video), false)
  }
})

test("VOD URLs use a video ID, never a live channel or event ID", () => {
  const source = videoSource({
    id: "old-id",
    link: "https://www.twitch.tv/videos/123456",
  })
  assert.equal(source.url, "https://www.twitch.tv/videos/123456")
  const params = new URL(videoEmbedUrl(source, "localhost")).searchParams
  assert.equal(params.get("video"), "v123456")
  assert.equal(params.has("channel"), false)
})

test("events stay placeholders even if their destination is Twitch", () => {
  const event = {
    id: "event",
    type: "placeholder",
    placeholderType: "event",
    link: "https://twitch.tv/talent",
  }
  assert.equal(isVideoPlaceholder(event), true)
  assert.equal(videoSource(event).provider, "external")
  assert.equal(videoEmbedUrl(videoSource(event), "localhost"), null)
  assert.equal(
    isVideoPlaceholder({ ...event, type: "legacy-placeholder" }),
    true
  )
})

test("Twitch detection validates hosts and paths instead of matching substrings", () => {
  for (const link of [
    "https://twitch.tv.example.com/talent",
    "https://example.com/twitch.tv/talent",
    "https://twitch.tv/directory",
    "https://twitch.tv/videos/not-a-number",
    "https://twitch.tv/talent/clip/clip-id",
    "javascript:alert('twitch.tv')",
    "invalid twitch.tv link",
  ]) {
    const source = videoSource({
      id: "placeholder",
      type: "placeholder",
      placeholderType: "external-stream",
      link,
    })
    assert.equal(source.provider, "external", link)
    assert.equal(videoEmbedUrl(source, "localhost"), null)
  }
})

test("future provider IDs and malformed native IDs cannot become YouTube videos", () => {
  for (const id of [
    "future:channel:123",
    "tw:",
    "tw:bad/name:123",
    "tw:talent:123:456",
  ]) {
    assert.deepEqual(videoSource({ id }), { provider: "external", url: null })
  }
})

test("YouTube streams and clips keep their existing destinations", () => {
  for (const type of ["stream", "clip"]) {
    const source = videoSource({ id: "abcdefghijk", type })
    assert.equal(source.url, "https://www.youtube.com/watch?v=abcdefghijk")
    assert.equal(
      videoEmbedUrl(source, "localhost"),
      "https://www.youtube.com/embed/abcdefghijk"
    )
  }
})
