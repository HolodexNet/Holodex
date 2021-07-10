<template>
    <LoadingOverlay :isLoading="isLoading" :showError="hasError" v-if="isLoading || hasError" />
    <div
        v-else
        ref="watchFullscreen"
        style="overflow-y: auto"
        :style="{
            'overflow-y': showChatWindow && isMobile && !landscape ? 'hidden' : 'auto',
            'max-height': showChatWindow && isMobile && !landscape ? '100vh' : '',
        }"
    >
        <!-- Mugen info message -->
        <v-alert dense text type="info" dismissible v-model="firstVisitMugen" v-if="isMugen">
            {{ $t("views.mugen.welcome") }}
        </v-alert>

        <div
            class="d-flex flex-column pa-md-3"
            :class="{
                'flex-nowrap': !theatherMode,
                'flex-sm-row': !theatherMode,
            }"
        >
            <div
                class="d-inline-flex flex-shrink-1 flex-column py-0 pl-0"
                :md="theatherMode ? 12 : 9"
                :style="{
                    'padding-right': isMobile && showChatWindow && landscape ? '220px' : 0,
                    width: '100%',
                }"
            >
                <WatchFrame :video="video" :fluid="isMobile">
                    <template v-slot:youtube>
                        <youtube
                            v-if="video.id"
                            :video-id="video.id"
                            @ready="ready"
                            :playerVars="{
                                ...(timeOffset && { start: timeOffset }),
                                autoplay: isMugen || isPlaylist ? 1 : 0,
                                playsinline: 1,
                            }"
                            @ended="ended"
                        >
                        </youtube>
                    </template>
                </WatchFrame>
                <WatchToolBar :video="video" :noBackButton="!isMobile">
                    <template v-slot:buttons>
                        <v-tooltip bottom v-if="hasLiveTL">
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    icon
                                    lg
                                    @click="toggleTL"
                                    :color="showTL ? 'primary' : ''"
                                    v-bind="attrs"
                                    v-on="on"
                                >
                                    <div class="notification-sticker" v-if="newTL > 0"></div>
                                    <v-icon
                                        >M20,2H4C2.9,2,2,2.9,2,4v18l4-4h14c1.1,0,2-0.9,2-2V4C22,2.9,21.1,2,20,2z
                                        M4,10h4v2H4V10z M14,16H4v-2h10V16z M20,16h-4v-2 h4V16z
                                        M20,12H10v-2h10V12z</v-icon
                                    >
                                </v-btn>
                            </template>
                            <span>{{
                                showTL ? $t("views.watch.chat.hideTLBtn") : $t("views.watch.chat.showTLBtn")
                            }}</span>
                        </v-tooltip>
                        <v-btn
                            icon
                            lg
                            @click="showLiveChat = !showLiveChat"
                            v-if="hasLiveChat && showLiveChatOverride"
                            :color="showLiveChat ? 'primary' : ''"
                        >
                            <v-icon
                                >M20,2H4C2.9,2,2,2.9,2,4v18l4-4h14c1.1,0,2-0.9,2-2V4C22,2.9,21.1,2,20,2z
                                M9.9,10.8v3.8h-2v-3.8L5.1,6.6h2.4l1.4,2.2 l1.4-2.2h2.4L9.9,10.8z
                                M18.9,8.6h-2v6h-2v-6h-2v-2h6V8.6z</v-icon
                            >
                        </v-btn>
                        <v-btn icon lg @click="toggleFullScreen">
                            <v-icon>{{ icons.mdiFullscreen }}</v-icon>
                        </v-btn>
                        <v-tooltip bottom v-if="!isMobile">
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    icon
                                    lg
                                    @click="theatherMode = !theatherMode"
                                    :color="theatherMode ? 'primary' : ''"
                                    v-bind="attrs"
                                    v-on="on"
                                >
                                    <v-icon>{{ mdiRectangleOutline }}</v-icon>
                                </v-btn>
                            </template>
                            <span>{{ $t("views.watch.theaterMode") }}</span>
                        </v-tooltip>
                    </template>
                </WatchToolBar>
                <WatchInfo :video="video" key="info" @timeJump="seekTo" v-if="!theatherMode" />
                <WatchQuickEditor v-if="role === 'admin' || role === 'editor'" :video="video" />
                <!-- Mobile mode only sidebar -->
                <WatchSideBar :video="video" @timeJump="seekTo" v-if="isMobile" />
                <!-- Mobile mode Mugen -->
                <WatchMugen @playNext="playNextMugen" v-if="isMugen && isMobile" />
                <WatchComments
                    :comments="comments"
                    :video="video"
                    :limit="isMobile ? 5 : 0"
                    @timeJump="seekTo"
                    key="comments"
                    v-if="comments.length && !theatherMode"
                />
            </div>
            <div class="related-videos pt-0 row ma-0" :class="{ 'sidebar-width': !isMobile && !theatherMode }">
                <v-col v-if="theatherMode" md="8" lg="9" class="pa-0">
                    <WatchInfo :video="video" key="info" @timeJump="seekTo" />
                    <WatchQuickEditor v-if="role === 'admin' || role === 'editor'" :video="video" />
                    <v-divider />
                    <WatchComments
                        :comments="comments"
                        :video="video"
                        :limit="isMobile ? 5 : 0"
                        @timeJump="seekTo"
                        key="comments"
                        v-if="comments.length"
                    />
                </v-col>
                <v-col :md="theatherMode ? 4 : 12" :lg="theatherMode ? 3 : 12" class="py-0 pr-0 pl-0 pl-md-3">
                    <WatchLiveChat
                        v-if="showChatWindow"
                        :video="video"
                        :mugenId="isMugen && '4ANxvWIM3Bs'"
                        :key="'ytchat' + isMugen ? '4ANxvWIM3Bs' : video.id"
                        @videoUpdate="handleVideoUpdate"
                        :fixedRight="isMobile && landscape"
                        :fixedBottom="isMobile && !landscape"
                        :showTL="showTL"
                        :hintConnectLiveTL="hintConnectLiveTL"
                        :showLiveChat="showLiveChat"
                        :isMugen="isMugen"
                        @historyLength="handleHistoryLength"
                    />
                    <template v-if="!isMobile">
                        <WatchPlaylist @playNext="playNextPlaylist" v-model="playlistIndex" />
                        <WatchMugen @playNext="playNextMugen" v-if="isMugen" />
                        <WatchSideBar :video="video" @timeJump="seekTo" />
                    </template>
                </v-col>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import VueYouTubeEmbed from "vue-youtube-embed";
