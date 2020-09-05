<template>
    <v-container fluid>
        <v-row class="align-start">
            <v-col class="pa-0">
                <v-card class="watch-card">
                    <div class="embedded-video">
                        <iframe
                            :src="`https://www.youtube.com/embed/${video.yt_video_key}?autoplay=1`"
                        ></iframe>
                    </div>
                    <v-card-title>{{ video.title }}</v-card-title>
                    <v-card-subtitle>
                        {{ formatTime(video.published_at) }}
                    </v-card-subtitle>
                    <v-divider />
                    <v-list three-line>
                        <v-list-item>
                            <v-list-item-avatar size="50">
                                <v-img :src="video.channel.photo"></v-img>
                            </v-list-item-avatar>
                            <v-list-item-content>
                                <v-list-item-title>
                                    {{ video.channel.name }}
                                </v-list-item-title>
                                <v-list-item-subtitle>
                                    {{ video.channel.name_en }}
                                </v-list-item-subtitle>
                                <v-list-item-subtitle>
                                    {{  video.channel.subscriber_count/1000 }}K subscribers
                                </v-list-item-subtitle>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                    <v-expansion-panels outlined>
                        <v-expansion-panel>
                            <v-expansion-panel-header
                                expand-icon="mdi-menu-down"
                            >
                                Description
                            </v-expansion-panel-header>
                            <v-expansion-panel-content>
                                <v-card-text
                                    style="white-space: pre-wrap;"
                                    class="text-body-2"
                                >
                                    {{ video.description }}
                                </v-card-text>
                            </v-expansion-panel-content>
                        </v-expansion-panel>
                    </v-expansion-panels>
                </v-card>
            </v-col>
            <v-col cols="12" sm="12" lg="3" xl="3" md="12" class="related-videos">
                <!-- <div class="text-h6">Related</div>
                <v-divider /> -->
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
                    v-if="video_mentions.length > 0"
                >
                    Source
                </div>
                <VideoCardList
                    :videos="video_mentions"
                    horizontal
                    includeChannel
                    :cols="{
                        lg: 12,
                        md: 4,
                        cols: 12,
                        sm: 6,
                    }"
                />
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import api from "@/utils/backend-api";
import VideoCardList from "@/components/VideoCardList";
import moment from "moment";

export default {
    name: "Watch",
    components: {
        VideoCardList,
    },
    data() {
        return {
            video: [],
            video_clips: [],
            video_mentions: [],
        };
    },
    created() {
        this.loadData(this.$route.params.id);
    },
    methods: {
        loadData(id) {
            api.video(id).then(res => {
                this.video = res.data;
                this.video_clips = res.data.video_mentions;
                this.video_mentions = res.data.video_with_mentions;
                console.log(res);
            });
        },
        formatTime(t) {
            return moment(t).format("MMM DD, YYYY");
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

@media screen and (min-width: 600px) {
    .related-videos {
        min-width: 350px;
    }
}
</style>
