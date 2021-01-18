<template>
    <v-container fluid v-if="!isLoading && !hasError">
        <v-row>
            <v-col :lg="theatherMode ? 12 : 9" cols="12" class="pt-0 px-sm-0 px-md-3">
                <WatchFrame v-if="video.id" :video="video">
                    <template v-slot:youtube>
                        <youtube
                            class="embedded-video"
                            :video-id="video.id"
                            @ready="ready"
                            :playerVars="{ start: timeOffset, autoplay: 1, playsinline: 1 }"
                        >
                        </youtube>
                    </template>
                    <template v-slot:buttons>
                        <v-tooltip bottom>
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
                <WatchInfo :video="video" v-if="!theatherMode && video.channel" :fetchComments="true" key="info" />
                <v-divider />
                <WatchComments
                    :comments="comments"
                    :video="video"
                    :limit="$store.state.isMobile ? 5 : 0"
                    @timeJump="seekTo"
                />
            </v-col>
            <v-col class="related-videos pt-0" :lg="theatherMode ? 12 : 3">
                <v-row fluid>
                    <v-col v-if="theatherMode" lg="9" class="pt-0">
                        <WatchInfo :video="video" :fetchComments="true" key="info" />
                    </v-col>
                    <v-col cols="12" :lg="theatherMode ? 3 : 12" class="pt-0 pl-lg-0">
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
import { getVideoThumbnails, decodeHTMLEntities } from "@/utils/functions";
import { mapState } from "vuex";
import { mdiOpenInNew, mdiRectangleOutline } from "@mdi/js";
import * as icons from "@/utils/icons";
import api from "@/utils/backend-api";

export default {
    name: "Watch",
    metaInfo() {
        const vm = this;
        return {
            get title() {
                return vm.video.title;
            },
            // meta: [
            //     {
            //         vmid: "description",
            //         name: "description",
            //         property: "og:description",
            //         content: this.metaDescription,
            //     },
            //     {
            //         vmid: "image",
            //         name: "image",
            //         content: this.metaImage,
            //     },
            //     {
            //         vmid: "url",
            //         property: "og:url",
            //         content: `https://holodex.net/watch/${this.$route.params.id}`,
            //     },
            // ],
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
            // mdiOverscan,
            mdiRectangleOutline,
            icons,
            comments: [],
        };
    },
    created() {
        this.isMugen ? this.initMugen() : this.init();
        api.comments(this.videoId).then((res) => {
            this.comments = res.data;
        });
    },
    methods: {
        init() {
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
            // if(this.startTime) {
            //     this.player.seekTo(this.timeOffset);
            // }
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
        ...mapState("watch", ["video", "isLoading", "hasError"]),
        related() {
            return {
                clips:
                    (this.video.clips &&
                        this.video.clips.filter((x) => this.$store.state.settings.clipLangs.includes(x.lang))) ||
                    [],
                simulcasts: this.video.simulcasts || [],
                refers: this.video.refers || [],
                sources: this.video.sources || [],
            };
        },
        videoId() {
            return this.$route.params.id || this.$route.query.v;
        },
        timeOffset() {
            return +this.$route.query.t || this.startTime;
        },
        title() {
            return decodeHTMLEntities(this.video.title) || "";
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
        metaDescription() {
            return this.video && this.video.description && this.video.description.substr(0, 100);
        },
        metaTitle() {
            return decodeHTMLEntities(this.video.title) || "";
        },
        metaImage() {
            if (!this.video.id) return undefined;
            return getVideoThumbnails(this.video.id).maxres;
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
