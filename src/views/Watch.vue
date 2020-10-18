<template>
    <v-container fluid v-if="video.channel">
        <v-row class="align-start">
            <v-col class="pa-0 pa-lg-3">
                <v-card class="watch-card">
                    <div
                        class="embedded-video"
                        v-if="!redirectMode && video_src"
                    >
                        <iframe
                            :src="video_src"
                            allowfullscreen
                            frameborder="0"
                        ></iframe>
                    </div>
                    <div class="thumbnail" v-else>
                        <v-img :aspect-ratio="16 / 9" :src="thumbnail_src" />
                        <div class="thumbnail-overlay d-flex">
                            <div class="text-h4 ma-auto">
                                <a
                                    :href="
                                        `https://youtu.be/${video.yt_video_key}`
                                    "
                                >
                                    Open on Youtube
                                </a>
                            </div>
                        </div>
                    </div>
                    <v-card-title>{{ video.title }}</v-card-title>
                    <v-card-subtitle>
                        {{ formatTime(video.published_at) }}
                    </v-card-subtitle>
                    <v-divider />
                    <v-list two-line>
                        <v-list-item>
                            <v-list-item-avatar size="50">
                                <ChannelImg :channel="video.channel" />
                            </v-list-item-avatar>
                            <ChannelInfo :channel="video.channel" />
                            <ChannelSocials :channel="video.channel" />
                        </v-list-item>
                    </v-list>
                    <v-card-text class="py-2">
                        <ChannelChip
                            v-for="channel in channel_chips"
                            :channel="channel"
                            :key="channel.id"
                            class="ma-1"
                        ></ChannelChip>
                        <v-chip
                            v-for="tag in tags.filter(t => !t.channel_ref)"
                            label
                            link
                            :key="tag.id"
                            style="margin-right: 5px"
                            :to="`/search?tags=${tag.name}`"
                        >
                            {{ `#${tag.name} (${tag.count})` }}
                        </v-chip>
                    </v-card-text>
                    <v-expansion-panels flat>
                        <v-expansion-panel>
                            <v-expansion-panel-header
                                :expand-icon="mdiMenuDown"
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
                    <v-divider />
                </v-card>
            </v-col>
            <v-col
                cols="12"
                sm="12"
                lg="3"
                xl="3"
                md="12"
                class="related-videos"
            >
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
</template>

<script>
import api from "@/utils/backend-api";
import VideoCardList from "@/components/VideoCardList";
import ChannelChip from "@/components/ChannelChip";
import dayjs from "dayjs";
import ChannelInfo from "@/components/ChannelInfo";
import ChannelSocials from "@/components/ChannelSocials";
import ChannelImg from "@/components/ChannelImg";
import { mdiMenuDown } from "@mdi/js";
import { video_thumbnails } from "@/utils/functions";
export default {
    name: "Watch",
    components: {
        VideoCardList,
        ChannelChip,
        ChannelInfo,
        ChannelSocials,
        ChannelImg,
    },
    data() {
        return {
            video: {},
            video_clips: [],
            video_sources: [],
            channel_mentions: [],
            tags: [],
            video_src: "",
            mdiMenuDown,
        };
    },
    created() {
        this.loadData(this.$route.params.id);
    },
    methods: {
        loadData(id) {
            // destroy iframe and recreate it so it doesn't break history mode
            this.video_src = "";
            api.video(id).then(res => {
                this.video_clips = res.data.clips;
                this.video_sources = res.data.sources;
                this.channel_mentions = res.data.channel_mentions;
                this.tags = res.data.tags;
                this.video = res.data;
                this.video_src = `https://www.youtube.com/embed/${this.video.yt_video_key}?autoplay=1`;
            });
        },
        formatTime(t) {
            return dayjs(t).format("MMM DD, YYYY");
        },
    },
    computed: {
        channel_chips() {
            let allMentions = new Map();
            this.channel_mentions
                .concat(this.video_sources.map(video => video.channel))
                .filter(channel => channel.id != this.video.channel_id)
                .forEach(channel =>
                    allMentions.set(channel.id, {
                        id: channel.id,
                        name: channel.name,
                        name_en: channel.name_en,
                        photo: channel.photo,
                    })
                );
            return Array.from(allMentions.values());
        },
        redirectMode() {
            return this.$store.state.redirectMode;
        },
        thumbnail_src() {
            return video_thumbnails(this.video.yt_video_key)["medium"];
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
