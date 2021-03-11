/* eslint-disable no-shadow */
// import api from "@/utils/backend-api";
import { MUSIC_PLAYBACK_MODE, MUSIC_PLAYER_STATE } from "@/utils/consts";

const initialState = {
    currentId: 0,
    playId: 0, // used to key the video so playing the same video can increase.
    playlist: [],
    state: MUSIC_PLAYER_STATE.PAUSED,
    mode: MUSIC_PLAYBACK_MODE.LOOP,

    isOpen: false,
    addedAnimation: false, // state keeping for bouncing the icon.
};

export const state = { ...initialState };

const getters = {
    currentSong(state) {
        if (state.playlist && state.playlist.length > 0 && state.currentId < state.playlist.length) {
            return state.playlist[state.currentId];
        }
        return null;
    },
    canPlay(state) {
        return state.playlist.length > 0;
    },
};

const actions = {};

const mutations = {
    openBar(state) {
        state.isOpen = true;
    },
    closeBar(state) {
        state.isOpen = false;
    },
    addSong(state, song) {
        state.playlist.push(song);
        state.isOpen = true;
        state.addedAnimation = true;
    },
    removeSong(state, index) {
        if (index < state.currentId) state.currentId -= 1;
        state.playlist.splice(index, 1);
        if (state.playlist.length === 0) {
            // empty playlist
            Object.assign(state, initialState);
            return;
        }
        if (state.currentId === index && state.currentId === state.playlist.length) {
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
        if (state.currentId === index) {
            state.playId += 1;
            if (state.mode === MUSIC_PLAYBACK_MODE.SHUFFLE) {
                state.currentId = Math.floor(Math.random() * state.playlist.length);
            }
        }
    },
    resetState(state) {
        Object.assign(state, initialState);
    },
    nextSong(state, alwaysNew) {
        let { mode } = state;
        // if always new, will always move the playhead to a new song (or try to)
        if (alwaysNew && mode === MUSIC_PLAYBACK_MODE.LOOPONE) mode = MUSIC_PLAYBACK_MODE.LOOP;
        switch (mode) {
            case MUSIC_PLAYBACK_MODE.NATURAL:
            case MUSIC_PLAYBACK_MODE.LOOP:
                /* next song naturally */
                if (state.currentId + 1 === state.playlist.length) {
                    if (state.mode === MUSIC_PLAYBACK_MODE.LOOP) {
                        state.currentId = 0;
                        state.playId += 1;
                    } else if (state.mode === MUSIC_PLAYBACK_MODE.NATURAL) state.state = MUSIC_PLAYER_STATE.PAUSED;
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
    },
    play(state) {
        state.state = MUSIC_PLAYER_STATE.PLAYING;
    },
    pause(state) {
        state.state = MUSIC_PLAYER_STATE.PAUSED;
    },
    skipTo(state, idx) {
        state.currentId = idx;
        state.playId += 1;
    },
    stopAddedAnimation(state) {
        state.addedAnimation = false;
    },
    clearPlaylist(state) {
        state.playlist = [];
        state.state = MUSIC_PLAYER_STATE.PAUSED;
        state.isOpen = false;
        state.playId += 1;
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
