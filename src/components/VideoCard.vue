<template>
    <v-card outlined :class="[{ 'video-card-fluid': fluid }, 'video-card']">
        <v-img
            class="white--text align-end"
            :src="
                'https://i.ytimg.com/vi/' +
                    video.yt_video_key +
                    '/hq720_live.jpg'
            "
            :aspect-ratio="16 / 9"
        >
        </v-img>
        <v-list-item three-line class="pa-0">
            <v-list-item-content class="pa-0">
                <div class="video-title">{{ video.title }}</div>
                <v-list-item-subtitle>
                    {{ formattedTime }}
                    <span v-if="video.video_mentions && video.video_mentions.length > 0">
                        • {{ video.video_mentions.length }} Clips
                    </span>
                </v-list-item-subtitle>
                <v-list-item-subtitle v-if="video.status === 'live'">
                    <!-- {{ video.video_tag.map(tag => tag.tag.name).join(", ") }} -->
                    {{ formatViewers(video.live_viewers) }} Watching
                </v-list-item-subtitle>
            </v-list-item-content>
        </v-list-item>
    </v-card>
</template>

<script>
import moment from "moment";

export default {
    name: "VideoCard",
    data() {
        return {
            // height: 118,
        };
    },
    props: {
        video: {
            required: true,
            type: Object,
        },
        fluid: {
            required: false,
            type: Boolean,
            default: false,
        },
        includeChannel: {
            required: false,
            type: Boolean,
            default: false,
        },
    },
    computed: {
        formattedTime() {
            switch (this.video.status) {
                case "upcoming":
                    return `Stream starts ${this.formatFromNow(
                        this.video.live_schedule
                    )}`;
                case "live":
                    return "Live Now";
                default:
                    return this.formatFromNow(this.video.published_at);
            }
        },
        // height() {
        //     return this.includeChannel ? 200 : 118;
        // },
        // width() {
        //     return this.includeChannel ? 360 : 
        // }
    },
    methods: {
        formatFromNow(time) {
            return moment(time).fromNow();
        },
        formatViewers(viewers) {
            return viewers > 1000 ? viewers / 1000 + "K" : viewers;
        },
    },
};
</script>

<style>
.video-card {
    border-radius: 0px !important;
    border: none !important;
}
.video-card-fluid {
    width: 100%;
}
.video-title {
    white-space: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}
</style>
