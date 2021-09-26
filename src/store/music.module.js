/* eslint-disable no-shadow */
import { MUSIC_PLAYBACK_MODE, MUSIC_PLAYER_STATE } from "@/utils/consts";

const initialState = {
    currentId: 0,
    playId: 0, // used to key the video so playing the same video can increase.
    lastNextSong: 0,
    playlist: [],
    mugenlist: [],
    state: MUSIC_PLAYER_STATE.PAUSED,
    mode: MUSIC_PLAYBACK_MODE.LOOP,
    mugen: false,

    isOpen: false,
    addedAnimation: false, // state keeping for bouncing the icon.
};

export const state = { ...initialState };

const getters = {
    currentSong(state) {
        if (!state.mugen) {
            if (state.playlist && state.playlist.length > 0 && state.currentId < state.playlist.length) {
                return { playId: state.playId, sid: state.currentId, song: state.playlist[state.currentId] };
            }
        } else {
            if (state.mugenlist && state.mugenlist.length > 0 && state.currentId < state.mugenlist.length) {
                return { playId: state.playId, sid: state.currentId, song: state.mugenlist[state.currentId] };
            }
                setTimeout(() => ({ playId: state.playId, sid: state.currentId, song: state.mugenlist[state.currentId] }), 2000);
        }
        return null;
    },
    canPlay(state) {
        if (!state.mugen) {
            return state.playlist.length > 0;
        }
            return state.mugenlist.length > 0;
    },
};

const actions = {
    skipToSong({ state, commit }, song) {
        commit("addSong", song);
        commit("openBar");
        commit("skipTo", state.playlist.length - 1);
        commit("play");
    },
};

