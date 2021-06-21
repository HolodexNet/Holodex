<template>
    <a
        class="video-card no-decoration d-flex flex-column"
        :class="{
            'video-card-fluid': fluid,
            'video-card-active': active,
            'video-card-horizontal': horizontal,
        }"
        @click.exact.prevent="(e) => (!redirectMode ? goToVideo(data.id) : goToYoutube(data.id))"
        :target="redirectMode ? '_blank' : ''"
        :href="!redirectMode ? `/watch/${data.id}` : `https://youtu.be/${data.id}`"
        rel="noopener"
        draggable="true"
        v-on:dragstart="drag"
        style="position: relative"
    >
        <!-- Video Image with Duration -->
        <div
            style="position: relative; width: 100%"
            class="video-thumbnail white--text rounded flex-grow-0 d-flex"
            :style="horizontal && `background: url(${imageSrc}) center/cover;`"
        >
            <!-- Image Overlay -->
            <div
                class="video-card-overlay d-flex justify-space-between flex-column"
                style="height: 100%; position: absolute; width: 100%; z-index: 1"
            >
                <div class="d-flex justify-space-between align-start">
                    <!-- Topic Id display -->
                    <div
                        class="video-topic rounded-tl-sm"
                        :style="{ visibility: data.topic_id ? 'visible' : 'hidden' }"
                    >
                        {{ data.topic_id }}
                    </div>

                    <!-- Check box for saved video -->
                    <v-icon
                        :color="hasSaved ? 'primary' : 'white'"
                        class="video-card-action rounded-tr-sm"
                        :class="{ 'hover-show': !hasSaved && !isMobile }"
                        @click.prevent.stop="toggleSaved($event)"
                    >
                        {{ hasSaved ? icons.mdiCheck : icons.mdiPlusBox }}
                    </v-icon>
                </div>

                <!-- Video duration/music indicator -->
                <div class="d-flex flex-column align-end">
                    <!-- Show music icon if songs exist -->
                    <div class="video-duration" v-if="data.songcount">
                        <v-icon small>{{ icons.mdiMusic }}</v-icon>
                    </div>
                    <!-- Duration/Current live stream time -->
                    <div
                        v-if="data.duration > 0 || data.start_actual"
                        class="video-duration rounded-br-sm"
                        :class="data.status === 'live' && 'video-duration-live'"
                    >
                        {{ formattedDuration }}
                    </div>
                </div>
            </div>
            <v-img :src="imageSrc" :aspect-ratio="16 / 9" width="100%" v-if="!shouldHideThumbnail && !horizontal" />
        </div>
        <a
            class="d-flex flex-row flex-grow-1 no-decoration"
            style="height: 88px; position: relative"
            @click.exact.stop.prevent="goToVideo(data.id)"
            :href="`/watch/${data.id}`"
            rel="noopener"
        >
            <!-- Channel icon -->
            <div
                class="d-flex align-self-center mx-2 flex-column d-flex"
                v-if="includeChannel && includeAvatar && !horizontal && data.channel"
            >
                <ChannelImg :channel="data.channel" rounded class="align-self-center" />
            </div>
            <!-- Three lines for title, channel, available time -->
            <div class="d-flex flex-column my-1 justify-space-between">
                <!-- Video title -->
                <div
                    :class="['video-card-title ', { 'video-watched': hasWatched }]"
                    :title="title"
                    style="user-select: text"
                    :style="{ 'font-size': `${1 - $store.state.currentGridSize / 16}rem` }"
                >
                    {{ title }}
                </div>
                <!-- Channel -->
                <div v-if="includeChannel" class="channel-name video-card-subtitle">
                    <a
                        class="no-decoration"
                        :class="{ 'name-vtuber': data.type === 'stream' || data.channel.type === 'vtuber' }"
                        :href="`/channel/${data.channel.id}`"
                        @click.exact.stop.prevent="goToChannel(data.channel.id)"
                    >
                        {{ channelName }}
                    </a>
                </div>
                <!-- Time/Viewer Info -->
                <div class="video-card-subtitle">
                    <span :class="'text-' + this.data.status">
                        {{ formattedTime }}
                    </span>
                    <template v-if="data.clips && data.clips.length > 0">
                        •
                        <span class="primary--text">
                            {{
                                $tc(
                                    "component.videoCard.clips",
                                    typeof data.clips === "object" ? data.clips.length : +data.clips,
                                )
                            }}
                        </span>
                    </template>
                    <template v-else-if="data.status === 'live' && data.live_viewers > 0">
                        •
                        {{
                            $tc("component.videoCard.watching", formatCount(data.live_viewers, lang), [
                                formatCount(data.live_viewers, lang),
                            ])
                        }}
                    </template>
                </div>
            </div>
            <!-- Vertical dots menu -->
            <!-- <v-btn
                icon
                small
                @click.stop.prevent="showMenu"
                :ripple="false"
                :class="{ 'hover-show': !hasSaved && !isMobile }"
                class="video-card-menu"
            >
                <v-icon>
                    {{ icons.mdiDotsVertical }}
                </v-icon>
            </v-btn> -->
            <video-card-menu :video="data" :class="{ 'hover-show': !hasSaved && !isMobile }" />
        </a>
        <!-- optional breaker object to row-break into a new row. -->
        <v-list-item-action v-if="!!this.$slots.action" class="video-card-item-actions">
            <slot name="action"></slot>
        </v-list-item-action>
    </a>
