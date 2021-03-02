<template>
    <div>
        <v-bottom-sheet
            hide-overlay
            persistent
            no-click-animation
            ref="sheet"
            :value="togglePlayer"
            :retain-focus="false"
            content-class="music-player-bar"
            v-if="currentSong"
        >
            <div
                key="musicplayertogglebtn"
                class="music-player-toggle"
                color="info"
                @click="closePlayer"
                style="bottom: 100%; position: absolute"
                v-if="togglePlayer"
            >
                <div class="music-player-toggle-bg">
                    <v-icon large>{{ icons.mdiMusic }}</v-icon>
                </div>
            </div>

            <v-row class="frame-row">
                <!-- Progress bar (positioned so it starts at the video and ends at screen right.) -->
                <v-progress-linear class="music-progress" :value="progress" height="3"></v-progress-linear>
                <v-col cols="auto">
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
                </v-col>
                <!-- Controls -->
                <v-spacer></v-spacer>
                <v-col style="min-width: 38%" class="flex-column d-flex pt-1 justify-space-around">
                    <div class="d-flex flex-row justify-left align-baseline">
                        <v-btn
                            fab
                            elevation="5"
                            class="mr-1"
                            style="margin-top: -20px"
                            color="primary"
                            @click="playPause"
                        >
                            <v-icon large>{{ playButtonIcon }}</v-icon>
                        </v-btn>
                        <v-btn icon class="mx-1" @click="$store.commit('music/nextSong', true)">
                            <v-icon>{{ mdiSkipNext }}</v-icon>
                        </v-btn>
                        <v-btn icon class="mx-1" @click="$store.commit('music/cycleMode')">
                            <v-icon>{{ shuffleButtonIcon }}</v-icon>
                        </v-btn>
                        <!-- <v-slider
                            class="mx-2"
                            track-fill-color="secondary"
                            thumb-color="secondary"
                            track-color="grey"
                            hide-details
                            style="max-width: 130px"
                            min="0"
                            max="100"
                            :prepend-icon="mdiVolumeHigh"
                        ></v-slider> -->
                    </div>
                    <div class="justify-center">
                        <!-- Song Information -->
                        <span class="text-h6"> {{ currentSong.name }} </span><br />
                        <span class="text-subtitle-2 secondary--text mr-2">{{ currentSong.channel.name }}</span>
                        <span class="text-subtitle-2 primary--text mr-2">({{ currentSong.original_artist }})</span>
                        <!-- Song information END -->
                    </div>
                </v-col>
                <v-spacer></v-spacer>
                <!-- Current Song art -->
                <v-col cols="auto" class="pa-1">
                    <v-img
                        v-if="currentSong && currentSong.art"
                        :src="currentSong.art.replace('100x100', '200x200')"
                        aspect-ratio="1"
                        height="100%"
                        width="100px"
                    ></v-img>
                </v-col>
                <!-- Queue -->
                <v-col cols="auto">
                    <v-menu
                        :close-on-content-click="false"
                        offset-y
                        top
                        origin="right bottom"
                        transition="slide-y-reverse-transition"
                        content-class="scrollable-music-queue"
                    >
                        <template v-slot:activator="{ on }">
                            <v-btn
                                dark
                                color="warning darken-2"
                                large
                                height="100%"
                                v-on="on"
                                class="queue-btn"
                                :class="{ 'added-animation': animateAdded }"
                                @animationend="animateAdded = false"
                            >
                                <v-icon large>{{ icons.mdiPlaylistMusic }}</v-icon>
                                <div class="">({{ playlist.length }})</div>
                            </v-btn>
                        </template>
                        <song-playlist :songs="playlist" :currentId="currentId"></song-playlist>
                    </v-menu>
                </v-col>
            </v-row>
        </v-bottom-sheet>
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
            v-if="!togglePlayer"
        >
            <div class="music-player-toggle-bg">
                <v-icon large>{{ icons.mdiMusic }}</v-icon>
            </div>
        </div>
    </div>
</template>

