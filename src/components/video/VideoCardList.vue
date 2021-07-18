<template>
    <v-container class="py-0" style="position: relative" fluid :id="'t' + randomId">
        <!-- Video Card grid rows -->
        <v-row :dense="dense" class="video-row">
            <!-- Video Cards with custom grid size class based on breakpoint -->
            <v-col
                v-for="(video, index) in processedVideos"
                :key="`${index}-${video.id}`"
                :class="['video-col', `video-${colSize}`, 'flex-column']"
            >
                <VideoCard
                    :video="video"
                    fluid
                    :includeChannel="includeChannel"
                    :horizontal="horizontal"
                    :includeAvatar="includeAvatar"
                    :colSize="colSize"
                    :active="video.id === activeId"
                    @videoClicked="handleVideoClick"
                    :disableDefaultClick="disableDefaultClick"
                    :hideThumbnail="shouldHideThumbnail"
                >
                    <!-- pass slot to each individual video card -->
                    <template v-slot:action>
                        <slot name="action" :video="video"></slot>
                    </template>
                </VideoCard>
                <!-- Append comment item for Comment Search -->
                <v-list
                    style="max-height: 400px"
                    dense
                    class="pa-0 transparent overflow-y-auto caption overflow-x-hidden"
                    v-if="video.comments"
                >
                    <v-divider class="mx-4" style="flex-basis: 100%; height: 0"></v-divider>
                    <!-- Render Channel Avatar if necessary -->
                    <v-list-item class="pa-0" v-for="comment in video.comments" :key="comment.comment_key">
                        <comment :comment="comment" :videoId="video.id"></comment>
                    </v-list-item>
                </v-list>
            </v-col>
        </v-row>
        <!-- Expand button/show more -->
        <div class="text-center" style="width: 100%" v-if="hasExpansion">
            <v-btn :text="!isMobile" @click="expanded = !expanded" v-if="hasExpansion" color="primary" ref="expandBtn">
                {{ this.expanded ? $t("component.description.showLess") : $t("component.description.showMore") }}
                <v-icon>
                    {{ this.expanded ? mdiChevronUp : mdiChevronDown }}
                </v-icon>
            </v-btn>
        </div>
    </v-container>
</template>

<script lang="ts">
import VideoCard from "@/components/video/VideoCard.vue";
import ApiErrorMessage from "@/components/common/ApiErrorMessage.vue";
import { mdiChevronDown, mdiChevronUp } from "@mdi/js";

export default {
    name: "VideoCardList",
    components: {
        VideoCard,
        ApiErrorMessage,
        Comment: () => import("./Comment.vue"),
    },
    data() {
        return {
            expanded: false,
            randomId: Date.now(),
            ...{ mdiChevronUp, mdiChevronDown },
        };
    },
    props: {
        videos: {
            required: true,
            type: Array,
        },
        includeChannel: {
            required: false,
            type: Boolean,
        },
        includeAvatar: {
            required: false,
            type: Boolean,
        },
        hideThumbnail: {
            required: false,
            type: Boolean,
            default: false,
        },
        horizontal: {
            required: false,
            type: Boolean,
        },
        cols: {
            type: Object,
            default: () => ({
                xs: 1,
                sm: 3,
                md: 4,
                lg: 6,
                xl: 8,
            }),
        },
        limitRows: {
            required: false,
            type: Number,
            default: 0,
        },
        activeId: {
            required: false,
            type: String,
        },
        dense: {
            type: Boolean,
            default: false,
        },
        // lazy: {
        //     type: Boolean,
        //     default: false,
        // },
        // to be used in conjunction with videoClicked event
        disableDefaultClick: {
            type: Boolean,
            default: false,
        },
    },
    methods: {
        handleVideoClick(video) {
            this.$emit("videoClicked", video);
        },
    },
    watch: {
        expanded() {
            // on close, set the scroll position back to the expand button
            if (!this.expanded)
                this.$nextTick(() => {
                    this.$refs.expandBtn.$el.scrollIntoView({ block: "center" });
                });
        },
    },
    computed: {
        hasExpansion() {
            return this.limitRows > 0 && this.videos.length > this.limitRows * this.colSize;
        },
        processedVideos() {
            const blockedChannels = this.$store.getters["settings/blockedChannelIDs"];
            const hiddenTopics = this.$store.getters["settings/hiddenTopics"];
            const filterVideos: any = (x) => {
                return (
                    (this.ignoreBlock || !blockedChannels.has(x.channel_id || x.channel.id)) &&
                    !hiddenTopics.has(x.topic_id)
                );
            };

            if (this.limitRows <= 0 || this.expanded) {
                return this.videos.filter(filterVideos);
            }
            return this.videos
                .slice(0)
                .splice(0, this.limitRows * this.colSize)
                .filter(filterVideos);
        },
        colSize() {
            if (this.horizontal) return 1;
            return this.cols[this.$vuetify.breakpoint.name];
        },
        isMobile() {
            return this.$store.state.isMobile;
        },
        shouldHideThumbnail() {
            return this.$store.state.settings.hideThumbnail || this.hideThumbnail;
        },
    },
};
</script>

<style lang="scss">
.video-col {
    display: flex;
    justify-content: center;
}

.video-1 {
    padding-left: 0px;
    padding-right: 0px;
    width: 100%;
    max-width: 100%;
    flex-basis: 100%;
}

.video-2 {
    width: 50%;
    max-width: 50%;
    flex-basis: 50%;
}

.video-3 {
    width: 33.3%;
    max-width: 33.3%;
    flex-basis: 33.3%;
}

.video-4 {
    width: 25%;
    max-width: 25%;
    flex-basis: 25%;
}

.video-5 {
    width: 20%;
    max-width: 20%;
    flex-basis: 20%;
}

.video-6 {
    width: 16.666%;
    max-width: 16.666%;
    flex-basis: 16.666%;
}

.video-7 {
    width: 14.285%;
    max-width: 14.285%;
    flex-basis: 14.285%;
}

.video-8 {
    width: 12.5%;
    max-width: 12.5%;
    flex-basis: 12.5%;
}

.video-12 {
    width: 8.33%;
    max-width: 8.33%;
    flex-basis: 8.33%;
}
// Increase vertical padding to accomadate collab border
.video-row.row--dense > .col,
.row--dense > [class*="col-"] {
    padding: 6px 4px;
}
</style>
