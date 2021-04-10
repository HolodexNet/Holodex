<template>
    <div v-if="!isLoading && !hasError" ref="watchFullscreen" style="overflow-y: auto">
        <!-- Mugen info message -->
        <v-alert dense text type="info" dismissible v-model="firstVisitMugen" v-if="isMugen">
            Welcome to MugenClips! Everyone on this page is seeing the same randomly selected English Hololive clip.
            Watch along and chat with Hololive fans from across the world. If you skip ahead and want to be re-sync'd
            with everyone, please refresh the page
        </v-alert>
        <!-- Desktop (md/lg/xl) Layout -->
        <v-container v-if="!$store.state.isMobile" fluid>
            <v-row :class="{ 'flex-nowrap': !theatherMode }">
                <!-- Left side -->
                <v-col :md="theatherMode ? 12 : 9" cols="12" class="px-0 pt-0 px-md-3 flex-shrink-1">
                    <WatchFrame :video="video">
                        <template v-slot:youtube>
                            <youtube
                                v-if="video.id"
                                :video-id="video.id"
                                @ready="ready"
                                :playerVars="{
                                    ...(timeOffset && { start: timeOffset }),
                                    autoplay: $store.state.settings.autoplayVideo ? 1 : 0,
                                    playsinline: 1,
                                }"
                            >
                            </youtube>
                        </template>
                    </WatchFrame>
                    <WatchToolBar :video="video" noBackButton>
                        <template v-slot:buttons>
                            <v-tooltip bottom v-if="hasLiveTL && hasLiveChat && !$store.state.isMobile">
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
                                        <v-icon>{{ icons.mdiTranslate }}</v-icon>
                                    </v-btn>
                                </template>
                                <span>{{
                                    showTL ? $t("views.watch.chat.hideTLBtn") : $t("views.watch.chat.showTLBtn")
                                }}</span>
                            </v-tooltip>
                            <v-btn icon lg @click="showLiveChat = !showLiveChat" v-if="hasLiveChat">
                                <v-icon>{{ showLiveChat ? mdiMessageOff : mdiMessage }}</v-icon>
                            </v-btn>
                            <v-btn icon lg @click="toggleFullScreen">
                                <v-icon>{{ icons.mdiFullscreen }}</v-icon>
                            </v-btn>
                            <v-tooltip bottom v-if="!$store.state.isMobile">
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
                    <template v-if="!theatherMode">
                        <WatchInfo :video="video" key="info" @timeJump="seekTo" />
                        <v-divider />
                        <WatchComments
                            :comments="comments"
                            :video="video"
                            :limit="$store.state.isMobile ? 5 : 0"
                            @timeJump="seekTo"
                            key="comments"
                            v-if="comments.length"
                        />
                    </template>
                </v-col>
                <!-- Right side -->
                <v-col class="related-videos pt-0" :md="theatherMode ? 12 : 3" style="min-width: 324px">
                    <v-row fluid>
                        <v-col v-if="theatherMode" md="9" class="pt-0">
                            <WatchInfo :video="video" key="info" @timeJump="seekTo" />
                            <v-divider />
                            <WatchComments
                                :comments="comments"
                                :video="video"
                                :limit="$store.state.isMobile ? 5 : 0"
                                @timeJump="seekTo"
                                key="comments"
                                v-if="comments.length"
                            />
                        </v-col>
                        <v-col cols="12" :md="theatherMode ? 3 : 12" class="pa-0 pr-lg-3">
                            <WatchLiveChat
                                v-if="showChatWindow"
                                :video="video"
                                :mugenId="isMugen && '4ANxvWIM3Bs'"
                                :key="'ytchat' + isMugen ? '4ANxvWIM3Bs' : video.id"
                                @videoUpdate="handleVideoUpdate"
                                :showTL="showTL"
                                :showTLFirstTime="showTLFirstTime"
                                :showLiveChat="showLiveChat"
                                :isMugen="isMugen"
                                @historyLength="handleHistoryLength"
                            />
                            <WatchMugen @playNext="playNext" v-if="isMugen" />
                            <WatchSideBar :video="video" @timeJump="seekTo" />
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </v-container>
        <!-- Mobile Layout (sm/xs) Layout -->
        <div class="d-flex flex-column flex-sm-row layout-mobile" v-else>
            <div
                class="d-inline-flex flex-grow-1 flex-column"
                :style="{
                    'padding-right': showChatWindow && landscape ? '220px' : 0,
                    'min-height': landscape || !showLiveChat ? '0' : '160vh',
                    width: '100%',
                }"
            >
                <!-- Video/Video meta -->
                <WatchFrame :video="video" fluid>
                    <template v-slot:youtube>
                        <youtube
                            v-if="video.id"
                            :video-id="video.id"
                            @ready="ready"
                            :playerVars="{
                                ...(timeOffset && { start: timeOffset }),
                                autoplay: $store.state.settings.autoplayVideo ? 1 : 0,
                                playsinline: 1,
                            }"
                        >
                        </youtube>
                    </template>
                </WatchFrame>
                <WatchToolBar :video="video">
                    <template v-slot:buttons>
                        <v-btn
                            icon
                            lg
                            @click="toggleTL"
                            :color="showTL ? 'primary' : ''"
                            v-if="hasLiveTL && hasLiveChat"
                        >
                            <div class="notification-sticker" v-if="newTL > 0"></div>
                            <v-icon>{{ icons.mdiTranslate }}</v-icon>
                        </v-btn>
                        <v-btn icon lg @click="showLiveChat = !showLiveChat" v-if="hasLiveChat">
                            <v-icon>{{ showLiveChat ? mdiMessageOff : mdiMessage }}</v-icon>
                        </v-btn>
                        <v-btn icon lg @click="toggleFullScreen">
                            <v-icon>{{ icons.mdiFullscreen }}</v-icon>
                        </v-btn>
                    </template>
                </WatchToolBar>
                <WatchInfo :video="video" key="info" @timeJump="seekTo" />
                <WatchMugen @playNext="playNext" v-if="isMugen" />
                <WatchComments
                    :comments="comments"
                    :video="video"
                    :limit="$store.state.isMobile ? 5 : 0"
                    @timeJump="seekTo"
                    key="comments"
                    v-if="comments.length"
                />
                <WatchSideBar :video="video" @timeJump="seekTo" />
            </div>
            <!-- floated/fixed live chat -->
            <WatchLiveChat
                v-if="showChatWindow"
                :video="video"
                :mugenId="isMugen && '4ANxvWIM3Bs'"
                class="mobile-live-chat"
                :key="'ytchat' + isMugen ? '4ANxvWIM3Bs' : video.id"
                @videoUpdate="handleVideoUpdate"
                :fixedRight="landscape"
                :fixedBottom="!landscape"
                :showTL="showTL"
                :showTLFirstTime="showTLFirstTime"
                :showLiveChat="showLiveChat"
                :isMugen="isMugen"
                @historyLength="handleHistoryLength"
            />
        </div>
    </div>
    <LoadingOverlay :isLoading="isLoading" :showError="hasError" v-else />
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

