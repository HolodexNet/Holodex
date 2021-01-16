<template>
    <v-container fluid v-if="!isLoading && !hasError">
        <v-row>
            <v-col :lg="theatherMode ? 12 : 9" cols="12" class="pt-0">
                <WatchFrame v-if="video.id" :video="video">
                    <template v-slot:youtube>
                        <youtube
                            class="embedded-video"
                            :video-id="video.id"
                            @ready="ready"
                            :playerVars="{ start: timeOffset, autoplay: 1, playsinline: 1 }"
                        >
                            <!-- @playing="playing"
                            @paused="paused" -->
                        </youtube>
                    </template>
                </WatchFrame>
                <v-card
                    tile
                    class="d-flex justify-space-between px-4 pt-2 flex-wrap-reverse flex-sm-nowrap"
                    :class="{ 'pb-2': theatherMode }"
                >
                    <span class="watch-chips">
                        <video-topic :videoId="video.id" :topic="video.topic_id" showEditIfPossible></video-topic>
                        <template v-for="mention in channelChips">
                            <ChannelChip :channel="mention" :key="mention.id" />
                        </template>
                        <a
                            @click="showAllMentions = !showAllMentions"
                            style="white-space: pre"
                            class="text-subtitle-2"
                            v-if="mentions.length > 3"
                        >
                            {{ showAllMentions ? "Hide" : "Show" }} {{ mentions.length - 3 }} more
                        </a>
                    </span>
                    <div class="watch-btn-group ml-auto d-flex">
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
                            <span>{{ $t("views.settings.redirectModeLabel") }}</span>
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
                            <span>{{ $t("views.watch.saveToLibrary") }}</span>
                        </v-tooltip>
                    </div>
                </v-card>
                <WatchInfo :video="video" v-if="!theatherMode && video.channel" :fetchComments="true" key="info" />
            </v-col>
            <v-col class="related-videos pt-0" :lg="theatherMode ? 12 : 3">
                <v-row fluid>
                    <v-col v-if="theatherMode" lg="9" class="pt-0">
                        <WatchInfo :video="video" :fetchComments="true" key="info" />
                    </v-col>
                    <v-col cols="12" :lg="theatherMode ? 3 : 12" class="pt-0 pl-lg-0">
                        <WatchLiveChat v-if="hasLiveChat" :video="video" mugenId="4ANxvWIM3Bs" />
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
import ChannelChip from "@/components/channel/ChannelChip";
import VideoTopic from "@/components/video/VideoTopic";
import { getVideoThumbnails, decodeHTMLEntities } from "@/utils/functions";
import { mapState } from "vuex";
import { mdiOpenInNew, mdiOverscan, mdiRectangleOutline } from "@mdi/js";
import * as icons from "@/utils/icons";
import { dayjs } from "@/utils/time";
import WatchMugen from "@/components/watch/WatchMugen";

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
        WatchLiveChat,
        ChannelChip,
        WatchRelatedVideos,
        VideoTopic,
        WatchMugen,
    },
    data() {
        return {
            theatherMode: false,
            showAllMentions: false,
            startTime: 0,
            mdiOpenInNew,
            mdiOverscan,
            mdiRectangleOutline,
            icons,
        };
    },
    created() {
        this.isMugen ? this.initMugen() : this.init();
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
        formatTime(t) {
            return dayjs(t).format("MMM DD, YYYY");
        },
        seekTo(time) {
            if (!this.player) return;
            this.player.seekTo(time);
        },
        playNext({ video, timeOffset }) {
            this.$store.commit("watch/setVideo", video);
            this.startTime = timeOffset;
        },
        toggleSaved() {
            this.hasSaved
                ? this.$store.commit("library/removeSavedVideo", this.video.id)
                : this.$store.commit("library/addSavedVideo", this.video);
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
        mentions() {
            return this.video.mentions || [];
        },
        channelChips() {
            return this.mentions.length > 3 && !this.showAllMentions ? this.mentions.slice(0, 3) : this.mentions;
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
        hasSaved() {
            return this.$store.getters["library/hasSaved"](this.video.id);
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
