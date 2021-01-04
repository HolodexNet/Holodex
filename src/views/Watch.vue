<template>
    <v-container fluid v-if="!isLoading && !hasError">
        <v-row class="align-start">
            <v-col class="pa-0 pa-lg-3" cols="12" lg="9">
                <WatchFrame
                    v-if="video"
                    :video="video"
                    :translations="translations"
                    :otherMessages="otherMessages"
                    :currentTime="currentTime"
                >
                    <template v-slot:youtube>
                        <youtube
                            class="embedded-video"
                            :video-id="video.id"
                            @ready="ready"
                            @playing="playing"
                            @paused="paused"
                            :playerVars="{ autoplay: 1, playsinline: 1 }"
                        >
                        </youtube>
                    </template>
                </WatchFrame>
                <!-- <WatchTimeline
                    :v-if="translations.length"
                    :video="video"
                    :translations="translations"
                    :otherMessages="otherMessages"
                    :currentTime="currentTime"
                    class="pa-3"
                >
                </WatchTimeline> -->
                <WatchInfo :video="video" />
            </v-col>
            <v-col cols="12" sm="12" lg="3" xl="3" md="12" class="related-videos pa-1">
                <!-- <WatchTranscript
                    :translations="translations"
                    :otherMessages="otherMessages"
                    :currentTime="currentTime"
                /> -->
                <div class="embedded-chat" v-if="hasLiveChat & !hideLiveChat">
                    <iframe :src="liveChatUrl" frameborder="0" />
                </div>
                <div class="text-end pa-1 text-caption" v-if="hasLiveChat">
                    <a @click="hideLiveChat = !hideLiveChat"> {{ hideLiveChat ? "Show" : "Hide" }} Live Chat </a>
                </div>
                <WatchRelatedVideos :videoSources="videoSources" :videoClips="videoClips" />
            </v-col>
        </v-row>
    </v-container>
    <LoadingOverlay :isLoading="isLoading" :showError="hasError" v-else />
</template>

<script>
// import api from "@/utils/backend-api";
import LoadingOverlay from "@/components/common/LoadingOverlay";
import WatchInfo from "@/components/watch/WatchInfo";
import WatchFrame from "@/components/watch/WatchFrame";
import WatchRelatedVideos from "@/components/watch/WatchRelatedVideos";
// import WatchTimeline from "@/components/watch/WatchTimeline";
// import WatchTranscript from "@/components/watch/WatchTranscript";
import VideoDescription from "@/components/video/VideoDescription";
import { getVideoThumbnails, decodeHTMLEntities } from "@/utils/functions";
import { mapState } from "vuex";

export default {
    name: "Watch",
    metaInfo() {
        return {
            title: this.video.title,
            meta: [
                {
                    vmid: "description",
                    name: "description",
                    property: "og:description",
                    content: this.metaDescription,
                },
                {
                    vmid: "image",
                    name: "image",
                    content: this.metaImage,
                },
                {
                    vmid: "url",
                    property: "og:url",
                    content: `https://holodex.net/watch/${this.$route.params.id}`,
                },
            ],
        };
    },
    components: {
        LoadingOverlay,
        WatchInfo,
        WatchFrame,
        // WatchTimeline,
        // WatchTranscript,
        VideoDescription,
        WatchRelatedVideos,
    },
    data() {
        return {
            translations: [],
            otherMessages: [],
            hideLiveChat: false,
            currentTime: 0,
            timer: null,
        };
    },
    created() {
        this.$store.commit("watch/resetState");
        this.$store.commit("watch/setId", this.videoId);
        this.$store.dispatch("watch/fetchVideo").then(() => {
            if (!this.hasWatched) this.$store.commit("library/addWatchedVideo", this.video);
        });
    },
    methods: {
        loadData() {
            this.$store.commit("watch/resetState");
            this.$store.commit("watch/setId", this.videoId);
            this.$store.dispatch("watch/fetchVideo").then(() => {
                if (!this.hasWatched) this.$store.commit("library/addWatchedVideo", this.video);
            });
        },
        ready(event) {
            this.player = event.target;
        },
        startSync() {
            // to be replaced by has transcript check
            if (!this.hasLiveChat) return;
            const vm = this;
            this.timer = setInterval(() => {
                vm.currentTime = vm.player.getCurrentTime();
            }, 1000);
        },
        stopSync() {
            // to be replaced by has transcript check
            if (!this.hasLiveChat) return;
            clearInterval(this.timer);
            this.timer = null;
        },
        playing(event) {
            console.log(event.target.getCurrentTime());
            this.startSync();
            // this.updateMessages(this.player.getCurrentTime());
        },
        paused(event) {
            console.log(event);
            this.stopSync();
        },
    },
    computed: {
        ...mapState("watch", ["video", "isLoading", "hasError"]),
        videoClips() {
            return this.video?.clips || [];
        },
        videoSources() {
            return this.video?.sources || [];
        },
        videoId() {
            return this.$route?.params?.id || this.$route?.query?.v;
        },
        liveChatUrl() {
            if (!this.video) return null;
            return `https://www.youtube.com/live_chat?v=${this.video.id}&embed_domain=${
                window.location.hostname
            }&dark_theme=${this.$vuetify.theme.dark ? 1 : 0}`;
        },
        title() {
            return decodeHTMLEntities(this.video.title) || "";
        },
        hasLiveChat() {
            return (
                (this.video.status === "live" || this.video.status === "upcoming") &&
                !this.redirectMode &&
                this.liveChatUrl &&
                !this.isXs
            );
        },
        hasWatched() {
            return this.$store.getters["library/hasWatched"](this.video.id);
        },
        metaDescription() {
            return this.video?.description?.substr(0, 100);
        },
        metaTitle() {
            return this.video?.title;
        },
        metaImage() {
            if (!this.video.id) return undefined;
            return getVideoThumbnails(this.video.id).maxres;
        },
    },
    watch: {
        // eslint-disable-next-line func-names
        "$route.params.id": function (val) {
            this.loadData(val);
        },
        // eslint-disable-next-line func-names
        "$route.query.v": function (val) {
            this.loadData(val);
        },
    },
};
</script>

<style>
/* maintains 16:9 aspect ratio */
.embedded-video {
    position: relative;
    padding-bottom: 56.25%;
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

@media screen and (min-width: 600px) {
    .related-videos {
        min-width: 350px;
    }
}
</style>