</template>

<script lang="ts">
import { formatCount, getVideoThumbnails, decodeHTMLEntities } from "@/utils/functions";
import { formatDuration, formatDistance, dayjs } from "@/utils/time";
import * as icons from "@/utils/icons";
import VideoCardMenu from "../common/VideoCardMenu.vue";
/* eslint-disable no-unused-vars */

export default {
    name: "VideoCard",
    components: {
        ChannelImg: () => import("@/components/channel/ChannelImg.vue"),
        Comment: () => import("./Comment.vue"),
        VideoCardMenu,
    },
    data() {
        return {
            data: this.source || this.video,
            forceJPG: true,
            icons,
            now: Date.now(),
            updatecycle: null,
            hasWatched: false,
        };
    },
    props: {
        video: {
            // required: true,
            type: Object,
        },
        source: {
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
        hideThumbnail: {
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
        disableDefaultClick: {
            required: false,
            type: Boolean,
            default: false,
        },
    },
    // created() {
    //     this.data = this.video || this.source;
    // },
    mounted() {
        this.$store.getters["history/hasWatched"](this.data.id)
            .then((x) => {
                if (x) this.hasWatched = true;
            })
            .catch((err) => {
                console.error(err);
            });
        if (!this.updatecycle && this.data.status === "live") this.updatecycle = setInterval(this.updateNow, 1000);
    },
    activated() {
        if (!this.updatecycle && this.data.status === "live") this.updatecycle = setInterval(this.updateNow, 1000);
    },
    deactivated() {
        if (this.updatecycle) {
            clearInterval(this.updatecycle);
            this.updatecycle = null;
        }
    },
    beforeDestroy() {
        if (this.updatecycle) {
            clearInterval(this.updatecycle);
            this.updatecycle = null;
        }
    },
    computed: {
        title() {
            if (!this.data.title) return "";
            return decodeHTMLEntities(this.data.title);
        },
        lang() {
            return this.$store.state.settings.lang;
        },
        formattedTime() {
            switch (this.data.status) {
                case "upcoming":
                    // print relative time in hours if less than 24 hours,
                    // print full date if greater than 24 hours
                    return formatDistance(
                        this.data.start_scheduled || this.data.available_at,
                        this.lang,
                        this.$t.bind(this),
                        false, // allowNegative = false
                    ); // upcoming videos don't get to be ("5 minutes ago")
                case "live":
                    return this.$t("component.videoCard.liveNow");
                default:
                    return formatDistance(this.data.available_at, this.lang, this.$t.bind(this));
            }
        },
        formattedDuration() {
            if (this.data.start_actual && this.data.status === "live") {
                return this.formatDuration(dayjs(this.now).diff(dayjs(this.data.start_actual)));
            }
            if (this.data.status === "upcoming" && this.data.duration) {
                return this.$t("component.videoCard.premiere");
            }
            return this.data.duration && this.formatDuration(this.data.duration * 1000);
        },
        imageSrc() {
            // load different images based on current column size, which correspond to breakpoints
            const useWebP = this.$store.state.settings.canUseWebP && !this.forceJPG;
            const srcs = getVideoThumbnails(this.data.id, useWebP);
            if (this.horizontal) return srcs.medium;
            if (this.colSize > 2 && this.colSize <= 8) {
                return srcs.medium;
            }
            return srcs.standard;
        },
        redirectMode() {
            return this.$store.state.settings.redirectMode;
        },
        shouldHideThumbnail() {
            return this.$store.state.settings.hideThumbnail || this.hideThumbnail;
        },
        channelName() {
            const prop = this.$store.state.settings.nameProperty;
            return this.data.channel[prop] || this.data.channel.name;
        },
        hasSaved() {
            return this.$store.getters["playlist/contains"](this.data.id);
        },
        isMobile() {
            return this.$store.state.isMobile;
        },
    },
    methods: {
        formatDuration,
        formatCount,
        formatDistance,
        // Adds video to saved videos library
        toggleSaved(event) {
            event.preventDefault();
            this.hasSaved
                ? this.$store.commit("playlist/removeVideoByID", this.data.id)
                : this.$store.commit("playlist/addVideo", this.video);
        },
        goToVideo() {
            this.$emit("videoClicked", this.video);
            if (this.disableDefaultClick) return;
            // On mobile, clicking on watch links should not increment browser history
            // Back button will always return to the originating video list in one click
            if (this.$route.path.match("^/watch") && this.isMobile) {
                this.$router.replace({ path: `/watch/${this.data.id}` });
            } else {
                this.$router.push({ path: `/watch/${this.data.id}` });
            }
        },
        goToChannel() {
            this.$emit("videoClicked", this.video);
            if (this.disableDefaultClick) return;
            this.$router.push({ path: `/channel/${this.data.channel.id}` });
        },
        goToYoutube() {
            this.$emit("videoClicked", this.video);
            if (this.disableDefaultClick) return;
            const url = `https://www.youtube.com/watch?v=${this.data.id}`;
            window.open(url, "_blank", "noopener");
        },
        updateNow() {
            this.now = Date.now();
        },
        // All video cards share one menu that gets controlled through the store
        showMenu(e) {
            // this.$store.commit("setShowVideoCardMenu", false);
            // Send video object and x, y coords for mouse click
            this.$store.commit("setVideoCardMenu", {
                video: this.video,
                x: e.clientX,
                y: e.clientY,
            });
            this.$store.commit("setShowVideoCardMenu", true);
        },
        drag(ev) {
            ev.dataTransfer.setData("text", `https://holodex.net/watch/${this.data.id}`);
            ev.dataTransfer.setData("application/json", JSON.stringify(this.video));
        },
    },
};
</script>

<style scoped>
.theme--light .video-watched {
    color: var(--v-secondary-darken2) !important;
}

.theme--dark .video-watched {
    color: var(--v-secondary-lighten2) !important;
    opacity: 0.6;
}

.video-card-fluid {
    width: 100%;
}

.text-live {
    color: red;
}

.video-card-title {
    line-height: 1.2;
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
    padding-right: 22px;
}

.channel-name {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    white-space: initial;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    display: -webkit-box;
}

.channel-name > a:hover {
    color: black !important;
}
.theme--dark .channel-name > a:hover {
    color: white !important;
}

.video-card .hover-show {
    visibility: hidden;
}

.video-card:hover .hover-show {
    visibility: visible;
}

.video-duration {
    background-color: rgba(0, 0, 0, 0.8);
    margin: 2px;
    padding: 2px 5px;
    text-align: center;
    font-size: 0.8125rem;
    letter-spacing: 0.025em;
    line-height: 0.81rem;
}
.video-duration.video-duration-live {
    background-color: rgba(148, 0, 0, 0.8);
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
    flex-direction: row !important;
}

.video-card-horizontal > .video-thumbnail {
    margin-right: 5px;
    width: 150px !important;
}

.name-vtuber {
    color: #42a5f5 !important;
}

.video-card-active {
    /* primary color with opacity */
    /* Used for Mugen Clips where one of the list videos are 'active' */
    /* background-color: #f0629257; */
    height: auto;
    width: auto;
    position: relative;
}

.video-card-active::before {
    content: "";
    background-color: var(--v-primary-darken2);
    background-size: cover;
    position: absolute;
    top: -1px;
    right: -1px;
    bottom: -1px;
    left: -1px;
    opacity: 0.15;
    border-radius: 4px;
}

.video-card-subtitle {
    line-height: 1.2;
    font-size: 0.875rem;
    color: hsla(0, 0%, 100%, 0.7);
}

.theme--light .video-card-subtitle {
    color: rgba(0, 0, 0, 0.6);
}
</style>
