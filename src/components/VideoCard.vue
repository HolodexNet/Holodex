<template>
    <v-card
        outlined
        :class="[
            { 'video-card-fluid': fluid, 'video-card-horizontal': horizontal },
            'video-card',
            'transparent',
        ]"
        :to="`/watch/${video.id}`"
    >
        <v-img
            class="white--text align-end"
            :src="imageSrc"
            :aspect-ratio="16 / 9"
            :width="horizontal ? '150px' : '100%'"
        >
            <template v-slot:placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                    <v-progress-circular indeterminate color="black">
                    </v-progress-circular>
                </v-row>
            </template>
            <div
                class="d-flex justify-end"
                v-if="video.duration_secs > 0 || video.live_start"
            >
                <span class="video-duration px-2">
                    {{ formattedDuration }}
                </span>
            </div>
        </v-img>
        <v-list-item three-line class="pa-0">
            <router-link
                :to="`/channel/${video.channel.id}`"
                v-if="
                    includeChannel && withAvatar && !horizontal && video.channel
                "
            >
                <v-list-item-avatar>
                    <ChannelImg :src="video.channel.photo" />
                </v-list-item-avatar>
            </router-link>
            <v-list-item-content class="pa-0">
                <div class="video-title">{{ video.title }}</div>
                <v-list-item-subtitle v-if="includeChannel">
                    <router-link
                        :to="`/channel/${video.channel.id}`"
                        class="no-decoration channel-name"
                        :class="'name-' + video.channel.channel_type"
                    >
                        {{ video.channel.name }}
                    </router-link>
                </v-list-item-subtitle>
                <v-list-item-subtitle>
                    <span :class="'text-' + this.video.status">
                        {{ formattedTime }}
                    </span>
                    <span v-if="video.clips && video.clips.length > 0">
                        • {{ video.clips.length }} Clips
                    </span>
                    <span v-else-if="video.status === 'live'">
                        • {{ formatViewers(video.live_viewers) }} Watching
                    </span>
                </v-list-item-subtitle>
            </v-list-item-content>
        </v-list-item>
    </v-card>
</template>

<script>
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
dayjs.extend(relativeTime);
dayjs.extend(utc);
import ChannelImg from "@/components/ChannelImg";
import { video_thumbnails } from "@/utils/image-utils";
export default {
    name: "VideoCard",
    components: {
        ChannelImg,
    },
    data() {
        return {
            forceJPG: true,
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
        withAvatar: {
            required: false,
            type: Boolean,
            default: false,
        },
        horizontal: {
            required: false,
            type: Boolean,
            default: false,
        },
        colSize: {
            required: false,
            type: Number,
            default: 1,
        },
    },
    created() {},
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
        formattedDuration() {
            if (!this.video.duration_secs && this.video.live_start) {
                return dayjs
                    .utc(dayjs().diff(dayjs(this.video.live_start)))
                    .format("HH:mm:ss");
            }

            return this.video.duration_secs > 84600
                ? "VERY LONG"
                : dayjs.utc(this.video.duration_secs * 1000).format("HH:mm:ss");
        },
        imageSrc() {
            // load different images based on current column size, which correspond to breakpoints
            const useWebP = this.$store.state.canUseWebP && !this.forceJPG;
            // if (!useWebP) console.log("falling back");
            const srcs = video_thumbnails(this.video.yt_video_key, useWebP);
            if (this.horizontal) return srcs["medium"];
            if (this.colSize < 2) {
                return srcs["hq720"];
            } else if (this.colSize <= 8) {
                return srcs["medium"];
            } else {
                return srcs["hq720"];
            }
        },
    },
    methods: {
        formatFromNow(time) {
            return dayjs(time).fromNow();
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

.text-live {
    color: red;
}

.video-title {
    white-space: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.channel-name {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}

.video-duration {
    background-color: rgba(0, 0, 0, 0.8);
    text-align: center;
    font-size: 0.8125rem;
}

.video-card-horizontal {
    display: flex !important;
}

.video-card-horizontal > .v-image {
    margin-right: 5px;
}

.no-decoration {
    text-decoration: none;
    color: inherit !important;
}

.name-vtuber {
    color: #42a5f5 !important;
}
</style>
