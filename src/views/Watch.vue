<template>
    <div v-if="!isLoading && !hasError">
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
                    <WatchFrame :video="video" :key="'ytframe' + video.id">
                        <template v-slot:youtube>
                            <youtube
                                :key="'ytplayer' + video.id"
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
                            <v-btn icon lg @click="showLiveChat = !showLiveChat" v-if="hasLiveChat">
                                <v-icon>{{ showLiveChat ? mdiMessageOff : mdiMessage }}</v-icon>
                            </v-btn>
                            <v-tooltip bottom v-if="!$store.state.isMobile">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                        icon
                                        lg
                                        @click="theatherMode = !theatherMode"
                                        :color="theatherMode ? 'primary' : 'white'"
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
                        <WatchInfo :video="video" key="info" />
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
                            <WatchInfo :video="video" key="info" />
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
                                v-if="hasLiveChat && showLiveChat"
                                :video="video"
                                :mugenId="isMugen && '4ANxvWIM3Bs'"
                                :key="'ytchat' + video.id"
                            />
                            <WatchMugen @playNext="playNext" v-if="isMugen" />
                            <WatchRelatedVideos :related="related" />
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </v-container>
        <!-- Mobile Layout (sm/xs) Layout -->
        <div class="d-flex flex-column flex-sm-row" v-else>
            <div
                class="d-inline-flex flex-grow-1 flex-column"
                style="width: 100%"
                :style="{ 'padding-right': hasLiveChat && showLiveChat && landscape ? '220px' : 0 }"
            >
                <!-- Video/Video meta -->
                <WatchFrame :video="video" fluid :key="'ytframe' + video.id">
                    <template v-slot:youtube>
                        <youtube
                            :key="'ytplayer' + video.id"
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
                        <v-btn icon lg @click="showLiveChat = !showLiveChat" v-if="hasLiveChat">
                            <v-icon>{{ showLiveChat ? mdiMessageOff : mdiMessage }}</v-icon>
                        </v-btn>
                    </template>
                </WatchToolBar>
                <WatchInfo :video="video" key="info" />
                <WatchMugen @playNext="playNext" v-if="isMugen" />
                <WatchComments
                    :comments="comments"
                    :video="video"
                    :limit="$store.state.isMobile ? 5 : 0"
                    @timeJump="seekTo"
                    key="comments"
                    v-if="comments.length"
                />
                <WatchRelatedVideos :related="related" />
                <div :style="{ height: landscape ? '0' : '60vh' }"></div>
            </div>
            <!-- floated/fixed live chat -->
            <WatchLiveChat
                v-if="hasLiveChat && showLiveChat"
                :video="video"
                :mugenId="isMugen && '4ANxvWIM3Bs'"
                class="mobile-live-chat"
                :key="'ytchat' + video.id"
                :fixedRight="landscape"
                :fixedBottom="!landscape"
            />
        </div>
        <!-- Used to add spacing so bottom bar won't clash with description or videos -->
        <div style="height: 60px" v-if="$store.state.isMobile" />
    </div>
    <LoadingOverlay :isLoading="isLoading" :showError="hasError" v-else />
</template>

<script>
import VueYouTubeEmbed from "vue-youtube-embed";
import Vue from "vue";
import LoadingOverlay from "@/components/common/LoadingOverlay";
import WatchInfo from "@/components/watch/WatchInfo";
import WatchFrame from "@/components/watch/WatchFrame";
import WatchRelatedVideos from "@/components/watch/WatchRelatedVideos";
import WatchLiveChat from "@/components/watch/WatchLiveChat";
import WatchComments from "@/components/watch/WatchComments";
import WatchToolBar from "@/components/watch/WatchToolbar";
import { decodeHTMLEntities } from "@/utils/functions";
import { mapState } from "vuex";
import { mdiOpenInNew, mdiRectangleOutline, mdiMessage, mdiMessageOff } from "@mdi/js";
import * as icons from "@/utils/icons";
// import api from "@/utils/backend-api";

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
        WatchRelatedVideos,
        WatchComments,
        WatchToolBar,
        WatchMugen: () => import("@/components/watch/WatchMugen"),
    },
    data() {
        return {
            theatherMode: false,
            startTime: 0,
            mdiOpenInNew,
            mdiRectangleOutline,
            mdiMessage,
            mdiMessageOff,
            icons,

            showLiveChat: true,
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
            this.startTime = 0;
            if (this.isMugen) {
                this.initMugen();
                return;
            }
            this.$store.commit("watch/resetState");
            this.$store.commit("watch/setId", this.videoId);
            this.$store.dispatch("watch/fetchVideo").then(() => {
                if (!this.hasWatched && this.videoId) this.$store.commit("library/addWatchedVideo", this.video);
                // double check video type before querying for comments
                if (this.video.type === "stream") {
                    this.$store.dispatch("watch/fetchComments");
                }
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
            this.player.seekTo(time);
        },
        playNext({ video, timeOffset }) {
            this.$store.commit("watch/setVideo", video);
            this.startTime = timeOffset;
        },
    },
    computed: {
        ...mapState("watch", ["video", "comments", "isLoading", "hasError"]),
        related() {
            return {
                simulcasts: this.video.simulcasts || [],
                clips:
                    (this.video.clips &&
                        this.video.clips.filter((x) => this.$store.state.settings.clipLangs.includes(x.lang))) ||
                    [],
                sources: this.video.sources || [],
                refers: this.video.refers || [],
            };
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
            return (
                this.isMugen ||
                ((this.video.status === "live" || this.video.status === "upcoming") && !this.redirectMode)
            );
        },
        hasWatched() {
            return this.$store.getters["library/hasWatched"](this.video.id);
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

<style></style>
