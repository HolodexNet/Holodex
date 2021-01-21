<template>
    <v-container fluid v-if="!isLoading && !hasError">
        <v-alert dense text type="info" dismissible v-model="firstVisitMugen" v-if="isMugen">
            Welcome to MugenClips! Everyone on this page is seeing the same randomly selected English Hololive clip.
            Watch along and chat with Hololive fans from across the world. If you skip ahead and want to be re-sync'd
            with everyone, please refresh the page
        </v-alert>
        <v-row>
            <v-col :lg="theatherMode ? 12 : 9" cols="12" class="px-0 pt-0 px-md-3">
                <WatchFrame :video="video" v-if="video.id">
                    <template v-slot:youtube>
                        <youtube
                            class="embedded-video"
                            :video-id="video.id"
                            @ready="ready"
                            :playerVars="{ ...(timeOffset && { start: timeOffset }), autoplay: 1, playsinline: 1 }"
                        >
                        </youtube>
                    </template>
                    <template v-slot:buttons>
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
                </WatchFrame>
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
            <v-col class="related-videos pt-0" :lg="theatherMode ? 12 : 3">
                <v-row fluid>
                    <v-col v-if="theatherMode" lg="9" class="pt-0">
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
                    <v-col cols="12" :lg="theatherMode ? 3 : 12" class="pa-0 pr-lg-3">
                        <WatchLiveChat v-if="hasLiveChat" :video="video" :mugenId="isMugen && '4ANxvWIM3Bs'" />
                        <WatchMugen @playNext="playNext" v-if="isMugen" />
                        <WatchRelatedVideos :related="related" />
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-container>
    <LoadingOverlay :isLoading="isLoading" :showError="hasError" v-else />
</template>

<script>
import LoadingOverlay from "@/components/common/LoadingOverlay";
import WatchInfo from "@/components/watch/WatchInfo";
import WatchFrame from "@/components/watch/WatchFrame";
import WatchRelatedVideos from "@/components/watch/WatchRelatedVideos";
import WatchLiveChat from "@/components/watch/WatchLiveChat";
import WatchComments from "@/components/watch/WatchComments";
import { decodeHTMLEntities } from "@/utils/functions";
import { mapState } from "vuex";
import { mdiOpenInNew, mdiRectangleOutline } from "@mdi/js";
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
        // ChannelChip,
        WatchRelatedVideos,
        WatchComments,
        // VideoTopic,
        WatchMugen: () => import("@/components/watch/WatchMugen"),
    },
    data() {
        return {
            theatherMode: false,
            startTime: 0,
            mdiOpenInNew,
            mdiRectangleOutline,
            icons,
        };
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

<style>
/* maintains 16:9 aspect ratio */
.embedded-video {
    position: relative;
    padding-bottom: min(56.25%, calc(100vh - 220px));
}

.embedded-video > iframe {
    position: absolute;
    width: 100%;
    height: 100%;
}

.embedded-chat {
    position: relative;
    min-height: 600px;
}

.embedded-chat > iframe {
    position: absolute;
    width: 100%;
    min-height: 600px;
}

.watch-card {
    border: none !important;
    box-shadow: none !important;
}

.thumbnail-overlay {
    background-color: rgba(0, 0, 0, 0.5);
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
}

.thumbnail {
    position: relative;
}
.watch-btn-group > .v-btn {
    margin-right: 5px;
}

.watch-chips > * {
    margin: 2.5px;
}

/* @media screen and (min-width: 600px) {
    .related-videos {
        min-width: 20px;
    }
} */
</style>
