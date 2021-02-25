<template>
    <div class="bottom-nav">
        <v-bottom-sheet
            hide-overlay
            persistent
            no-click-animation
            ref="sheet"
            :value="togglePlayer"
            :retain-focus="false"
            content-class="music-player-bar"
        >
            <div
                key="musicplayertogglebtn"
                class="music-player-toggle"
                color="info"
                @click="togglePlayer = !togglePlayer"
                style="bottom: 100%; position: absolute"
                v-if="togglePlayer"
            >
                <div class="music-player-toggle-bg">
                    <v-icon large>{{ mdiMusic }}</v-icon>
                </div>
            </div>

            <v-row class="frame-row">
                <!-- Progress bar (positioned so it starts at the video and ends at screen right.) -->
                <v-progress-linear class="music-progress" value="40" height="3"></v-progress-linear>
                <v-col cols="auto">
                    <song-frame
                        :videoId="currentSong.video_id"
                        :start="currentSong.start"
                        :end="currentSong.end"
                        :key="currentSong.video_id + playId"
                        style="width: 250px; width: 356px"
                    ></song-frame>
                </v-col>
                <!-- Controls -->
                <v-spacer></v-spacer>
                <v-col style="min-width: 38%" class="flex-column d-flex pt-1 justify-space-around">
                    <div class="d-flex flex-row justify-left align-baseline">
                        <v-btn fab elevation="5" class="mr-1" style="margin-top: -20px" color="primary">
                            <v-icon large>{{ mdiPlay }}</v-icon>
                        </v-btn>
                        <v-btn icon class="mx-1">
                            <v-icon>{{ mdiSkipNext }}</v-icon>
                        </v-btn>
                        <v-btn icon class="mx-1">
                            <v-icon>{{ mdiShuffleVariant }}</v-icon>
                        </v-btn>
                        <v-slider
                            class="mx-2"
                            track-fill-color="secondary"
                            thumb-color="secondary"
                            track-color="grey"
                            hide-details
                            style="max-width: 130px"
                            min="0"
                            max="100"
                            :prepend-icon="mdiVolumeHigh"
                        ></v-slider>
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
                        v-if="currentSong"
                        :src="currentSong.art.replace('100x100', '200x200')"
                        aspect-ratio="1"
                        height="100%"
                        width="100px"
                    ></v-img>
                </v-col>
                <!-- Queue -->
                <v-col cols="auto">
                    <v-menu :close-on-content-click="false" offset-y top content-class="scrollable-music-queue">
                        <template v-slot:activator="{ on }">
                            <v-btn dark color="warning darken-2" large height="100%" v-on="on"
                                ><v-icon>{{ mdiPlaylistMusic }}</v-icon
                                >Queue({{ playlist.length }})
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
            color="info"
            @click="togglePlayer = !togglePlayer"
            v-if="!togglePlayer"
        >
            <div class="music-player-toggle-bg">
                <v-icon large>{{ mdiMusic }}</v-icon>
            </div>
        </div>
    </div>
</template>

<script>
import {
    mdiMusic,
    mdiPlay,
    mdiSkipNext,
    mdiVolumeHigh,
    mdiShuffleVariant,
    mdiRepeat,
    mdiRepeatOff,
    mdiRepeatOnce,
    mdiMicrophoneVariant,
    mdiPlaylistMusic,
} from "@mdi/js";
import VueYouTubeEmbed from "vue-youtube-embed";
import Vue from "vue";
import { mapGetters, mapState } from "vuex";
import backendApi from "@/utils/backend-api";
import SongFrame from "../media/SongFrame";
import SongPlaylist from "../media/SongPlaylist";

Vue.use(VueYouTubeEmbed);

export default {
    components: { SongFrame, SongPlaylist },
    name: "MusicBar",
    props: {},
    data() {
        return {
            value: "/",
            mdiMusic,
            togglePlayer: false,
            mdiPlay,
            mdiSkipNext,
            mdiVolumeHigh,
            mdiShuffleVariant,
            mdiRepeat,
            mdiRepeatOff,
            mdiRepeatOnce,
            mdiMicrophoneVariant,
            mdiPlaylistMusic,
        };
    },
    mounted() {
        this.$store.commit("music/resetState");
        backendApi.videoSongList("UCZlDXzGoo7d44bwdNObFacg", undefined, false).then((x) => {
            x.data.map((c) => this.$store.commit("music/addSong", c));
        });
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
    },
    computed: {
        isMobile() {
            return this.$store.state.isMobile;
        },
        ...mapState("music", ["currentId", "playId", "playlist", "state", "mode"]),
        ...mapGetters("music", ["currentSong", "canPlay"]),
    },
    methods: {
        scrollToTop(page) {
            if (page.path === this.$route.path) {
                window.scroll({
                    top: 0,
                    left: 0,
                    behavior: "smooth",
                });
            }
        },
    },
};
</script>

<style>
.theme--light .music-player-bar {
    background: rgba(237, 227, 241, 0.95);
}
.theme--dark .music-player-bar {
    background: rgba(41, 43, 49, 0.95);
}
.music-player-bar {
    position: relative;
    border-top: 2px solid #007bff;
    /* background: linear-gradient(180deg, rgba(80,80,80,1) 0%, rgba(43,47,50,1) 100%);  */
    /* box-shadow: 1px 0px 2px inset #007bff; */
}
.music-player-bar iframe {
    border-radius: 4px;
}
.music-player-bar .song-player-container {
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
.music-player-bar .music-title {
    font-weight: 500;
    font-size: 20px;
}
.frame-row {
    width: inherit;
}
.frame-row .music-progress {
    position: absolute;
    right: 0;
    left: 360px;
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
    height: 50px;
    width: 50px;
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
