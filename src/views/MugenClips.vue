<template>
    <v-container fluid v-if="!isLoading && !hasError">
        <v-progress-linear
            :color="countdownPercentage > 0 ? 'lime' : 'grey'"
            :value="countdownPercentage"
        ></v-progress-linear>
        <v-row>
            <v-col :lg="theatherMode ? 12 : 9" cols="12" class="pt-0">
                <WatchFrame v-if="video" :video="video">
                    <!-- :translations="translations"
                    :otherMessages="otherMessages"
                    :currentTime="currentTime" -->
                    <template v-slot:youtube>
                        <youtube
                            class="embedded-video"
                            :video-id="video.id"
                            @ready="ready"
                            :playerVars="{ start: timeOffset, autoplay: 1, playsinline: 1 }"
                            :key="video.id"
                        >
                            <!-- @playing="playing"
                            @paused="paused" -->
                        </youtube>
                    </template>
                </WatchFrame>
                <v-card class="video-actions justify-space-between d-flex align-center px-4 pt-2">
                    <video-topic :videoId="video.id" :topic="video.topic_id" showEditIfPossible> </video-topic>
                    <span class="video-btn-group">
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
                            <span>Theather Mode</span>
                        </v-tooltip>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    icon
                                    lg
                                    :href="`https://youtu.be/${video.id}`"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    v-bind="attrs"
                                    v-on="on"
                                >
                                    <v-icon>{{ mdiOpenInNew }}</v-icon>
                                </v-btn>
                            </template>
                            <span>Open on Youtube</span>
                        </v-tooltip>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    icon
                                    lg
                                    @click="toggleSaved"
                                    :color="hasSaved ? 'primary' : 'white'"
                                    v-bind="attrs"
                                    v-on="on"
                                >
                                    <v-icon>{{ hasSaved ? icons.mdiCheck : icons.mdiPlusBox }}</v-icon>
                                </v-btn>
                            </template>
                            <span>Save video to Library</span>
                        </v-tooltip>
                    </span>
                </v-card>
                <WatchInfo :video="video" v-if="!theatherMode" :fetchComments="true" key="info" />
            </v-col>
            <v-col class="related-videos pt-0" :lg="theatherMode ? 12 : 3">
                <v-row fluid>
                    <v-col v-if="theatherMode" lg="9" class="pt-0">
                        <WatchInfo :video="video" :fetchComments="true" key="info" />
                    </v-col>
                    <v-col cols="12" :lg="theatherMode ? 3 : 12" class="pt-0 pl-lg-0">
                        <WatchLiveChat v-if="hasLiveChat" videoId="4ANxvWIM3Bs" key="chat" />
                        <WatchRelatedVideos :videoSources="videoSources" :videoClips="videoClips" key="clips" />
                    </v-col>
                </v-row>
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
import WatchLiveChat from "@/components/watch/WatchLiveChat";
// import WatchTimeline from "@/components/watch/WatchTimeline";
// import WatchTranscript from "@/components/watch/WatchTranscript";
import VideoTopic from "@/components/video/VideoTopic";
import { getVideoThumbnails, decodeHTMLEntities } from "@/utils/functions";
import { mdiOpenInNew, mdiOverscan, mdiRectangleOutline } from "@mdi/js";
import * as icons from "@/utils/icons";
import { dayjs } from "@/utils/time";
import backendApi from "@/utils/backend-api";

export default {
    name: "MugenClips",
    components: {
        LoadingOverlay,
        WatchInfo,
        WatchFrame,
        WatchLiveChat,
        WatchRelatedVideos,
        VideoTopic,
    },
    data() {
        return {
            // translations: [],
            // otherMessages: [],
            theatherMode: false,
            currentTime: 0,
            timeOffset: 0,
            timer: null,
            isLoading: true,
            hasError: false,
            nextCheck: 0,
            mdiOpenInNew,
            mdiOverscan,
            mdiRectangleOutline,
            countdownPercentage: 0,
            icons,
            // support rotation
            video: {},
            schedule: [],
        };
    },
    created() {
        this.init();
        const vm = this;
        this.timer = setInterval(() => {
            vm.currentTime = Math.floor(new Date().getTime() / 1000);
        }, 1000);
    },
    destroyed() {
        clearInterval(this.timer);
    },
    methods: {
        init() {
            backendApi.rotation().then((res) => {
                this.schedule = res.data;
                this.calculateVideo();
            });
        },
        calculateVideo() {
            const now = new Date().getTime() / 1000;
            this.schedule = this.schedule.filter((x) => +x.timestamp + x.video.duration > now);
            const toPlay = this.schedule[0];
            this.nextCheck = this.schedule[1].timestamp;
            backendApi.video(toPlay.video.id).then((res) => {
                this.timeOffset = Math.floor(now - toPlay.timestamp);
                this.video = res.data;
                this.isLoading = false;
            });
        },
        ready(event) {
            this.player = event.target;
        },
        formatTime(t) {
            return dayjs(t).format("MMM DD, YYYY");
        },
        // startSync() {
        //     // to be replaced by has transcript check
        //     if (!this.hasLiveChat) return;
        //     const vm = this;
        //     this.timer = setInterval(() => {
        //         vm.currentTime = vm.player.getCurrentTime();
        //     }, 1000);
        // },
        // stopSync() {
        //     // to be replaced by has transcript check
        //     if (!this.hasLiveChat) return;
        //     clearInterval(this.timer);
        //     this.timer = null;
        // },
        // playing(event) {
        //     console.log(event.target.getCurrentTime());
        //     this.startSync();
        //     // this.updateMessages(this.player.getCurrentTime());
        // },
        // paused(event) {
        //     console.log(event);
        //     this.stopSync();
        // },
        toggleSaved() {
            this.hasSaved
                ? this.$store.commit("library/removeSavedVideo", this.video.id)
                : this.$store.commit("library/addSavedVideo", this.video);
        },
    },
    computed: {
        videoClips() {
            return this.video?.clips?.filter((x) => this.$store.state.settings.clipLangs.includes(x.lang)) || [];
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
            return true;
        },
        hasWatched() {
            return this.$store.getters["library/hasWatched"](this.video.id);
        },
        hasSaved() {
            return this.$store.getters["library/hasSaved"](this.video.id);
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
        schedule() {
            // schedule became empty, or last start is ending within 30 minutes...
            if (!this.schedule) return;
            if (
                this.schedule === [] ||
                this.schedule[this.schedule.length - 1].timestamp +
                    this.schedule[this.schedule.length - 1].video.duration <
                    new Date().getTime() / 1000 + 1800
            ) {
                this.init();
            }
        },
        currentTime() {
            if (this.currentTime > this.nextCheck) {
                this.calculateVideo();
                this.countdownPercentage = 0;
            }
            if (this.nextCheck - this.currentTime < 10) {
                this.countdownPercentage = ((10.0 - (this.nextCheck - this.currentTime)) / 10.0) * 100;
            }
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
.video-btn-group > .v-btn {
    margin-right: 5px;
}

/* @media screen and (min-width: 600px) {
    .related-videos {
        min-width: 20px;
    }
} */
</style>