const mutations = {
    openBar(state) {
        state.isOpen = true;
    },
    closeBar(state) {
        state.isOpen = false;
    },
    addSong(state, song) {
        if (!state.mugen) {
            if (Array.isArray(song)) state.playlist.push(...song);
            else state.playlist.push(song);
            // not sure why it started getting stuck.
            if (state.currentId >= state.playlist.length) state.currentId = state.playlist.length - 1;
            state.isOpen = true;
            state.addedAnimation = true;
        } else {
            if (Array.isArray(song)) state.mugenlist.push(...song);
            else state.mugenlist.push(song);
            if (state.currentId >= state.mugenlist.length) state.currentId = state.mugenlist.length - 1;
            state.isOpen = true;
            state.addedAnimation = true;
        }
    },
    removeSong(state, index) {
        if (index < state.currentId) state.currentId -= 1;
        if (!state.mugen) {
            state.playlist.splice(index, 1);
        } else {
            state.mugenlist.splice(index, 1);
        }

        if (state.playlist.length === 0) {
            // empty playlist
            Object.assign(state, initialState);
            return;
        }
        if (state.currentId === index && state.currentId === state.playlist.length && !state.mugen) {
            state.playId += 1;
            // if the removed thing is the currently playing, normally it's okay - we'll just automatically
            // switch currentSong to NEXT song.
            // however, if the removed thing causes the currentId to go out of bounds
            // we'll have to loop around.
            switch (
                state.mode // last song in the list got removed, what now?
            ) {
                case MUSIC_PLAYBACK_MODE.LOOP: // loop - go play first song
                case MUSIC_PLAYBACK_MODE.LOOPONE:
                    state.currentId = 0;
                    return;
                case MUSIC_PLAYBACK_MODE.NATURAL: // natural: stop playing.
                    state.currentId = 0;
                    state.state = MUSIC_PLAYER_STATE.PAUSED;
                    return;
                case MUSIC_PLAYBACK_MODE.SHUFFLE:
                    state.currentId = Math.floor(Math.random() * state.playlist.length);
                    return;
                default:
                    return;
            }
        }
        if (state.currentId === index && !state.mugen) {
            state.playId += 1;
            if (state.mode === MUSIC_PLAYBACK_MODE.SHUFFLE) {
                state.currentId = Math.floor(Math.random() * state.playlist.length);
            }
        }
    },
    resetState(state) {
        Object.assign(state, initialState);
    },
    nextSong(state, { isAuto = false, breakLoop = false }) {
        let { mode } = state;
        console.log("Received next song request, time since last auto-advance: ", Date.now() - state.lastNextSong);
        if (isAuto && !breakLoop && Date.now() - state.lastNextSong < 4000) {
            console.log("Next song request is ignored, has not been 4s since last auto-advance");
            return;
        }
        console.log("Next song request is granted, advancing");
        if (breakLoop && mode === MUSIC_PLAYBACK_MODE.LOOPONE) mode = MUSIC_PLAYBACK_MODE.LOOP;
        // will always move the playhead to a new song (or try to)

        state.lastNextSong = Date.now();

        if (!state.mugen) {
            switch (mode) {
                case MUSIC_PLAYBACK_MODE.NATURAL:
                case MUSIC_PLAYBACK_MODE.LOOP:
                    /* next song naturally */
                    if (state.currentId + 1 === state.playlist.length) {
                        if (mode === MUSIC_PLAYBACK_MODE.LOOP) {
                            state.currentId = 0;
                            state.playId += 1;
                        } else if (mode === MUSIC_PLAYBACK_MODE.NATURAL) state.state = MUSIC_PLAYER_STATE.PAUSED;
                    } else {
                        state.currentId += 1;
                        state.playId += 1;
                        state.state = MUSIC_PLAYER_STATE.PLAYING;
                    }
                    return;
                case MUSIC_PLAYBACK_MODE.LOOPONE:
                    state.playId += 1;
                    // state.state = MUSIC_PLAYER_STATE.PAUSED;
                    return;
                case MUSIC_PLAYBACK_MODE.SHUFFLE:
                    state.currentId = Math.floor(Math.random() * state.playlist.length);
                    state.playId += 1;
                    break;
                default:
            }
        } else {
            state.currentId += 1;
            state.playId += 1;
            state.state = MUSIC_PLAYER_STATE.PLAYING;
        }
    },
    prevSong(state) {
        const { mode } = state;
        switch (mode) {
            case MUSIC_PLAYBACK_MODE.NATURAL:
            case MUSIC_PLAYBACK_MODE.LOOP:
            case MUSIC_PLAYBACK_MODE.LOOPONE:
                /* next song naturally */
                if (state.currentId - 1 < 0) {
                    state.currentId = state.playlist.length - 1;
                    state.playId += 1;
                } else {
                    state.currentId -= 1;
                    state.playId += 1;
                    state.state = MUSIC_PLAYER_STATE.PLAYING;
                }
                return;
            case MUSIC_PLAYBACK_MODE.SHUFFLE:
                state.currentId = Math.floor(Math.random() * state.playlist.length);
                state.playId += 1;
                break;
            default:
        }
    },
    cycleMode(state) {
        if (!state.mugen) {
            switch (state.mode) {
                case MUSIC_PLAYBACK_MODE.NATURAL:
                    state.mode = MUSIC_PLAYBACK_MODE.LOOP;
                    break;
                case MUSIC_PLAYBACK_MODE.LOOP:
                    state.mode = MUSIC_PLAYBACK_MODE.LOOPONE;
                    break;
                case MUSIC_PLAYBACK_MODE.LOOPONE:
                    state.mode = MUSIC_PLAYBACK_MODE.SHUFFLE;
                    break;
                case MUSIC_PLAYBACK_MODE.SHUFFLE:
                    state.mode = MUSIC_PLAYBACK_MODE.NATURAL;
                    break;
                default:
                    state.mode = MUSIC_PLAYBACK_MODE.NATURAL;
                }
            } else {
                state.mode = MUSIC_PLAYBACK_MODE.LOOP;
        }
    },
    play(state) {
        state.state = MUSIC_PLAYER_STATE.PLAYING;
    },
    pause(state) {
        state.state = MUSIC_PLAYER_STATE.PAUSED;
    },
    skipTo(state, idx) {
        state.currentId = idx;
        state.state = MUSIC_PLAYER_STATE.PLAYING;
        state.playId += 1;
    },
    stopAddedAnimation(state) {
        state.addedAnimation = false;
    },
    clearPlaylist(state) {
        if (!state.mugen) {
            state.playlist = [];
            state.currentId = 0;
            state.state = MUSIC_PLAYER_STATE.PAUSED;
            state.isOpen = false;
            state.playId += 1;
        } else {
            state.mugenlist = [];
            state.currentId = 0;
            state.playId += 1;
            console.log("FinishclearPlaylist");
        }
    },
    isMugen(state) {
        state.mugen = !state.mugen;
        console.log(`mugenStateChangeTo : ${state.mugen}`);
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
