<template>
    <div :class="{ 'video-card-fluid': fluid, 'video-card-active': active }">
        <v-card
            outlined
            :class="[{ 'video-card-fluid': fluid, 'video-card-horizontal': horizontal }, 'video-card', 'transparent']"
            :target="redirectMode ? '_blank' : ''"
            rel="noopener"
            link
            @click.stop="goToVideo(video.id)"
        >
            <!-- :to="!redirectMode ? `/watch/${video.id}` : ''" -->
            <!-- :href="`https://youtu.be/${video.id}`" -->
            <!-- Video Image with Duration -->
            <v-img
                class="white--text"
                :src="imageSrc"
                :aspect-ratio="16 / 9"
                :width="horizontal ? '150px' : '100%'"
                v-if="!hideThumbnail"
            >
                <!-- <template v-slot:placeholder>
                    <v-row class="fill-height ma-0" align="center" justify="center"></v-row>
                </template> -->
                <!-- Image Overlay -->
                <div class="video-card-overlay d-flex justify-space-between flex-column" style="height: 100%">
                    <div class="d-flex justify-space-between align-start">
                        <!-- Topic Id display -->
                        <div class="video-topic">{{ video.topic_id }}</div>

                        <!-- Check box for saved video -->
                        <v-icon
                            :color="hasSaved ? 'primary' : 'white'"
                            class="video-card-action"
                            :class="{ 'hover-show': !hasSaved && !isMobile }"
                            @click="toggleSaved($event)"
                        >
                            {{ hasSaved ? icons.mdiCheck : icons.mdiPlusBox }}
                        </v-icon>
                    </div>

                    <!-- Video duration -->
                    <div class="d-flex flex-column align-end">
                        <div v-if="video.duration > 0 || video.start_actual" class="video-duration">
                            {{ formattedDuration }}
                        </div>
                    </div>
                </div>
            </v-img>

            <v-list-item three-line class="pa-0">
                <!-- Render Channel Avatar if necessary -->
                <!-- <router-link
                    :to="`/channel/${video.channel.id}`"
                    v-if="includeChannel && includeAvatar && !horizontal && video.channel"
                > -->
                <v-list-item-avatar v-if="includeChannel && includeAvatar && !horizontal && video.channel">
                    <ChannelImg :channel="video.channel" />
                </v-list-item-avatar>
                <!-- </router-link> -->

                <v-list-item-content class="pa-0">
                    <v-list-item-title :class="['video-card-title ', { 'video-watched': hasWatched }]" :title="title">
                        {{ title }}
                    </v-list-item-title>
                    <v-list-item-subtitle
                        v-if="includeChannel"
                        @click.stop="goToChannel(video.channel.id)"
                        class="channel-name"
                        :class="{ 'name-vtuber': video.type === 'stream' || video.channel.type === 'vtuber' }"
                    >
                        <!-- <router-link
                            :to="`/channel/${video.channel.id}`"
                            class="no-decoration channel-name text-truncate"
                            :class="{ 'name-vtuber': video.type === 'stream' || video.channel.type === 'vtuber' }"
                        > -->
                        {{ channelName }}
                        <!-- </router-link> -->
                    </v-list-item-subtitle>
                    <v-list-item-subtitle>
                        <span :class="'text-' + this.video.status">
                            {{ formattedTime }}
                        </span>
                        <span v-if="video.clips && video.clips.length > 0">
                            •
                            <!-- <router-link :to="`/watch/${video.id}`" class="no-decoration primary--text"> -->
                            {{
                                $tc(
                                    "component.videoCard.clips",
                                    typeof video.clips === "object" ? video.clips.length : +video.clips,
                                )
                            }}
                            <!-- </router-link> -->
                        </span>
                        <span v-else-if="video.status === 'live' && video.live_viewers > 0">
                            •
                            {{
                                $tc("component.videoCard.watching", formatCount(video.live_viewers, lang), [
                                    formatCount(video.live_viewers, lang),
                                ])
                            }}
                        </span>
                    </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action v-if="!!this.$slots.action">
                    <slot name="action"></slot>
                </v-list-item-action>
            </v-list-item>
        </v-card>
        <v-list style="max-height: 400px" dense class="pa-0 transparent overflow-y-auto caption" v-if="video.comments">
            <v-divider class="mx-4" style="flex-basis: 100%; height: 0"></v-divider>
            <!-- Render Channel Avatar if necessary -->
            <v-list-item class="pa-0" v-for="comment in video.comments" :key="comment.comment_key">
                <comment :comment="comment" :videoId="video.id"></comment>
            </v-list-item>
        </v-list>
    </div>
</template>

<script>
import { formatCount, getVideoThumbnails, decodeHTMLEntities } from "@/utils/functions";
import { formatDuration, formatDistance, dayjs } from "@/utils/time";
import * as icons from "@/utils/icons";
/* eslint-disable no-unused-vars */

export default {
    name: "VideoCard",
    components: {
        ChannelImg: () => import("@/components/channel/ChannelImg"),
        Comment: () => import("./Comment"),
    },
    data() {
        return {
            forceJPG: true,
            icons,
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
        active: {
            required: false,
            type: Boolean,
            default: false,
        },
    },
    computed: {
        title() {
            if (!this.video.title) return "";
            return decodeHTMLEntities(this.video.title);
        },
        lang() {
            return this.$store.state.settings.lang;
        },
        formattedTime() {
            switch (this.video.status) {
                case "upcoming":
                    // print relative time in hours if less than 24 hours,
                    // print full date if greater than 24 hours
                    return formatDistance(this.video.start_scheduled, this.lang, this.$t.bind(this));
                case "live":
                    return this.$t("component.videoCard.liveNow");
                default:
                    return formatDistance(this.video.available_at, this.lang, this.$t.bind(this));
            }
        },
        formattedDuration() {
            const duration =
                this.video.start_actual && this.video.status === "live"
                    ? dayjs().diff(dayjs(this.video.start_actual))
                    : this.video.duration * 1000;

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
            return srcs.standard;
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
        isMobile() {
            return this.$store.state.isMobile;
        },
    },
    methods: {
        formatDuration,
        formatCount,
        formatDistance,
        toggleSaved(event) {
            event.preventDefault();
            this.hasSaved
                ? this.$store.commit("library/removeSavedVideo", this.video.id)
                : this.$store.commit("library/addSavedVideo", this.video);
        },
        goToVideo(id) {
            this.$router.push({ path: `/watch/${this.video.id}` });
        },
        goToChannel(id) {
            this.$router.push({ path: `/channel/${this.video.channel.id}` });
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
    /* https://css-tricks.com/almanac/properties/w/word-break/ */
    word-break: break-all;
    word-break: break-word;

    -webkit-hyphens: auto;
    -moz-hyphens: auto;
    hyphens: auto;

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

.channel-name:hover {
    color: white !important;
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

.video-topic {
    background-color: rgba(0, 0, 0, 0.8);
    margin: 2px;
    padding: 1px 5px;
    text-align: center;
    font-size: 0.8125rem;
    letter-spacing: 0.025em;
    text-transform: capitalize;
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

.video-card-active {
    /* primary color with opacity */
    background-color: #f0629257;
}
</style>
