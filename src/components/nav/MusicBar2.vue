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
        <v-slider class="music-progress" hide-details :value="progress" height="3" @change="progressChange" />
        <div class="d-flex justify-space-between pa-2" :class="{ 'flex-column': $vuetify.breakpoint.xs }">
            <div class="player-controls d-flex align-center">
                <v-btn icon class="mx-1" @click="prevButtonHandler">
                    <v-icon>{{ mdiSkipPrevious }}</v-icon>
                </v-btn>
                <v-btn icon fab @click="playPause" color="primary">
                    <v-icon x-large>{{ playButtonIcon }}</v-icon>
                </v-btn>
                <v-btn
                    icon
                    class="mx-1"
                    @click="
                        () => {
                            titleTransition = 'scroll-y-reverse-transition';
                            $store.commit('music/nextSong', true);
                        }
                    "
                >
                    <v-icon>{{ mdiSkipNext }}</v-icon>
                </v-btn>
                <v-btn icon class="mx-1" @click="$store.commit('music/cycleMode')">
                    <v-icon>{{ shuffleButtonIcon }}</v-icon>
                </v-btn>
                <ResponsiveMenu
                    :close-on-content-click="false"
                    offset-y
                    top
                    origin="right bottom"
                    transition="slide-y-reverse-transition"
                    min-width="30vw"
                    max-width="50vw"
                    max-height="50vh"
                    v-model="queueMenuOpen"
                    :itemCount="playlist.length"
                >
                    <template v-slot:activator="{ on }">
                        <v-btn
                            elevation="0"
                            :ripple="false"
                            class="queue-btn mx-1 px-1"
                            :class="{ 'added-animation': animateAdded }"
                            @animationend="animateAdded = false"
                            v-on="on"
                            @click="queueMenuOpen = !queueMenuOpen"
                        >
                            <v-icon>{{ icons.mdiPlaylistMusic }}</v-icon>
                            <div class="">({{ currentId + 1 }}/{{ playlist.length }})</div>
                        </v-btn>
                    </template>
                    <song-playlist :songs="playlist" :currentId="currentId"></song-playlist>
                </ResponsiveMenu>
                <v-slide-x-transition>
                    <v-btn
                        small
                        v-if="queueMenuOpen"
                        elevation="0"
                        color="warning"
                        @click="
                            () => {
                                queueMenuOpen = false;
                                $store.commit('music/clearPlaylist');
                            }
                        "
                        ><v-icon left>{{ mdiPlaylistRemove }}</v-icon> {{ $t("component.music.clearPlaylist") }}</v-btn
                    >
                </v-slide-x-transition>
                <div v-if="$vuetify.breakpoint.xs">
                    <v-btn icon @click="closePlayer">
                        <v-icon>{{ icons.mdiClose }}</v-icon>
                    </v-btn>
                </div>
            </div>
            <!-- < v-scroll-y-transition mode="out-in"> -->
            <transition :name="titleTransition" mode="out-in">
                <div class="d-flex align-center" :key="'snip' + (currentSong && currentSong.name)">
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
                        <div class="text-h6">
                            {{ currentSong.name }}
                        </div>
                        <div class="single-line-clamp">
                            <router-link
                                class="text-subtitle-2 secondary--text mr-2"
                                id="songChannel"
                                :to="`/channel/${currentSong.channel_id}`"
                            >
                                {{ currentSong.channel[nameProperty] || currentSong.channel.name }}
                            </router-link>
                            <span class="text-subtitle-2 text--secondary">({{ currentSong.original_artist }})</span>
                        </div>
                    </div>
                    <div class="music-more-btn">
                        <v-menu bottom nudge-top="20px">
                            <template v-slot:activator="{ on }">
                                <v-btn icon large v-on="on" @click.stop.prevent class="mt-1">
                                    <v-icon>
                                        {{ icons.mdiDotsVertical }}
                                    </v-icon>
                                </v-btn>
                            </template>
                            <v-list dense>
                                <!-- <v-list-item @click.stop="" disabled
                                    ><v-icon left>{{ icons.mdiClipboardPlusOutline }}</v-icon>
                                    {{ $t("component.videoCard.copyLink") }}
                                </v-list-item> -->
                                <v-list-item
                                    @click.stop
                                    target="_blank"
                                    :href="`https://youtu.be/${currentSong.video_id}?t=${currentSong.start}`"
                                    ><v-icon left>{{ icons.mdiYoutube }}</v-icon>
                                    {{ $t("views.settings.redirectModeLabel") }}
                                </v-list-item>
                                <v-list-item :to="`/edit/video/${currentSong.video_id}/music`"
                                    ><v-icon left>{{ icons.mdiPencil }}</v-icon>
                                    {{ $t("component.videoCard.edit") }}
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </div>
                </div>
            </transition>
            <!-- </> -->
            <div class="playlist-buttons align-self-center" v-if="$vuetify.breakpoint.smAndUp">
                <v-btn icon large @click="closePlayer">
                    <v-icon>{{ icons.mdiClose }}</v-icon>
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

