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
                <v-col cols="auto">
                    <song-frame
                        videoId="9wF4hxa7w40"
                        :start="300"
                        :end="500"
                        style="width: 250px; width: 356px"
                    ></song-frame>
                </v-col>
                <v-col cols="auto"> </v-col>
                <v-col cols="auto"> </v-col>
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
import { mdiMusic } from "@mdi/js";
import VueYouTubeEmbed from "vue-youtube-embed";
import Vue from "vue";
import SongFrame from "../media/SongFrame";

Vue.use(VueYouTubeEmbed);

export default {
    components: { SongFrame },
    name: "MusicBar",
    props: {},
    data() {
        return {
            value: "/",
            mdiMusic,
            togglePlayer: false,
        };
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
.music-player-bar {
    position: relative;
    border-top: 2px solid #007bff;
    background: rgb(39, 38, 44);
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
    margin-top: -120px;
    margin-bottom: 5px;
    margin-left: 5px;
    padding: 2px;
    background: #007bff;
    box-shadow: 0px 6px 6px -2px rgba(0, 0, 0, 0.452), 0px 6px 16px -2px rgba(0, 0, 0, 0.582);
}
.frame-row {
    width: inherit;
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
