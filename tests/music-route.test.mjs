import assert from "node:assert/strict"
import test from "node:test"
import { isMusicLocation, isMusicPath } from "../src/lib/music-route.ts"

const at = (pathname, hash = "") => ({ pathname, hash })

test("the Musicdex home tabs count as music on both home paths", () => {
  for (const pathname of ["/", "/favorites", "/favorites/"]) {
    for (const hash of ["#music", "#radio", "#playlists"]) {
      assert.equal(isMusicLocation(at(pathname, hash)), true, pathname + hash)
    }
  }
})

test("the video home tabs do not count as music", () => {
  for (const pathname of ["/", "/favorites"]) {
    for (const hash of ["", "#archive", "#clips"]) {
      assert.equal(isMusicLocation(at(pathname, hash)), false, pathname + hash)
    }
  }
})

test("a Musicdex hash means nothing on other pages", () => {
  for (const pathname of ["/settings", "/channel", "/search"]) {
    assert.equal(isMusicLocation(at(pathname, "#radio")), false, pathname)
  }
})

test("music pages count as music whatever their hash", () => {
  for (const pathname of [
    "/music/search",
    "/music/radio/abc",
    "/channel/abc/music",
  ]) {
    assert.equal(isMusicLocation(at(pathname)), true, pathname)
  }
})

// Organization links send music pages to /#music, so the home tabs must stay
// out of this or switching organization would knock the viewer off Radio.
test("isMusicPath leaves the home page out", () => {
  assert.equal(isMusicPath("/"), false)
  assert.equal(isMusicPath("/favorites"), false)
})
