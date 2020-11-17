<template>
    <v-container fluid v-if="!isLoading && !showError">
        <v-row class="align-start">
            <v-col class="pa-0 pa-lg-3">
                <WatchFrame :video="video" />
                <WatchInfo :video="video" />
            </v-col>
            <v-col
                cols="12"
                sm="12"
                lg="3"
                xl="3"
                md="12"
                class="related-videos pa-1"
            >
                <div class="embedded-chat" v-if="hasLiveChat & !hideLiveChat">
                    <iframe :src="live_chat_src" frameborder="0" />
                </div>
                <div class="text-end pa-1 text-caption" v-if="hasLiveChat">
                    <a @click="hideLiveChat = !hideLiveChat">
                        {{ hideLiveChat ? "Show" : "Hide" }} Live Chat
                    </a>
                </div>
                <div class="text-subtitle-2 ma-2" v-if="video_clips.length > 0">
                    Clips
                </div>
                <VideoCardList
                    :videos="video_clips"
                    horizontal
                    includeChannel
                    :cols="{
                        lg: 12,
                        md: 12,
                        cols: 12,
                        sm: 12,
                    }"
                />
                <v-divider />
                <div
                    class="text-subtitle-2 ma-2"
                    v-if="video_sources.length > 0"
                >
                    Related
                </div>
                <VideoCardList
                    :videos="video_sources"
                    horizontal
                    includeChannel
                    :cols="{
                        lg: 12,
                        md: 4,
                        cols: 12,
                        sm: 6,
                    }"
                />
                <div
                    v-if="video_sources.length + video_clips.length == 0"
                    style="text-align: center;"
                    class="pa-2"
                >
                    No clips or related video yet
                </div>
            </v-col>
        </v-row>
    </v-container>
    <LoadingOverlay :isLoading="isLoading" :showError="showError" v-else />
</template>

<script>
import api from "@/utils/backend-api";
import VideoCardList from "@/components/VideoCardList";
import LoadingOverlay from "@/components/LoadingOverlay";
import WatchInfo from "@/components/WatchInfo.vue";
import WatchFrame from "@/components/WatchFrame.vue";
import { video_thumbnails } from "@/utils/functions";

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
                    content: "https://holodex.net/channel/" + this.channel_id,
                },
            ],
        };
    },
    components: {
        VideoCardList,
        LoadingOverlay,
        WatchInfo,
        WatchFrame,
    },
    data() {
        return {
            isLoading: true,
            showError: false,
            video: {},
            video_clips: [],
            video_sources: [],
            video_src: "",
            live_chat_src: "",
            hideLiveChat: false,
        };
    },
    created() {
        this.loadData(this.$route.params.id);
    },
    methods: {
        loadData(id) {
            // destroy iframe and recreate it so it doesn't break history mode
            this.video_src = "";
            this.isLoading = true;
            api.video(id)
                .then(res => {
                    if (res.data) {
                        this.video_clips = res.data.clips;
                        this.video_sources = res.data.sources;
                        this.video = res.data;
                        this.video_src = `https://www.youtube.com/embed/${this.video.yt_video_key}?autoplay=1&rel=0&widget_referrer=${window.location.hostname}`;
                        this.live_chat_src = `https://www.youtube.com/live_chat?v=${this.video.yt_video_key}&embed_domain=${window.location.hostname}&dark_theme=1`;
                        if (!this.hasWatched) this.setWatched();
                    }
                })
                .catch(e => {
                    console.log(e);
                    this.showError = true;
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
        setWatched() {
            this.$store.commit("addWatchedVideo", this.video);
        },
    },
    computed: {
        hasLiveChat() {
            return (
                (this.video.status == "live" ||
                    this.video.status == "upcoming") &&
                !this.redirectMode &&
                this.video_src &&
                !this.isXs
            );
        },
        hasWatched() {
            if (!this.video) return false;
            return this.$store.getters.hasWatched(this.video.id);
        },
        metaDescription() {
            if (!this.video.description) return undefined;
            return this.video.description.substr(0, 100);
        },
        metaTitle() {
            if (!this.video.title) return undefined;
            return this.video.title;
        },
        metaImage() {
            if (!this.video.yt_video_key) return undefined;
            return video_thumbnails(this.video.yt_video_key)["maxres"];
        },
    },
    watch: {
        "$route.params.id"(val) {
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