<style lang="scss">
.theme--light .music-player-bar {
    background: rgba(237, 227, 241, 0.95);
}
.theme--dark .music-player-bar {
    background: rgba(41, 43, 49, 0.99);
}
.music-player-bar {
    position: relative;

    iframe {
        border-radius: 4px;
    }
    .song-player-container {
        // border-radius: 5px;
        width: 356px;
        position: absolute;
        padding: 2px;
        bottom: 100%;
        right: 0;
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

.player-controls .v-btn::before {
    background-color: transparent;
}
#songChannel {
    text-decoration: none;
}
.queue-btn {
    transition: background-color 2s ease;
    background-color: transparent !important;
    &.added-animation {
        animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        background-color: #f06292 !important;
    }
}

.music-more-btn {
}

@keyframes shake {
    10%,
    90% {
        transform: translate3d(-1px, 0, 0);
    }

    20%,
    80% {
        transform: translate3d(2px, 0, 0);
    }

    30%,
    50%,
    70% {
        transform: translate3d(-4px, 0, 0);
    }

    40%,
    60% {
        transform: translate3d(4px, 0, 0);
    }
}
</style>

<script lang="ts">
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

import SongFrame from "../media/SongFrame.vue";
import SongPlaylist from "../media/SongPlaylist.vue";
import ResponsiveMenu from "../common/ResponsiveMenu.vue";

Vue.use(VueYouTubeEmbed);

const ICON_MODE = {
    [MUSIC_PLAYBACK_MODE.NATURAL]: mdiRepeatOff,
    [MUSIC_PLAYBACK_MODE.LOOP]: mdiRepeat,
    [MUSIC_PLAYBACK_MODE.LOOPONE]: mdiRepeatOnce,
    [MUSIC_PLAYBACK_MODE.SHUFFLE]: mdiShuffleVariant,
};
export default {
    name: "MusicBar2",
    components: { SongFrame, SongPlaylist, ResponsiveMenu },
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

            queueMenuOpen: false,

            titleTransition: "scroll-y-reverse-transition",

            allowPlayOverride: 0, // set to timestamp user clicks on yt frame.
            // used to check whether or not to allow a user action to override current
            // playback state.
        };
    },
    mounted() {
        window.addEventListener("blur", this.probableMouseClickInIFrame);
    },
    beforeDestroy() {
        window.removeEventListener("blur", this.probableMouseClickInIFrame);
    },
    watch: {
        isOpen() {
            // workaround to allow scrolling when media is popped open:
            // https://github.com/vuetifyjs/vuetify/issues/6495#issuecomment-663547354
            setTimeout(() => {
                // console.log("fix scroll")
                if (this.$refs.sheet) {
                    // console.log("fix scroll");
                    this.$refs.sheet.showScroll();
                    // either set :retain-focus="false" above or do this:
                    this.$nextTick(() => this.$refs.sheet.unbind());
                }
            }, 100);
        },
        playlist(nw) {
            // console.log("playlist: ", nw.length);
            if (nw.length === 0) this.$store.commit("music/closeBar");
            if (this.isOpen === false && nw.length === 0) this.$store.commit("music/openBar");
        },
        currentSong(ns, os) {
            if (os != null && this.progress > 80 && this.progress < 105) {
                // console.log("track song");

                backendApi.trackSongPlay(os.channel_id, os.video_id, os.name).catch((err) => console.error(err));
            }
            // console.log("change song");
        },
        titleTransition(ns) {
            if (ns !== "scroll-y-reverse-transition") {
                setTimeout(() => {
                    this.titleTransition = "scroll-y-reverse-transition";
                }, 500);
            }
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
        ...mapState("settings", ["nameProperty"]),
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
            /**-----------------------
             * *       INFO
             *  if: the bar is NOT OPEN
             *
             *  or
             *
             *  The Music Player is supposed to be PAUSED
             *  AND the play event is not triggered by the user.
             *
             *------------------------* */
            if (!this.isOpen || (this.state === MUSIC_PLAYER_STATE.PAUSED && this.allowPlayOverride === 0)) {
                this.player.pauseVideo();
                return;
            }
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
            if (time > end + 1) {
                this.$store.commit("music/nextSong");
            } else if (time < start - 10) {
                this.player.seekTo(start);
            }
        },
        playPause() {
            // if(this.state === MUSIC_PLAYER_STATE.PLAYING) this.$store.commit("music/pause");
            // else this.$store.commit("music/play");
            if (this.player) {
                if (this.state === MUSIC_PLAYER_STATE.PLAYING) {
                    this.$store.commit("music/pause");
                    this.player.pauseVideo();
                } else {
                    this.$store.commit("music/play");
                    this.player.playVideo();
                }
            }
        },
        closePlayer() {
            this.$store.commit("music/closeBar");
            if (this.player) this.player.pauseVideo();
            this.$store.commit("music/pause");
        },
        progressChange(progress) {
            if (!this.currentSong || !this.player) return;

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
            this.titleTransition = "scroll-y-transition";
            this.$store.commit("music/prevSong");
        },
        probableMouseClickInIFrame() {
            this.allowPlayOverride = Date.now();
        },
    },
};
</script>
