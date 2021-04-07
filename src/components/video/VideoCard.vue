<template>
    <div :class="{ 'video-card-fluid': fluid, 'video-card-active': active }">
        <v-card
            tag="a"
            outlined
            :class="[{ 'video-card-fluid': fluid, 'video-card-horizontal': horizontal }, 'video-card', 'transparent']"
            link
            @click.exact.prevent="(e) => (!redirectMode ? goToVideo(video.id) : goToYoutube(video.id))"
            :target="redirectMode ? '_blank' : ''"
            :href="!redirectMode ? `/watch/${video.id}` : `https://youtu.be/${video.id}`"
            rel="noopener"
        >
            <!-- Video Image with Duration -->
            <v-img
                class="white--text rounded"
                :src="imageSrc"
                :aspect-ratio="16 / 9"
                :width="horizontal ? '150px' : '100%'"
                v-if="!shouldHideThumbnail"
            >
                <!-- Image Overlay -->
                <div class="video-card-overlay d-flex justify-space-between flex-column" style="height: 100%">
                    <div class="d-flex justify-space-between align-start">
                        <!-- Topic Id display -->
                        <div
                            class="video-topic rounded-tl-sm"
                            :style="{ visibility: video.topic_id ? 'visible' : 'hidden' }"
                        >
                            {{ video.topic_id }}
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

                    <!-- Video duration -->
                    <div class="d-flex flex-column align-end">
                        <div class="video-duration" v-if="video.songcount">
                            <v-icon small>{{ icons.mdiMusic }}</v-icon>
                        </div>
                        <div
                            v-if="video.duration > 0 || video.start_actual"
                            class="video-duration rounded-br-sm"
                            :class="video.status === 'live' && 'video-duration-live'"
                        >
                            {{ formattedDuration }}
                        </div>
                    </div>
                </div>
            </v-img>

            <v-list-item
                three-line
                class="pa-0"
                @click.exact.stop.prevent="goToVideo(video.id)"
                :href="`/watch/${video.id}`"
                rel="noopener"
            >
                <v-list-item-avatar v-if="includeChannel && includeAvatar && !horizontal && video.channel">
                    <ChannelImg :channel="video.channel" />
                </v-list-item-avatar>

                <v-list-item-content class="pa-0">
                    <v-menu bottom nudge-top="20px">
                        <template v-slot:activator="{ on }">
                            <v-icon
                                v-on="on"
                                @click.stop.prevent
                                :class="{ 'hover-show': !hasSaved && !isMobile }"
                                class="video-card-more"
                            >
                                {{ icons.mdiDotsVertical }}
                            </v-icon>
                        </template>
                        <v-list dense>
                            <v-list-item @click.stop="copyLink"
                                ><v-icon left>{{ icons.mdiClipboardPlusOutline }}</v-icon>
                                {{ $t("component.videoCard.copyLink") }}
                            </v-list-item>
                            <v-list-item @click.stop target="_blank" :href="`https://youtu.be/${video.id}`"
                                ><v-icon left>{{ icons.mdiYoutube }}</v-icon>
                                {{ $t("views.settings.redirectModeLabel") }}
                            </v-list-item>

                            <v-list-item
                                :disabled="video.type === 'clip'"
                                :to="`/multiview/AAUY${video.id}${video.channel.name}%2CUAEYchat`"
                                ><v-icon left :color="video.type === 'clip' ? 'grey' : ''">{{
                                    icons.mdiViewDashboard
                                }}</v-icon>
                                {{ $t("component.mainNav.multiview") }}
                            </v-list-item>
                            <v-list-item :disabled="video.type === 'clip'" :to="`/edit/video/${video.id}`"
                                ><v-icon left :color="video.type === 'clip' ? 'grey' : ''">{{
                                    icons.mdiPencil
                                }}</v-icon>
                                {{ $t("component.videoCard.edit") }}
                            </v-list-item>
                        </v-list>
                    </v-menu>

                    <v-list-item-title :class="['video-card-title ', { 'video-watched': hasWatched }]" :title="title">
                        {{ title }}
                    </v-list-item-title>
                    <v-list-item-subtitle v-if="includeChannel" class="channel-name">
                        <a
                            class="no-decoration"
                            :class="{ 'name-vtuber': video.type === 'stream' || video.channel.type === 'vtuber' }"
                            :href="`/channel/${video.channel.id}`"
                            @click.exact.stop.prevent="goToChannel(video.channel.id)"
                        >
                            {{ channelName }}
                        </a>
                    </v-list-item-subtitle>
                    <v-list-item-subtitle>
                        <span :class="'text-' + this.video.status">
                            {{ formattedTime }}
                        </span>
                        <span v-if="video.clips && video.clips.length > 0">
                            •
                            <span class="primary--text">
                                {{
                                    $tc(
                                        "component.videoCard.clips",
                                        typeof video.clips === "object" ? video.clips.length : +video.clips,
                                    )
                                }}
                            </span>
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
                <v-list-item-action v-if="!!this.$slots.action" :style="horizontal && 'margin-top:30px'">
                    <slot name="action"></slot>
                </v-list-item-action>
            </v-list-item>
        </v-card>
        <!-- comments are shown for search results when you search comments -->
        <v-list style="max-height: 400px" dense class="pa-0 transparent overflow-y-auto caption" v-if="video.comments">
            <v-divider class="mx-4" style="flex-basis: 100%; height: 0"></v-divider>
            <!-- Render Channel Avatar if necessary -->
            <v-list-item class="pa-0" v-for="comment in video.comments" :key="comment.comment_key">
                <comment :comment="comment" :videoId="video.id"></comment>
            </v-list-item>
        </v-list>

        <v-snackbar app v-model="doneCopy" :timeout="3000" color="success">
            {{ $t("component.videoCard.copiedToClipboard") }}
            <template v-slot:action="{ attrs }">
                <v-btn text v-bind="attrs" @click="doneCopy = false">
                    {{ $t("views.app.close_btn") }}
                </v-btn>
            </template>
        </v-snackbar>
    </div>
