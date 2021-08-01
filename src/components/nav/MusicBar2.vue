<template>
    <v-bottom-sheet
        v-if="song"
        ref="sheet"
        hide-overlay
        persistent
        no-click-animation
        :value="isOpen"
        :retain-focus="false"
        content-class="music-player-bar"
    >
        <v-slider
            class="music-progress"
            hide-details
            :value="progress"
            height="3"
            @change="progressChange"
        />
        <div class="d-flex justify-space-between pa-2" :class="{ 'flex-column': $vuetify.breakpoint.xs }">
            <div class="player-controls d-flex align-center">
                <div>
                    <v-btn
                        icon
                        class="mx-1"
                        color="secondary"
                        @click="prevButtonHandler"
                    >
                        <v-icon>{{ mdiSkipPrevious }}</v-icon>
                    </v-btn>
                    <v-btn
                        icon
                        fab
                        color="primary"
                        @click="playPause"
                    >
                        <v-icon x-large>
                            {{ playButtonIcon }}
                        </v-icon>
                    </v-btn>
                    <v-btn
                        icon
                        class="mx-1"
                        color="secondary"
                        @click="nextButtonHandler"
                    >
                        <v-progress-circular
                            color="warning"
                            :class="{ invisible: !showPatience }"
                            :value="patience"
                            size="40"
                        >
                            <v-icon color="secondary">
                                {{ mdiSkipNext }}
                            </v-icon>
                        </v-progress-circular>
                    </v-btn>
                    <v-btn
                        icon
                        color="secondary"
                        class="mx-1"
                        @click="$store.commit('music/cycleMode')"
                    >
                        <v-icon>{{ shuffleButtonIcon }}</v-icon>
                    </v-btn>
                    <ResponsiveMenu
                        v-model="queueMenuOpen"
                        :close-on-content-click="false"
                        offset-y
                        top
                        origin="right bottom"
                        transition="slide-y-reverse-transition"
                        min-width="30vw"
                        max-width="50vw"
                        max-height="50vh"
                        :item-count="playlist.length"
                    >
                        <template #activator="{ on }">
                            <v-btn
                                elevation="0"
                                :ripple="false"
                                class="queue-btn mx-1 px-1"
                                :class="{ 'added-animation': animateAdded }"
                                @animationend="animateAdded = false"
                                v-on="on"
                                @click="queueMenuOpen = !queueMenuOpen"
                            >
                                <v-icon color="secondary">
                                    {{ icons.mdiPlaylistMusic }}
                                </v-icon>
                                <div class="secondary--text text--darken-2">
                                    ({{ currentId + 1 }}/{{ playlist.length }})
                                </div>
                            </v-btn>
                        </template>
                        <song-playlist :songs="playlist" :current-id="currentId" />
                    </ResponsiveMenu>
                    <v-slide-x-transition>
                        <v-btn
                            v-if="queueMenuOpen"
                            small
                            style="position: relative; margin-right: -60px"
                            elevation="0"
                            color="warning"
                            @click="
                                () => {
                                    queueMenuOpen = false;
                                    $store.commit('music/clearPlaylist');
                                }
                            "
                        >
                            <v-icon left>
                                {{ mdiPlaylistRemove }}
                            </v-icon>
                            {{ $t("component.music.clearPlaylist") }}
                        </v-btn>
                    </v-slide-x-transition>
                </div>
                <div v-if="$vuetify.breakpoint.xs" style="display: flex; flex-direction: column; align-items: center">
                    <v-btn icon @click="closePlayer">
                        <v-icon>{{ icons.mdiClose }}</v-icon>
                    </v-btn>
                    <v-btn icon large @click="toggleSongFrameModality">
                        <v-icon>{{ icons.mdiTheater }}</v-icon>
                    </v-btn>
                </div>
            </div>
            <!-- < v-scroll-y-transition mode="out-in"> -->
            <transition :name="titleTransition" mode="out-in">
                <div :key="'snip' + (song && song.name)" class="d-flex align-center">
                    <div class="pr-2">
                        <v-img
                            v-if="song && song.art"
                            :src="song.art.replace('100x100', '50x50')"
                            aspect-ratio="1"
                            height="auto"
                            width="50px"
                        />
                    </div>
                    <div>
                        <div class="text-h6">
                            {{ song.name }}
                        </div>
                        <div class="single-line-clamp">
                            <router-link
                                id="songChannel"
                                class="text-subtitle-2 secondary--text mr-2"
                                :to="`/channel/${song.channel_id}`"
                            >
                                {{ song.channel[nameProperty] || song.channel.name }}
                            </router-link>
                            <span class="text-subtitle-2 grey--text">({{ song.original_artist }})</span>
                        </div>
                    </div>
                    <div class="music-more-btn">
                        <v-menu bottom nudge-top="20px">
                            <template #activator="{ on }">
                                <v-btn
                                    icon
                                    large
                                    class="mt-1"
                                    v-on="on"
                                    @click.stop.prevent
                                >
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
                                    target="_blank"
                                    :href="`https://youtu.be/${song.video_id}?t=${song.start}`"
                                    @click.stop
                                >
                                    <v-icon left>
                                        {{ icons.mdiYoutube }}
                                    </v-icon>
                                    {{ $t("views.settings.redirectModeLabel") }}
                                </v-list-item>
                                <v-list-item :to="`/edit/video/${song.video_id}/music`">
                                    <v-icon left>
                                        {{ icons.mdiPencil }}
                                    </v-icon>
                                    {{ $t("component.videoCard.edit") }}
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </div>
                </div>
            </transition>
            <!-- </> -->

            <div v-if="$vuetify.breakpoint.smAndUp" class="playlist-buttons align-self-center">
                <v-btn
                    icon
                    large
                    :color="isEmbedPlayerInBackground ? 'secondary lighten-2' : ''"
                    @click="toggleSongFrameModality"
                >
                    <v-icon>{{ icons.mdiTheater }}</v-icon>
                </v-btn>
                <v-btn icon large @click="closePlayer">
                    <v-icon>{{ icons.mdiClose }}</v-icon>
                </v-btn>
            </div>
        </div>
        <!--             :key="currentSong.video_id + playId" -->

        <portal to="music-playback-background">
            <song-frame
                :playback="currentSong"
                :is-background="isEmbedPlayerInBackground"
                @playing="songIsPlaying"
                @paused="songIsPaused"
                @ended="songIsDone"
                @progress="songProgress"
                @error="songError"
                @buffering="songBuffering"
                @ready="songReady"
            />
        </portal>
    </v-bottom-sheet>
