import assert from "node:assert/strict"
import test from "node:test"

// consts.ts reads window.location as it loads.
globalThis.window = { location: { origin: "" } }
const { formatMusicPlaylist } = await import("../src/lib/musicdex/format.ts")

const format = (id) => formatMusicPlaylist({ id, title: "", type: "sgp" })

test("random org covers and originals get a Best of jacket", () => {
  const formatted = format(":mv[org=Hololive,sort=random]")
  assert.equal(formatted.bestOf, "Hololive")
  assert.equal(formatted.title, "Best of Hololive")
  assert.equal(formatted.radio, false)
})

test("the org name survives spaces in either spelling", () => {
  for (const org of ["Twitch Independents", "Twitch%20Independents"]) {
    assert.equal(
      format(`:mv[org=${org},sort=random]`).bestOf,
      "Twitch Independents"
    )
  }
})

test("the all-organizations scope uses its display name", () => {
  const formatted = format(":mv[org=All_Vtubers,sort=random]")
  assert.equal(formatted.bestOf, "All Vtubers")
  assert.equal(formatted.title, "Best of All Vtubers")
})

test("underscores that belong to an org name are kept", () => {
  assert.equal(format(":mv[org=Marbl_s,sort=random]").bestOf, "Marbl_s")
})

test("other generated playlists keep the standard artwork", () => {
  for (const id of [
    ":mv[org=Hololive]",
    ":mv[sort=random]",
    ":weekly[org=Hololive]",
    ":latest[org=Hololive,sort=random]",
    "a-community-playlist",
  ]) {
    assert.equal(format(id).bestOf, undefined, id)
  }
})
