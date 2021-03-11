<template>
    <v-bottom-sheet
        hide-overlay
        persistent
        no-click-animation
        :value="isOpen"
        :retain-focus="false"
        content-class="music-player-bar"
        v-if="currentSong"
        ref="sheet"
    >
        <!-- <div
                key="musicplayertogglebtn"
                class="music-player-toggle"
                color="info"
                @click="closePlayer"
                style="bottom: 100%; position: absolute"
                v-if="isOpen"
            >
                <div class="music-player-toggle-bg">
                    <v-icon large>{{ icons.mdiMusic }}</v-icon>
                </div>
            </div> -->
        <div
            key="musicplayertogglebtn"
            class="music-player-toggle"
            :class="{ 'error-animation': animateOpenError, 'added-animation': animateAdded }"
            @animationend="
                () => {
                    animateOpenError = false;
                    animateAdded = false;
                }
            "
            color="info"
            @click="tryOpeningPlayer"
            v-if="!isOpen"
        >
            <div class="music-player-toggle-bg">
                <v-icon large>{{ icons.mdiMusic }}</v-icon>
            </div>
        </div>
        <v-slider class="music-progress" hide-details :value="progress" height="3" @change="progressChange" />
        <div class="d-flex justify-space-between pa-2">
            <div class="player-controls">
                <v-btn icon class="mx-1" @click="prevButtonHandler">
                    <v-icon>{{ mdiSkipPrevious }}</v-icon>
                </v-btn>
                <v-btn icon fab @click="playPause" color="primary">
                    <v-icon large>{{ playButtonIcon }}</v-icon>
                </v-btn>
                <v-btn icon class="mx-1" @click="$store.commit('music/nextSong', true)">
                    <v-icon>{{ mdiSkipNext }}</v-icon>
                </v-btn>
                <v-btn icon class="mx-1" @click="$store.commit('music/cycleMode')">
                    <v-icon>{{ shuffleButtonIcon }}</v-icon>
                </v-btn>
                <v-menu
                    :close-on-content-click="false"
                    offset-y
                    top
                    origin="right bottom"
                    transition="slide-y-reverse-transition"
                    content-class="scrollable-music-queue"
                    min-width="30vw"
                    max-width="50vw"
                    v-model="queueMenuOpen"
                >
                    <template v-slot:activator="{ on }">
                        <v-btn
                            color="transparent"
                            elevation="0"
                            :ripple="false"
                            class="queue-btn mx-1 px-1"
                            :class="{ 'added-animation': animateAdded }"
                            @animationend="animateAdded = false"
                            v-on="on"
                            @click="queueMenuOpen = !queueMenuOpen"
                        >
                            <v-icon>{{ icons.mdiPlaylistMusic }}</v-icon>
                            <div class="">({{ playlist.length }})</div>
                        </v-btn>
                    </template>
                    <song-playlist :songs="playlist" :currentId="currentId"></song-playlist>
                </v-menu>
                <v-slide-x-transition>
                    <v-btn
                        small
                        v-if="queueMenuOpen"
                        elevation="0"
                        color="warning"
                        @click="$store.commit('music/clearPlaylist')"
                        ><v-icon left>{{ mdiPlaylistRemove }}</v-icon> Clear</v-btn
                    >
                </v-slide-x-transition>
            </div>
            <v-slide-y-transition>
                <div class="song-info d-flex align-center" :key="'snip' + (currentSong && currentSong.name)">
                    <div class="pr-2">
                        <v-img
                            v-if="currentSong && currentSong.art"
                            :src="currentSong.art.replace('100x100', '50x50')"
                            aspect-ratio="1"
                            height="auto"
                            width="50px"
                        ></v-img>
                    </div>
                    <div>
                        <div class="single-line-clamp text-h6">
                            {{ currentSong.name }}
                        </div>
                        <div class="single-line-clamp">
                            <span class="text-subtitle-2 secondary--text mr-2">{{ currentSong.channel.name }}</span>
                            <span class="text-subtitle-2 text--secondary">({{ currentSong.original_artist }})</span>
                        </div>
                    </div>
                </div>
            </v-slide-y-transition>
            <div class="playlist-buttons align-self-center">
                <v-btn icon large @click="closePlayer">
                    <v-icon>{{ icons.mdiChevronDown }}</v-icon>
                </v-btn>
            </div>
        </div>
        <song-frame
            :videoId="currentSong.video_id"
            :start="currentSong.start"
            :end="currentSong.end"
            :key="currentSong.video_id + playId"
            style="width: 250px; width: 356px"
            @playing="songIsPlaying"
            @paused="songIsPaused"
            @ended="songIsDone"
            @progress="songProgress"
        ></song-frame>
    </v-bottom-sheet>
</template>
<script>
import { MUSIC_PLAYBACK_MODE, MUSIC_PLAYER_STATE } from "@/utils/consts";
import VueYouTubeEmbed from "vue-youtube-embed";
import Vue from "vue";
import { mapGetters, mapState } from "vuex";
import backendApi from "@/utils/backend-api";
import {
    mdiPlay,
    mdiPause,
    mdiSkipNext,
    mdiSkipPrevious,
    mdiVolumeHigh,
    mdiShuffleVariant,
    mdiRepeat,
    mdiRepeatOff,
    mdiRepeatOnce,
    mdiMicrophoneVariant,
    mdiPlaylistRemove,
} from "@mdi/js";

import SongFrame from "../media/SongFrame";
import SongPlaylist from "../media/SongPlaylist";

Vue.use(VueYouTubeEmbed);