</template>

<script lang="ts">
import { MUSIC_PLAYBACK_MODE, MUSIC_PLAYER_STATE } from "@/utils/consts";

import Vue from "vue";
import VueYoutube from "@/external/vue-youtube";

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

const ICON_MODE = {
    [MUSIC_PLAYBACK_MODE.NATURAL]: mdiRepeatOff,
    [MUSIC_PLAYBACK_MODE.LOOP]: mdiRepeat,
    [MUSIC_PLAYBACK_MODE.LOOPONE]: mdiRepeatOnce,
    [MUSIC_PLAYBACK_MODE.SHUFFLE]: mdiShuffleVariant,
};

/** ==============================================
 * - set the videoId to a new ID to play a song.
 * - when it's DONE, advance to the next song.
 * - wait for it to load the next song
 * - after it loads, it PLAYS, which enables progress monitoring.
 * -
 *
 *=============================================* */
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

            patience: 0, // patience mechanism used to auto advance broken songs.
            showPatience: false,

            queueMenuOpen: false,

            titleTransition: "scroll-y-reverse-transition",

            allowPlayOverride: 0, // set to timestamp user clicks on yt frame.
            // used to check whether or not to allow a user action to override current
            // playback state.

            isEmbedPlayerInBackground: false,
        };
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
        ...mapState("music", [
            "currentId",
            "playId",
            "playlist",
            "state",
            "mode",
            "addedAnimation",
            "isOpen",
            "lastNextSong",
        ]),
        ...mapGetters("music", ["currentSong", "canPlay"]),
        song() {
            return this.currentSong && this.currentSong.song;
        },
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
            if (nw.length === 0) this.$store.commit("music/closeBar");
            if (this.isOpen === false && nw.length === 0) this.$store.commit("music/openBar");
        },
        currentSong: {
            deep: true,
            handler(ns, os) {
                if (os != null && this.progress > 80 && this.progress < 105) {
                    const { song } = os;
                    // console.log("track song");
                    backendApi
                        .trackSongPlay(song.channel_id, song.video_id, song.name)
                        .catch((err) => console.error(err));
                    this.$gtag.event("fully-listen", {
                        event_category: "music",
                        event_label: song.channel.name,
                    });
                }
            },
        },
        titleTransition(ns) {
            if (ns !== "scroll-y-reverse-transition") {
                setTimeout(() => {
                    this.titleTransition = "scroll-y-reverse-transition";
                }, 500);
            }
        },
    },
    created() {
        Vue.use(VueYoutube);
    },
    mounted() {
        window.addEventListener("blur", this.probableMouseClickInIFrame);
    },
    beforeDestroy() {
        window.removeEventListener("blur", this.probableMouseClickInIFrame);
    },
    methods: {
        // event handlers:
        // eslint-disable-next-line no-unused-vars
        songIsDone() {
            console.log(`Received notice that song ${this.song.name} is done. Asking for next song.`);
            this.$store.commit("music/nextSong", { isAuto: true });
        },
        songIsPlaying(player) {
            console.log("PLAYING");
            this.player = player;
            this.showPatience = false;
            this.patience = 0;
            /**-----------------------
             * *       INFO
             *  if: the bar is NOT OPEN
             *  or
             *  The Music Player is supposed to be PAUSED
             *  AND the play event is not triggered by the user.
             *------------------------* */
            if (!this.isOpen || (this.state === MUSIC_PLAYER_STATE.PAUSED && this.allowPlayOverride === 0)) {
                this.player.pauseVideo();
                return;
            }
            this.$store.commit("music/play");
            this.$gtag.event("play", {
                event_category: "music",
                event_label: this.song.channel.name,
            });
        },
        // eslint-disable-next-line no-unused-vars
        songIsPaused() {
            console.log("PAUSED");
            this.$store.commit("music/pause");
            this.$gtag.event("pause", {
                event_category: "music",
                event_label: this.song.channel.name,
            });
        },
        songBuffering() {},
        songProgress(time) {
            if (!this.song) {
                this.progress = 0;
                return;
            }

            if (this.showPatience) {
                this.patience -= 33;
                console.log("Patience:", this.patience);
                if (
                    (this.patience <= 0 || document.visibilityState === "hidden")
                    && this.player.getPlayerState() === -1
                ) {
                    console.log("Patience is now 0, requesting next song forcibly.");
                    this.$store.commit("music/nextSong", { isAuto: true, breakLoop: true });
                    this.$store.commit("music/play");
                    this.patience = 70;
                }
                return;
            }

            const { start, end } = this.song;
            this.progress = Math.min(Math.max(0, (time - start) / (end - start)), 1) * 100;
            if (time > end && this.player.getPlayerState() === 1) {
                // if it's PLAYING
                console.log(`Progress debug: time=${time}, end=${end}`);
                if (Date.now() - this.lastNextSong > 8000) {
                    console.log("Next song triggered by temporal progress tick");
                    this.$store.commit("music/nextSong", { isAuto: true });
                }
            } else if (time < start - 10) {
                this.player.seekTo(start);
            }
        },
        songError() {
            console.log("Youtube Player encountered error");
            // if you try to play into a not-available song it'll error.
            this.showPatience = true;
            this.patience = 120;
            if (document.visibilityState === "hidden") {
                // when document is hidden
                console.log("Since the window is hidden. Trigger next song");
                this.$store.commit("music/nextSong", { isAuto: true, breakLoop: true });
                this.$store.commit("music/play");
                return;
            }
            console.log("Due to error, Window is visible, so we are entering patience countdown.");
        },
        songReady(evt) {
            console.log("Youtube Player is Ready");
            if (evt) {
                this.player = evt;
            }
            const self = this;
            setTimeout(() => {
                const unstarted = evt.getPlayerState() === -1;
                const data = evt.getVideoData();
                if (unstarted && (!data || data.title === "")) {
                    console.log(
                        "YT player has been ready for 2s without having loaded the video data. We think it's a privated video or a unplayable video.",
                    );
                    self.showPatience = true;
                    self.patience = 120;
                    if (document.visibilityState === "hidden") {
                        // when document is hidden
                        console.log("Window isn't in view, requesting continue to next song");
                        this.$store.commit("music/nextSong", { isAuto: true, breakLoop: true });
                        this.$store.commit("music/play");
                        return;
                    }
                    // autoAdvance = true
                    console.log("Window is visible, entering patience countdown.");
                }
            }, 2000);
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
            this.$gtag.event("close", {
                event_category: "music",
                event_label: this.song.channel.name,
            });
        },
        progressChange(progress) {
            if (!this.song || !this.player) return;

            const { start, end } = this.song;
            const totalLength = end - start;
            const percent = progress / 100;
            const newOffsetTime = start + totalLength * percent;
            this.player.seekTo(newOffsetTime);
        },
        prevButtonHandler() {
            if (this.progress > 5) {
                this.player.seekTo(this.song.start);
                return;
            }
            this.titleTransition = "scroll-y-transition";
            this.$store.commit("music/prevSong");
        },
        nextButtonHandler() {
            if (this.progress < 80) {
                this.$gtag.event("quick-skip", {
                    event_category: "music",
                    event_label: this.song.channel.name,
                });
            }

            this.titleTransition = "scroll-y-reverse-transition";
            this.$store.commit("music/nextSong", { breakLoop: true });
            this.progress = 0;
        },
        probableMouseClickInIFrame() {
            this.allowPlayOverride = Date.now();
        },
        toggleSongFrameModality() {
            this.isEmbedPlayerInBackground = !this.isEmbedPlayerInBackground;
        },
    },
};
</script>
<style lang="scss">
.theme--light .music-player-bar {
    background: rgba(254, 253, 255, 0.95);
}

.theme--dark .music-player-bar {
    background: rgba(41, 43, 49, 0.99);
}

.music-player-bar {
    position: relative;

    iframe {
        border-radius: 4px;
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

.player-controls {
    justify-content: space-between;
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

.invisible .v-progress-circular__underlay {
    stroke: transparent;
}

.music-progress {
    .v-slider {
        cursor: pointer !important;
    }

    .v-slider__track-container {
        transition: height 0.2s ease-out;
    }

    .v-slider:hover {
        .v-slider__track-container {
            height: 6px;
        }
    }
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
