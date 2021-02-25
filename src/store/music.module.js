/* eslint-disable no-shadow */
// import api from "@/utils/backend-api";
import { MUSIC_PLAYBACK_MODE, MUSIC_PLAYER_STATE } from "@/utils/consts";

const initialState = {
    currentId: 0,
    playId: 0, // used to key the video so playing the same video can increase.
    playlist: [],
    state: MUSIC_PLAYER_STATE.PAUSED,
    mode: MUSIC_PLAYBACK_MODE.LOOP,
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
    addSong(state, song) {
        state.playlist.push(song);
    },
    removeSong(state, index) {
        state.playlist.splice(index, 1);
        if (state.playlist.length === 0) {
            // empty playlist
            this.resetState(state);
            return;
        }
        state.playId += 1;
        if (state.currentId === index && state.currentId === state.playlist.length) {
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
            if (state.mode === MUSIC_PLAYBACK_MODE.SHUFFLE)
                state.currentId = Math.floor(Math.random() * state.playlist.length);
        }
    },
    resetState(state) {
        Object.assign(state, initialState);
    },
    nextSong(state) {
        switch (state.mode) {
            case MUSIC_PLAYBACK_MODE.NATURAL:
            case MUSIC_PLAYBACK_MODE.LOOP:
                this.nextSongNaturally(state);
                return;
            case MUSIC_PLAYBACK_MODE.LOOPONE:
                state.playId += 1;
                state.state = MUSIC_PLAYER_STATE.PAUSED;
                return;
            case MUSIC_PLAYBACK_MODE.SHUFFLE:
                state.currentId = Math.floor(Math.random() * state.playlist.length);
                break;
            default:
        }
    },
    nextSongNaturally(state) {
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
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
