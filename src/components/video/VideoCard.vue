<template>
    <v-card
        outlined
        :class="[{ 'video-card-fluid': fluid, 'video-card-horizontal': horizontal }, 'video-card', 'transparent']"
        :to="!redirectMode ? `/watch/${video.id}` : ''"
        :href="`https://youtu.be/${video.id}`"
        :target="redirectMode ? '_blank' : ''"
        rel="noopener"
        link
    >
        <!-- Video Image with Duration -->
        <v-img
            class="white--text"
            :src="imageSrc"
            :aspect-ratio="16 / 9"
            :width="horizontal ? '150px' : '100%'"
            v-if="!hideThumbnail"
        >
            <template v-slot:placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center"></v-row>
            </template>
            <!-- Image Overlay -->
            <div class="video-card-overlay d-flex flex-column align-end justify-space-between" style="height: 100%">
                <!-- Check box for saved video -->
                <v-icon
                    :color="hasSaved ? 'primary' : 'white'"
                    class="video-card-action"
                    :class="{ 'hover-show': !hasSaved && !isXs }"
                    @click="toggleSaved($event)"
                >
                    {{ hasSaved ? mdiCheck : mdiPlusBox }}
                </v-icon>
                <div v-if="video.duration_secs > 0 || video.live_start" class="video-duration">
                    {{ formattedDuration }}
                </div>
            </div>
        </v-img>

        <v-list-item three-line class="pa-0">
            <!-- Render Channel Avatar if necessary -->
            <router-link
                :to="`/channel/${video.channel.id}`"
                v-if="includeChannel && includeAvatar && !horizontal && video.channel"
            >
                <v-list-item-avatar>
                    <ChannelImg :channel="video.channel" />
                </v-list-item-avatar>
            </router-link>

            <v-list-item-content class="pa-0">
                <v-list-item-title :class="['video-card-title ', { 'video-watched': hasWatched }]" :title="title">
                    {{ title }}
                </v-list-item-title>
                <v-list-item-subtitle v-if="includeChannel">
                    <router-link
                        :to="`/channel/${video.channel.id}`"
                        class="no-decoration channel-name"
                        :class="`name-${video.channel.type}`"
                    >
                        {{ channelName }}
                    </router-link>
                </v-list-item-subtitle>
                <v-list-item-subtitle>
                    <span :class="'text-' + this.video.status">
                        {{ formattedTime }}
                    </span>
                    <span v-if="video.clips && video.clips.length > 0">
                        •
                        <router-link :to="`/watch/${video.id}`" class="no-decoration primary--text">
                            {{ $tc("component.videoCard.clips", formatCount(video.clips.length)) }}
                        </router-link>
                    </span>
                    <span v-else-if="video.status === 'live' && video.live_viewers > 0">
                        •
                        {{ $t("component.videoCard.watching", [formatCount(video.live_viewers)]) }}
                    </span>
                </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action v-if="!!this.$slots.action">
                <slot name="action"></slot>
            </v-list-item-action>
        </v-list-item>
    </v-card>
</template>

<script>
import { formatCount, getVideoThumbnails, decodeHTMLEntities } from "@/utils/functions";
import { formatDuration, formatStreamStart, dayjs } from "@/utils/time";
import { mdiCheck, mdiPlusBox } from "@mdi/js";
/* eslint-disable no-unused-vars */

export default {
    name: "VideoCard",
    components: {
        ChannelImg: () => import("@/components/channel/ChannelImg"),
    },
    data() {
        return {
            forceJPG: true,
            mdiPlusBox,
            mdiCheck,
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
        isXs: {
            required: false,
            type: Boolean,
            default: false,
        },
    },
    computed: {
        title() {
            return decodeHTMLEntities(this.video.title);
        },
        formattedTime() {
            switch (this.video.status) {
                case "upcoming":
                    // print relative time in hours if less than 24 hours,
                    // print full date if greater than 24 hours
                    return `Stream starts ${this.formatStreamStart(this.video.start_scheduled)}`;
                case "live":
                    return this.$t("component.videoCard.liveNow");
                default:
                    return this.formatFromNow(this.video.available_at);
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
            const useWebP = this.$store.state.settings.canUseWebP && !this.forceJPG;
            const srcs = getVideoThumbnails(this.video.id, useWebP);
            if (this.horizontal) return srcs.medium;
            if (this.colSize > 2 && this.colSize <= 8) {
                return srcs.medium;
            }
            return srcs.hq720;
        },
        redirectMode() {
            return this.$store.state.settings.redirectMode;
        },
        hideThumbnail() {
            return this.$store.state.settings.hideThumbnail;
        },
        channelName() {
            const prop = this.$store.state.settings.nameProperty;
            return this.video.channel[prop] || this.video.channel.name;
        },
        hasWatched() {
            return this.$store.getters["library/hasWatched"](this.video.id);
        },
        hasSaved() {
            return this.$store.getters["library/hasSaved"](this.video.id);
        },
    },
    methods: {
        formatFromNow(time) {
            return dayjs(time).fromNow();
        },
        formatDuration,
        formatCount,
        formatStreamStart,
        toggleSaved(event) {
            event.preventDefault();
            this.hasSaved
                ? this.$store.commit("library/removeSavedVideo", this.video.id)
                : this.$store.commit("library/addSavedVideo", this.video);
        },
    },
};
</script>

<style scoped>
.video-card {
    border-radius: 0 !important;
    border: none !important;
}

.video-card-fluid {
    width: 100%;
}

.text-live {
    color: red;
}

.video-card-title {
    white-space: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.video-watched {
    color: #ce93d8 !important;
}

.channel-name {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}

.video-card-overlay .hover-show {
    visibility: hidden;
}

.video-card-overlay:hover .hover-show {
    visibility: visible;
}

.video-duration {
    background-color: rgba(0, 0, 0, 0.8);
    margin: 2px;
    padding: 1px 5px;
    text-align: center;
    font-size: 0.8125rem;
    letter-spacing: 0.025em;
}

.video-card-action {
    background-color: rgba(0, 0, 0, 0.8);
    padding: 2px;
    margin: 2px;
}

.video-card-horizontal {
    display: flex !important;
}

.video-card-horizontal > .v-image {
    margin-right: 5px;
}

.name-vtuber {
    color: #42a5f5 !important;
}
</style>