<script>
import {
    mdiPlay,
    mdiPause,
    mdiSkipNext,
    mdiVolumeHigh,
    mdiShuffleVariant,
    mdiRepeat,
    mdiRepeatOff,
    mdiRepeatOnce,
    mdiMicrophoneVariant,
} from "@mdi/js";
import VueYouTubeEmbed from "vue-youtube-embed";
import Vue from "vue";
import { mapGetters, mapState } from "vuex";
// import backendApi from "@/utils/backend-api";
import { MUSIC_PLAYBACK_MODE, MUSIC_PLAYER_STATE } from "@/utils/consts";
import backendApi from "@/utils/backend-api";
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
    components: { SongFrame, SongPlaylist },
    name: "MusicBar",
    props: {},
    data() {
        return {
            value: "/",
            togglePlayer: false,
            mdiSkipNext,
            mdiVolumeHigh,
            mdiShuffleVariant,
            mdiRepeat,
            mdiRepeatOff,
            mdiRepeatOnce,
            mdiMicrophoneVariant,

            progress: 0,
            player: null,
            animateOpenError: false,
        };
    },
    mounted() {
        // this.$store.commit("music/resetState");
        // backendApi.songListByVideo("UCZlDXzGoo7d44bwdNObFacg", undefined, false).then((x) => {
        //     x.data.map((c) => this.$store.commit("music/addSong", c));
        // });
    },
    watch: {
        togglePlayer() {
            // workaround to allow scrolling when media is popped open:
            // https://github.com/vuetifyjs/vuetify/issues/6495#issuecomment-663547354
            this.$nextTick(() => {
                this.$refs.sheet.showScroll();
                // either set :retain-focus="false" above or do this:
                this.$nextTick(() => this.$refs.sheet.unbind());
            });
        },
        playlist(nw) {
            console.log("playlist: ", nw.length);
            if (nw.length === 0) this.togglePlayer = false;
            if (this.togglePlayer === false > 0 && nw.length === 0) this.togglePlayer = true;
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
        ...mapState("music", ["currentId", "playId", "playlist", "state", "mode", "addedAnimation"]),
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
                this.togglePlayer = true;
            } else {
                this.animateOpenError = true;
            }
        },
        closePlayer() {
            this.togglePlayer = false;
            if (this.player) this.player.pauseVideo();
            this.$store.commit("music/pause");
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
    border-top: 2px solid #007bff;
    backdrop-filter: blur(5px);
    /* background: linear-gradient(180deg, rgba(80,80,80,1) 0%, rgba(43,47,50,1) 100%);  */
    /* box-shadow: 1px 0px 2px inset #007bff; */
    iframe {
        border-radius: 4px;
    }
    .song-player-container {
        border-radius: 5px;
        width: 356px;
        position: relative;
        margin-top: -110px;
        margin-bottom: 5px;
        margin-left: 5px;
        padding: 2px;
        background: #007bff;
        box-shadow: 0px 6px 6px -2px rgba(0, 0, 0, 0.452), 0px 6px 16px -2px rgba(0, 0, 0, 0.582);
    }
    .music-title {
        font-weight: 500;
        font-size: 20px;
    }
}

.frame-row {
    width: inherit;
}
.frame-row .music-progress {
    position: absolute;
    right: 0;
    left: 360px;
    width: auto;
}
.scrollable-music-queue {
    overflow-y: scroll;
    overflow-x: hidden;
    max-height: 60vh;
}
.music-player-toggle {
    position: fixed;
    bottom: 0px;
    z-index: 20;
    right: 0px;
    overflow: visible;
    height: 50px !important;
    width: 50px !important;
    cursor: pointer;
}
.music-player-toggle .music-player-toggle-bg {
    width: 0px;
    height: 0px;
    border-style: inset;
    border-width: 0 0 50px 50px;
    border-color: transparent transparent #007bff transparent;
    /* float: left; */

    transform: rotate(360deg);
    -ms-transform: rotate(360deg);
    -moz-transform: rotate(360deg);
    -webkit-transform: rotate(360deg);
    -o-transform: rotate(360deg);
}
.music-player-toggle:hover .music-player-toggle-bg {
    border-color: transparent transparent #4aa2ff transparent;
}

.music-player-toggle.error-animation .music-player-toggle-bg {
    border-color: transparent transparent #c43 transparent;
    animation: errorshake 0.6s;
    animation-iteration-count: 1;
}

@-webkit-keyframes errorshake {
    0%,
    100% {
        -webkit-transform: translateX(0);
    }
    10%,
    30%,
    50%,
    70%,
    90% {
        -webkit-transform: translateX(-2px);
    }
    20%,
    40%,
    60%,
    80% {
        -webkit-transform: translateX(2px);
    }
}

@keyframes errorshake {
    0%,
    100% {
        transform: translateX(0);
    }
    10%,
    30%,
    50%,
    70%,
    90% {
        transform: translateX(-2px);
    }
    20%,
    40%,
    60%,
    80% {
        transform: translateX(2px);
    }
}

.music-player-toggle.added-animation .music-player-toggle-bg {
    border-color: transparent transparent rgb(51, 173, 204) transparent;
    animation: added-music-bounce 0.2s;
    animation-timing-function: ease-in-out;
    animation-iteration-count: 3;
    transform-origin: bottom right;
    -webkit-transform-origin: bottom right;
}
.queue-btn.added-animation {
    border-color: transparent transparent rgb(51, 173, 204) transparent;
    animation: added-music-bounce 0.2s;
    animation-timing-function: ease-in-out;
    animation-iteration-count: 3;
}

@-webkit-keyframes added-music-bounce {
    0%,
    100% {
        -webkit-transform: scale(1.02);
    }
    40% {
        -webkit-transform: scale(0.94);
    }
}

@keyframes added-music-bounce {
    0%,
    100% {
        transform: scale(1.02);
    }
    40% {
        transform: scale(0.94);
    }
}

.music-player-toggle span.v-icon {
    margin-left: -35px !important;
    margin-top: 5px !important;
    z-index: 20;
}

.music-player-toggle span.v-icon.theme--light {
    color: #222;
    filter: drop-shadow(0px 0px 1px rgb(248, 248, 248));
}
.music-player-toggle span.v-icon.theme--dark {
    color: #eee;
    filter: drop-shadow(0px 0px 1px rgb(100, 100, 100));
}

.music-player-toggle:hover span {
    filter: drop-shadow(4px 4px 3px rgb(6, 25, 43));
}
</style>
