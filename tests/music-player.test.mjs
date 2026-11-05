import assert from "node:assert/strict"
import test from "node:test"
import { canAutoSkip, useMusicPlayer } from "../src/stores/music-player.ts"

const song = (id) => ({ id, video_id: `video-${id}` })
const skips = (state) =>
  canAutoSkip({
    queue: [],
    playlist: [],
    radio: false,
    repeat: "none",
    ...state,
  })

test("a song skips when another is queued, from any kind of list", () => {
  assert.equal(skips({ queue: [song("b")] }), true)
  assert.equal(skips({ queue: [song("b")], radio: true }), true)
})

test("a song with nothing after it stays put", () => {
  assert.equal(skips({ playlist: [song("a")] }), false)
  assert.equal(skips({ playlist: [song("a"), song("b")] }), false)
})

test("repeat one never leaves the song", () => {
  assert.equal(skips({ queue: [song("b")], repeat: "one" }), false)
})

test("repeat all wraps around unless the failed song is all there is", () => {
  assert.equal(skips({ playlist: [song("a"), song("b")], repeat: "all" }), true)
  assert.equal(skips({ playlist: [song("a")], repeat: "all" }), false)
})

test("an empty radio queue waits for its refill, then skips", () => {
  const player = useMusicPlayer.getState()
  player.playSongs([song("a")], { radio: true })
  assert.equal(canAutoSkip(useMusicPlayer.getState()), false)
  player.appendRadioSongs([song("b")])
  assert.equal(canAutoSkip(useMusicPlayer.getState()), true)
  player.close()
})
