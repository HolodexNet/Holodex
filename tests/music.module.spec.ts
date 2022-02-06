import { expect } from "chai";
import { shallowMount } from "@vue/test-utils";
import music from "@/store/music.module";
import { MUSIC_PLAYBACK_MODE, MUSIC_PLAYER_STATE } from "@/utils/consts";

const song = {
  name: "song1"
}

const song2 = {
  name: "song2"
}

const song3 = {
  name: "song3"
}

// Prepare mocking global functions
// Doing this inside describe() hangs mocha
const _Math_random = Math.random
const _Date_now = Date.now
const _console_log = console.log

describe("music.module", () => {
  let state = {}
  beforeEach(() => {
    state = {}
  })

  describe("mutations", () => {

    describe("addSong", () => {
      beforeEach(() => {
        state.playlist = [song]
      })

      it("adds songs to playlist if given array of songs", () => {
        music.mutations.addSong(state, [song2, song3])
        expect(state.playlist).to.deep.equal([song, song2, song3])
      })

      it("adds song to playlist if given song object", () => {
        music.mutations.addSong(state, song2)
        expect(state.playlist).to.deep.equal([song, song2])
      })

      it("makes sure currentId is not larger than playlist length", () => {
        state.playlist = [song]
        state.currentId = 3
        music.mutations.addSong(state, song2)
        expect(state.currentId).to.equal(1)
      })

      it("sets isOpen and addedAnimation", () => {
        music.mutations.addSong(state, song2)
        expect(state.isOpen).to.equal(true)
        expect(state.addedAnimation).to.equal(true)
      })
    })

    describe("removeSong", () => {
      beforeEach(() => {
        state.playlist = [song, song2, song3]
      })

      it("removes song from playlist", () => {
        music.mutations.removeSong(state, 1)
        expect(state.playlist).to.deep.equal([song, song3])
      })

      it("updates currentId to match changed playlist length", () => {
        state.currentId = 2
        music.mutations.removeSong(state, 1)
        expect(state.currentId).to.equal(1)
      })

      describe("current song is last song and last song was removed", () => {
        beforeEach(() => {
          state.currentId = 2
        })

        it("loops around if playback mode is loop", () => {
          state.mode = MUSIC_PLAYBACK_MODE.LOOP
          music.mutations.removeSong(state, 2)
          expect(state.currentId).to.equal(0)

          state.mode = MUSIC_PLAYBACK_MODE.LOOPONE
          music.mutations.removeSong(state, 2)
          expect(state.currentId).to.equal(0)
        })

        it("resets and pauses if playback mode is natural", () => {
          state.mode = MUSIC_PLAYBACK_MODE.NATURAL
          music.mutations.removeSong(state, 2)
          expect(state.currentId).to.equal(0)
          expect(state.state).to.equal(MUSIC_PLAYER_STATE.PAUSED)
        })

        it("randomises song if playback mode is shuffle", () => {
          state.mode = MUSIC_PLAYBACK_MODE.SHUFFLE
          Math.random = () => 0.999
          music.mutations.removeSong(state, 2)
          Math.random = _Math_random
          expect(state.currentId).to.equal(1)
        })

        it("increments playId", () => {
          state.playId = 1
          music.mutations.removeSong(state, 2)
          expect(state.playId).to.equal(2)
        })

        it("does not change state.currentId by default", () => {
          state.mode = null
          music.mutations.removeSong(state, 2)
          expect(state.currentId).to.equal(2)
        })
      })

      describe("current song is removed", () => {
        it("increments playId", () => {
          state.currentId = 1
          state.playId = 1
          music.mutations.removeSong(state, 1)
          expect(state.playId).to.equal(2)
        })

        it("shuffles song if playback mode is shuffle", () => {
          state.currentId = 1
          state.mode = MUSIC_PLAYBACK_MODE.SHUFFLE
          Math.random = () => 0.0001
          music.mutations.removeSong(state, 1)
          Math.random = _Math_random
          expect(state.currentId).to.equal(0)
        })
      })
    })

    describe("nextSong", () => {
      beforeEach(() => {
        state.playlist = [song, song2, song3]
        state.playId = 2
        console.log = () => {} // SHHHH I'm testing here
      })

      afterEach(() => {
        console.log = _console_log
      })

      it("ignores next song request if <4s since last auto-advance", () => {
        state.currentId = 1
        state.lastNextSong = 1000
        Date.now = () => state.lastNextSong + 3000 
        music.mutations.nextSong(state, { isAuto: true, breakLoop: false })
        expect(state.currentId).to.equal(1)
        Date.now = _Date_now
      })

      it("updates state.lastNextSong", () => {
        Date.now = () => 3
        music.mutations.nextSong(state, {})
        expect(state.lastNextSong).to.equal(3)
        Date.now = _Date_now
      })

      it("NATURAL: selects next song, not last song", () => {
        state.currentId = 1
        state.mode = MUSIC_PLAYBACK_MODE.NATURAL
        music.mutations.nextSong(state, {})
        expect(state.currentId).to.equal(2)
        expect(state.playId).to.equal(3)
        expect(state.state).to.equal(MUSIC_PLAYER_STATE.PLAYING)
      })

      it("NATURAL: selects next song, last song", () => {
        state.currentId = 2
        state.mode = MUSIC_PLAYBACK_MODE.NATURAL
        music.mutations.nextSong(state, {})
        expect(state.currentId).to.equal(2)
        expect(state.playId).to.equal(2)
        expect(state.state).to.equal(MUSIC_PLAYER_STATE.PAUSED)
      })

      it("LOOP: selects next song, not last song", () => {
        state.currentId = 1
        state.mode = MUSIC_PLAYBACK_MODE.LOOP
        music.mutations.nextSong(state, {})
        expect(state.currentId).to.equal(2)
        expect(state.playId).to.equal(3)
        expect(state.state).to.equal(MUSIC_PLAYER_STATE.PLAYING)
      })

      it("LOOP: selects next song, last song", () => {
        state.currentId = 2
        state.mode = MUSIC_PLAYBACK_MODE.LOOP
        music.mutations.nextSong(state, {})
        expect(state.currentId).to.equal(0)
        expect(state.playId).to.equal(3)
      })

      it("LOOPONE: increments playId and nothing more", () => {
        state.currentId = 1
        state.mode = MUSIC_PLAYBACK_MODE.LOOPONE
        music.mutations.nextSong(state, {})
        expect(state.currentId).to.equal(1)
        expect(state.playId).to.equal(3)
      })

      it("LOOPONE: breakloop = true behaves like LOOP", () => {
        state.currentId = 1
        state.mode = MUSIC_PLAYBACK_MODE.LOOPONE
        music.mutations.nextSong(state, { breakLoop: true })
        expect(state.currentId).to.equal(2)
        expect(state.playId).to.equal(3)
      })

      it("SHUFFLE: shuffles song", () => {
        state.currentId = 1
        state.mode = MUSIC_PLAYBACK_MODE.SHUFFLE
        Math.random = () => 0.001
        music.mutations.nextSong(state, {})
        expect(state.currentId).to.equal(0)
        expect(state.playId).to.equal(3)
        Math.random = _Math_random
      })
    })

    describe("prevSong", () => {
      beforeEach(() => {
        state.playlist = [song, song2, song3]
        state.playId = 2
      })

      it("selects previous song, current song not first", () => {
        state.currentId = 1
        state.mode = MUSIC_PLAYBACK_MODE.NATURAL
        music.mutations.prevSong(state)
        expect(state.currentId).to.equal(0)
        expect(state.playId).to.equal(3)
      })

      it("selects previous song, current song first", () => {
        state.currentId = 0
        state.mode = MUSIC_PLAYBACK_MODE.NATURAL
        music.mutations.prevSong(state)
        expect(state.currentId).to.equal(state.playlist.length - 1)
        expect(state.playId).to.equal(3)
      })

      it("shuffles song if shuffle mode is on", () => {
        state.currentId = 2
        state.playId = 2
        state.mode = MUSIC_PLAYBACK_MODE.SHUFFLE
        Math.random = () => 0.001
        music.mutations.prevSong(state)
        expect(state.currentId).to.equal(0)
        Math.random = _Math_random
      })
    })
  })
});
