<template>
    <v-card
        outlined
        :class="[
            { 'video-card-fluid': fluid, 'video-card-horizontal': horizontal },
            'video-card',
            'transparent',
        ]"
        :to="!redirectMode ? `/watch/${video.id}` : ''"
        :href="`https://youtu.be/${video.yt_video_key}`"
        :target="redirectMode ? '_blank' : ''"
        rel="noreferrer"
        link
    >
        <!-- Video Image with Duration -->
        <v-img
            class="white--text align-end"
            :src="imageSrc"
            :aspect-ratio="16 / 9"
            :width="horizontal ? '150px' : '100%'"
            v-if="!hideThumbnail"
        >
            <template v-slot:placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
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
            <!-- Render Channel Avatar if necessary -->
            <router-link
                :to="`/channel/${video.channel.id}`"
                v-if="
                    includeChannel &&
                        includeAvatar &&
                        !horizontal &&
                        video.channel
                "
            >
                <v-list-item-avatar>
                    <ChannelImg :channel="video.channel" />
                </v-list-item-avatar>
            </router-link>
            <!--  -->
            <v-list-item-content class="pa-0">
                <v-list-item-title class="video-title" :title="video.title">
                    {{ video.title }}
                </v-list-item-title>
                <v-list-item-subtitle v-if="includeChannel">
                    <router-link
                        :to="`/channel/${video.channel.id}`"
                        class="no-decoration channel-name"
                        :class="{ 'name-vtuber': video.channel.id < 1000 }"
                    >
                        {{ channelName }}
                    </router-link>
                </v-list-item-subtitle>
                <v-list-item-subtitle>
                    <span :class="'text-' + this.video.status">
                        {{ formattedTime }}
                    </span>
                    <span v-if="video.clips && video.clips.length > 0">
                        • {{ video.clips.length }} Clips
                    </span>
                    <span
                        v-else-if="
                            video.status === 'live' && video.live_viewers > 0
                        "
                    >
                        • {{ formatCount(video.live_viewers) }} Watching
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
import advancedFormat from "dayjs/plugin/advancedFormat";
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(advancedFormat);
import { video_thumbnails, formatCount } from "@/utils/functions";
export default {
    name: "VideoCard",
    components: {
        ChannelImg: () => import("@/components/ChannelImg"),
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
        includeAvatar: {
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
                    return (
                        "Stream starts " +
                        // print relative time in hours if less than 24 hours,
                        // print full date if greater than 24 hours
                        (dayjs(this.video.live_schedule).diff(dayjs()) <=
                        86400000
                            ? this.formatFromNow(this.video.live_schedule)
                            : dayjs(this.video.live_schedule).format(
                                  "ddd MMM Do, h:mm a"
                              ))
                    );
                case "live":
                    return "Live Now";
                default:
                    return this.formatFromNow(this.video.published_at);
            }
        },
        formattedDuration() {
            const duration =
                this.video.live_start && this.video.status === "live"
                    ? dayjs().diff(dayjs(this.video.live_start))
                    : this.video.duration_secs * 1000;
            return duration ? this.formatDuration(duration) : "";
        },
        imageSrc() {
            // load different images based on current column size, which correspond to breakpoints
            const useWebP = this.$store.state.canUseWebP && !this.forceJPG;
            const srcs = video_thumbnails(this.video.yt_video_key, useWebP);
            if (this.horizontal) return srcs["medium"];
            if (this.colSize > 2 && this.colSize <= 8) {
                return srcs["medium"];
            } else {
                return srcs["hq720"];
            }
        },
        redirectMode() {
            return this.$store.state.redirectMode;
        },
        hideThumbnail() {
            return this.$store.state.hideThumbnail;
        },
        channelName() {
            const prop = this.$store.state.nameProperty;
            if (this.video.channel[prop]) return this.video.channel[prop];
            return this.video.channel.name;
        },
    },
    methods: {
        formatFromNow(time) {
            return dayjs(time).fromNow();
        },
        formatDuration(secs) {
            return secs > 60 * 60 * 1000
                ? dayjs.utc(secs).format("H:mm:ss")
                : dayjs.utc(secs).format("m:ss");
        },
        formatCount,
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
    letter-spacing: 0.025em;
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
