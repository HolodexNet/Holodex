<template>
    <v-container fluid v-if="!isLoading && !hasError">
        <v-row>
            <v-col :lg="4" cols="12" class="px-0 pt-0 px-md-3">
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
                <WatchInfo :video="video" key="info" />
            </v-col>
            <v-col class="related-videos pt-0" :lg="8">
                <v-row fluid>
                    <v-tabs v-model="currentTab">
                        <v-tab>Topic</v-tab>
                        <v-tab>Channel Mentions</v-tab>
                        <v-tab>Sources/Clips</v-tab>
                        <v-tab>Songs</v-tab>
                    </v-tabs>
                    <v-col cols="12" class="pa-4">
                        <!-- <WatchLiveChat v-if="hasLiveChat" :video="video" /> -->
                        <!-- <WatchRelatedVideos :related="related" /> -->
                        <div v-show="currentTab === TABS.TOPIC">
                            <v-card-title>
                                <v-icon left>{{ icons.mdiAnimationPlay }}</v-icon>
                                <h5>Change stream topic</h5>
                            </v-card-title>
                            <v-card-text>
                                <v-select :items="topics" label="Topic (leave empty to unset)" v-model="newTopic" />
                            </v-card-text>
                            <!-- <v-card-actions>
                                <v-btn color="blue darken-1" text @click="dialog = false"> Close </v-btn>
                                <v-btn color="blue darken-1" text @click="saveTopic"> Save </v-btn>
                            </v-card-actions> -->
                        </div>
                        <div v-show="currentTab === TABS.SONGS">
                            <video-songs :video="video"></video-songs>
                        </div>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-container>
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
import VideoSongs from "@/components/media/VideoSongs";
import { decodeHTMLEntities } from "@/utils/functions";
import * as icons from "@/utils/icons";
import api from "@/utils/backend-api";

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
        VideoSongs,
        WatchMugen: () => import("@/components/watch/WatchMugen"),
    },
    data() {
        return {
            isLoading: true,
            hasError: false,
            id: 0,
            video: null,
            startTime: 0,
            icons,
            currentTab: 0,
            TABS: Object.freeze({
                TOPIC: 0,
                MENTIONS: 1,
                SOURCES_CLIPS: 2,
                SONGS: 3,
            }),

            newTopic: null,
            topics: [],
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
            this.id = this.videoId;
            this.fetchVideo();
            this.initTab();
        },
        initTab() {
            if (this.currentTab === this.TABS.TOPIC) {
                this.populateTopics();
            }
        },
        ready(event) {
            this.player = event.target;
        },
        seekTo(time) {
            if (!this.player) return;
            this.player.seekTo(time);
        },
        fetchVideo() {
            if (!this.id) throw new Error("Invalid id");
            this.isLoading = true;
            return api
                .video(this.id)
                .then(({ data }) => {
                    this.video = data;
                    this.isLoading = false;
                })
                .catch((e) => {
                    this.hasError = true;
                    console.error(e);
                });
        },
        async populateTopics() {
            this.topics = (await api.topics()).data.map((topic) => ({
                value: topic.id,
                text: `${topic.id} (${topic.count ?? 0})`,
            }));
        },
        saveTopic() {
            this.dialog = false;
            api.topicSet(this.newTopic, this.videoId, this.$store.state.userdata.jwt);
            this.topic = this.newTopic;
        },
    },
    computed: {
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
            return (this.video && this.video.title && decodeHTMLEntities(this.video.title)) || "";
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
        currentTab() {
            this.initTab();
        },
    },
};
</script>

<style>
/* maintains 16:9 aspect ratio */
/* .embedded-video {
    position: relative;
    padding-bottom: 56.25%;
    padding-bottom: min(56.25%, calc(100vh - 220px));
}

.embedded-video > iframe {
    position: absolute;
    width: 100%;
    height: 100%;
} */

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
</style>