import Vue from "vue";
import LoadingOverlay from "@/components/common/LoadingOverlay.vue";
import WatchInfo from "@/components/watch/WatchInfo.vue";
import WatchFrame from "@/components/watch/WatchFrame.vue";
import WatchSideBar from "@/components/watch/WatchSideBar.vue";
import WatchLiveChat from "@/components/watch/WatchLiveChat.vue";
import WatchComments from "@/components/watch/WatchComments.vue";
import WatchToolBar from "@/components/watch/WatchToolbar.vue";
import WatchQuickEditor from "@/components/watch/WatchQuickEditor.vue";

import { decodeHTMLEntities, syncState } from "@/utils/functions";
import { mapState } from "vuex";
import { mdiOpenInNew, mdiRectangleOutline, mdiMessage, mdiMessageOff } from "@mdi/js";

Vue.use(VueYouTubeEmbed);

export default {
    name: "Watch",
    metaInfo() {
        return {
            title: this.title,
        };
    },
    components: {
        LoadingOverlay,
        WatchInfo,
        WatchFrame,
        WatchLiveChat,
        WatchSideBar,
        WatchComments,
        WatchToolBar,
        WatchQuickEditor,
        WatchMugen: () => import("@/components/watch/WatchMugen.vue"),
        WatchPlaylist: () => import("@/components/watch/WatchPlaylist.vue"),
    },
    data() {
        return {
            startTime: 0,
            mdiOpenInNew,
            mdiRectangleOutline,
            mdiMessage,
            mdiMessageOff,

            // theatherMode: false,

            // showTL: false,
            hintConnectLiveTL: false,
            newTL: 0,

            // when live/upcoming = true, when archive = false
            showLiveChatOverride: true,
            fullScreen: false,

            playlistIndex: -1,
        };
    },
    mounted() {
        this.init();
        if (this.showTL && !this.hintConnectLiveTL) {
            this.hintConnectLiveTL = true;
        }
    },
    destroyed() {
        this.$store.commit("deleteActiveVideo", this.video.id);
    },
    methods: {
        init() {
            window.scrollTo(0, 0);
            this.startTime = 0;
            if (this.isMugen) {
                this.initMugen();
                return;
            }
            this.$store.commit("watch/resetState");
            this.$store.commit("watch/setId", this.videoId);
            this.$store.dispatch("watch/fetchVideo").then(() => {
                this.$store.dispatch("history/addWatchedVideo", this.video);
            });
        },
        initMugen() {
            this.$store.commit("watch/resetState");
            this.$store.commit("watch/fetchEnd");
        },
        ready(event) {
            this.player = event.target;
            this.$store.commit("setActiveVideo", {
                videoId: this.video.id,
                playerObj: this.player,
            });
        },
        seekTo(time) {
            if (!this.player) return;
            window.scrollTo(0, 0);
            this.player.seekTo(time);
            this.player.playVideo();
        },
        playNextMugen({ video, timeOffset = 0 }) {
            this.$store.commit("watch/setVideo", video);
            this.startTime = timeOffset;
        },
        playNextPlaylist({ video }) {
            this.$router.push({
                path: `/watch/${video.id}`,
                query: {
                    playlist: this.$route.query.playlist,
                },
            });
        },
        handleVideoUpdate(update) {
            this.video.live_viewers = update.live_viewers;
            this.video.status = update.status;
            this.video.start_actual = update.start_actual;
        },
        toggleFullScreen() {
            if (!document.fullscreenElement) {
                this.fullScreen = true;
                this.$refs.watchFullscreen.requestFullscreen();
            } else if (document.exitFullscreen) {
                document.exitFullscreen();
                this.fullScreen = false;
            }
        },
        toggleTL() {
            // hintConnectLiveTL will initiate connection
            // showTL toggle will show/hide without terminating connection
            if (!this.hasLiveTL) return;

            if (!this.hintConnectLiveTL) {
                this.hintConnectLiveTL = true;
                this.showTL = true;
                return;
            }
            this.showTL = !this.showTL;
            this.newTL = 0;
        },
        handleHistoryLength() {
            if (!this.showTL) {
                this.newTL += 1;
            }
        },
        ended() {
            // if playlistIndex is set to -1 we aren't playing playlists.
            if (this.playlistIndex >= 0) {
                this.playlistIndex += 1;
            }
        },
    },
    computed: {
        ...mapState("watch", ["video", "isLoading", "hasError"]),
        ...syncState("watch", ["showTL"]),
        showLiveChat: {
            get() {
                return this.$store.state.watch.showLiveChat && this.showLiveChatOverride;
            },
            set(val) {
                this.$store.commit("watch/setShowLiveChat", val);
            },
        },
        videoId() {
            return this.$route.params.id || this.$route.query.v;
        },
        timeOffset() {
            return +this.$route.query.t || this.startTime;
        },
        title() {
            return (this.video.title && decodeHTMLEntities(this.video.title)) || "";
        },
        hasLiveChat() {
            return this.isMugen || this.video.type === "stream";
        },
        hasLiveTL() {
            return this.video.type === "stream";
        },
        showChatWindow() {
            return this.hasLiveChat && (this.showLiveChat || this.showTL);
        },
        isMugen() {
            return this.$route.name === "mugen-clips";
        },
        isMobile() {
            return this.$store.state.isMobile;
        },
        landscape() {
            return this.$vuetify.breakpoint.width >= 568;
        },
        theatherMode: {
            get() {
                return this.$store.state.watch.theatherMode && !this.isMobile;
            },
            set(val) {
                return this.$store.commit("watch/setTheatherMode", val);
            },
        },
        firstVisitMugen: {
            get() {
                return this.$store.state.firstVisitMugen;
            },
            set() {
                return this.$store.commit("setVisitedMugen");
            },
        },
        comments() {
            return this.video.comments || [];
        },
        isPlaylist() {
            return this.$route.query.playlist;
        },
        role() {
            return this.$store.state.userdata?.user?.role;
        },
    },
    watch: {
        // eslint-disable-next-line func-names
        "$route.params.id": function () {
            this.init();
        },
        // eslint-disable-next-line func-names
        "$route.query.v": function () {
            this.init();
        },
        video() {
            this.showLiveChatOverride =
                this.video.type === "stream" &&
                (["upcoming", "live"].includes(this.video.status) || !!(window as any).extensionSupport);
        },
    },
};
</script>

<style>
div.notification-sticker {
    position: absolute;
    top: 1px;
    right: 2px;
    border-radius: 4px;
    width: 8px;
    height: 8px;
    background-color: rgb(230, 33, 23);
}

.sidebar-width {
    flex: 0 0 25%;
    max-width: 25%;
    min-width: 324px;
}

.min-sidebar-width {
    min-width: 320px;
}
</style>