import { decodeHTMLEntities } from "@/utils/functions";
import { mapState } from "vuex";
import { mdiOpenInNew, mdiRectangleOutline, mdiMessage, mdiMessageOff } from "@mdi/js";

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
        WatchMugen: () => import("@/components/watch/WatchMugen.vue"),
    },
    data() {
        return {
            theatherMode: false,
            startTime: 0,
            mdiOpenInNew,
            mdiRectangleOutline,
            mdiMessage,
            mdiMessageOff,

            showTL: false,
            showTLFirstTime: false,
            newTL: 0,

            showLiveChat: true,

            fullScreen: false,
        };
    },
    created() {
        Vue.use(VueYouTubeEmbed);
    },
    mounted() {
        this.init();
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
                if (!this.hasWatched && this.videoId) this.$store.commit("library/addWatchedVideo", this.video);
            });
        },
        initMugen() {
            this.$store.commit("watch/resetState");
            this.$store.commit("watch/fetchEnd");
        },
        ready(event) {
            this.player = event.target;
        },
        seekTo(time) {
            if (!this.player) return;
            window.scrollTo(0, 0);
            this.player.seekTo(time);
            this.player.playVideo();
        },
        playNext({ video, timeOffset }) {
            this.$store.commit("watch/setVideo", video);
            this.startTime = timeOffset;
        },
        handleVideoUpdate(update) {
            this.video.live_viewers = update.live_viewers;
            this.video.status = update.status;
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
            // showTLFirstTime will initiate connection
            // showTL toggle will show/hide without terminating connection
            if (!this.showTLFirstTime) {
                this.showTLFirstTime = true;
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
    },
    computed: {
        ...mapState("watch", ["video", "isLoading", "hasError"]),
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
            return this.isMugen || this.video.status === "live" || this.video.status === "upcoming";
        },
        hasLiveTL() {
            return this.video.status === "live" || this.video.status === "upcoming";
        },
        hasWatched() {
            return this.$store.getters["library/hasWatched"](this.video.id);
        },
        showChatWindow() {
            return this.hasLiveChat && (this.showLiveChat || this.showTL);
        },
        isMugen() {
            return this.$route.name === "mugen-clips";
        },
        landscape() {
            return this.$vuetify.breakpoint.width >= 568;
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
</style>