const ICON_MODE = {
    [MUSIC_PLAYBACK_MODE.NATURAL]: mdiRepeatOff,
    [MUSIC_PLAYBACK_MODE.LOOP]: mdiRepeat,
    [MUSIC_PLAYBACK_MODE.LOOPONE]: mdiRepeatOnce,
    [MUSIC_PLAYBACK_MODE.SHUFFLE]: mdiShuffleVariant,
};
export default {
    name: "MusicBar2",
    components: { SongFrame, SongPlaylist },
    data() {
        return {
            // isOpen: true,
            value: "/",
            mdiSkipNext,
            mdiVolumeHigh,
            mdiShuffleVariant,
            mdiRepeat,
            mdiRepeatOff,
            mdiRepeatOnce,
            mdiMicrophoneVariant,
            mdiSkipPrevious,
            mdiPlaylistRemove,

            progress: 0,
            player: null,
            animateOpenError: false,

            queueMenuOpen: false,
        };
    },
    watch: {
        isOpen() {
            // workaround to allow scrolling when media is popped open:
            // https://github.com/vuetifyjs/vuetify/issues/6495#issuecomment-663547354
            setTimeout(() => {
                // console.log("fix scroll")
                if (this.$refs.sheet) {
                    console.log("fix scroll");
                    this.$refs.sheet.showScroll();
                    // either set :retain-focus="false" above or do this:
                    this.$nextTick(() => this.$refs.sheet.unbind());
                }
            }, 100);
        },
        playlist(nw) {
            console.log("playlist: ", nw.length);
            if (nw.length === 0) this.$store.commit("music/closeBar");
            if (this.isOpen === false > 0 && nw.length === 0) this.$store.commit("music/openBar");
        },
        currentSong(ns, os) {
            if (os != null && this.progress > 80) {
                console.log("track song");

                backendApi.trackSongPlay(os.channel_id, os.video_id, os.name).catch((err) => console.error(err));
            }
            console.log("change song");
        },
    },
    computed: {
        isMobile() {
            return this.$store.state.isMobile;
        },
        playButtonIcon() {
            if (this.state === MUSIC_PLAYER_STATE.PLAYING) return mdiPause;
            return mdiPlay;
        },
        shuffleButtonIcon() {
            return ICON_MODE[this.mode];
        },
        animateAdded: {
            get() {
                return this.addedAnimation;
            },
            set() {
                this.$store.commit("music/stopAddedAnimation");
            },
        },
        ...mapState("music", ["currentId", "playId", "playlist", "state", "mode", "addedAnimation", "isOpen"]),
        ...mapGetters("music", ["currentSong", "canPlay"]),
    },
    methods: {
        // event handlers:
        // eslint-disable-next-line no-unused-vars
        songIsDone(_player) {
            this.$store.commit("music/nextSong");
        },
        songIsPlaying(player) {
            this.player = player.target;
            this.$store.commit("music/play");
        },
        // eslint-disable-next-line no-unused-vars
        songIsPaused(_player) {
            this.$store.commit("music/pause");
        },
        songProgress(time) {
            if (!this.currentSong) this.progress = 0;

            const { start, end } = this.currentSong;
            this.progress = Math.min(Math.max(0, (time - start) / (end - start)), 1) * 100;
        },
        playPause() {
            // if(this.state === MUSIC_PLAYER_STATE.PLAYING) this.$store.commit("music/pause");
            // else this.$store.commit("music/play");
            if (this.player) {
                if (this.state === MUSIC_PLAYER_STATE.PLAYING) this.player.pauseVideo();
                else this.player.playVideo();
            }
        },
        tryOpeningPlayer() {
            if (this.currentSong) {
                this.$store.commit("music/openBar");
            } else {
                this.animateOpenError = true;
            }
        },
        closePlayer() {
            this.$store.commit("music/closeBar");
            if (this.player) this.player.pauseVideo();
            this.$store.commit("music/pause");
        },
        progressChange(progress) {
            if (!this.currentSong) return;

            const { start, end } = this.currentSong;
            const totalLength = end - start;
            const percent = progress / 100;
            const newOffsetTime = start + totalLength * percent;
            this.player.seekTo(newOffsetTime);
        },
        prevButtonHandler() {
            if (this.progress > 5) {
                this.player.seekTo(this.currentSong.start);
                return;
            }
            this.$store.commit("music/prevSong");
        },
    },
};
</script>

<style lang="scss">
.theme--light .music-player-bar {
    background: rgba(237, 227, 241, 0.95);
}
.theme--dark .music-player-bar {
    background: rgba(41, 43, 49, 0.99);
}
.music-player-bar {
    position: relative;
    /* border-top: 2px solid #007bff; */
    /* backdrop-filter: blur(5px); */
    /* background: linear-gradient(180deg, rgba(80,80,80,1) 0%, rgba(43,47,50,1) 100%);  */
    /* box-shadow: 1px 0px 2px inset #007bff; */
    iframe {
        border-radius: 4px;
    }
    .song-player-container {
        // border-radius: 5px;
        width: 356px;
        position: absolute;
        padding: 2px;
        bottom: 100%;
        // bottom: 0px;
        right: 0;
        // background: #007bff;
        // box-shadow: 0px 6px 6px -2px rgba(0, 0, 0, 0.452), 0px 6px 16px -2px rgba(0, 0, 0, 0.582);
    }
}

.single-line-clamp {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    white-space: initial;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    display: -webkit-box;
}
.v-btn::before {
    background-color: transparent;
}
</style>