</template>

<script lang="ts">
import { formatCount, getVideoThumbnails, decodeHTMLEntities } from "@/utils/functions";
import { formatDuration, formatDistance, dayjs } from "@/utils/time";
import * as icons from "@/utils/icons";
import copyToClipboard from "@/mixins/copyToClipboard";
/* eslint-disable no-unused-vars */

export default {
    name: "VideoCard",
    components: {
        ChannelImg: () => import("@/components/channel/ChannelImg.vue"),
        Comment: () => import("./Comment.vue"),
    },
    mixins: [copyToClipboard],
    data() {
        return {
            forceJPG: true,
            icons,
            now: Date.now(),
            updatecycle: null,
            doneCopy: false,
        };
    },
    mounted() {
        if (!this.updatecycle && this.video.status === "live") this.updatecycle = setInterval(this.updateNow, 1000);
    },
    activated() {
        if (!this.updatecycle && this.video.status === "live") this.updatecycle = setInterval(this.updateNow, 1000);
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
                    return formatDistance(
                        this.video.start_scheduled || this.video.available_at,
                        this.lang,
                        this.$t.bind(this),
                    );
                case "live":
                    return this.$t("component.videoCard.liveNow");
                default:
                    return formatDistance(this.video.available_at, this.lang, this.$t.bind(this));
            }
        },
        formattedDuration() {
            const duration =
                this.video.start_actual && this.video.status === "live"
                    ? dayjs(this.now).diff(dayjs(this.video.start_actual))
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
        shouldHideThumbnail() {
            return this.$store.state.settings.hideThumbnail || this.hideThumbnail;
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
        // Adds video to saved videos library
        toggleSaved(event) {
            event.preventDefault();
            this.hasSaved
                ? this.$store.commit("library/removeSavedVideo", this.video.id)
                : this.$store.commit("library/addSavedVideo", this.video);
        },
        goToVideo() {
            this.$emit("videoClicked", this.video);
            if (this.disableDefaultClick) return;
            // On mobile, clicking on watch links should not increment browser history
            // Back button will always return to the originating video list in one click
            if (this.$route.path.match("^/watch") && this.isMobile) {
                this.$router.replace({ path: `/watch/${this.video.id}` });
            } else {
                this.$router.push({ path: `/watch/${this.video.id}` });
            }
        },
        goToChannel() {
            this.$emit("videoClicked", this.video);
            if (this.disableDefaultClick) return;
            this.$router.push({ path: `/channel/${this.video.channel.id}` });
        },
        goToYoutube() {
            this.$emit("videoClicked", this.video);
            if (this.disableDefaultClick) return;
            const url = `https://www.youtube.com/watch?v=${this.video.id}`;
            window.open(url, "_blank", "noopener");
        },
        updateNow() {
            this.now = Date.now();
        },
        copyLink() {
            const link = `${window.origin}/watch/${this.video.id}`;
            this.copyToClipboard(link);
        },
    },
};
</script>

<style scoped>
.theme--light .video-watched {
    color: #94659c !important;
}

.theme--dark .video-watched {
    color: #ce93d8 !important;
}

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
.theme--dark.v-list-item .channel-name > a:hover {
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

.video-card-more {
    position: absolute;
    right: 0px;
    display: inline-block;
    top: 5px;
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
/* .name-subber {
    color: #ffffffB3 !important;
} */

.video-card-active {
    /* primary color with opacity */
    background-color: #f0629257;
}
</style>
