<template>
    <!-- pad bottom for 100px to allow space for infiniteload -->
    <v-container class="py-0" style="position: relative" fluid :id="'t' + randomId">
        <!-- Video Card grid rows -->
        <!-- Set min height to account for layout shifting of show more button -->
        <v-row :dense="dense">
            <!-- Video Cards with custom grid size class based on breakpoint -->
            <v-col
                v-for="(video, index) in processedVideos"
                :key="`${index}-${video.id}`"
                :class="['video-col', `video-${colSize}`]"
            >
                <!-- Dont lazy load cards immediately seen -->
                <!-- <v-lazy style="width: 100%" v-if="lazy && index > colSize * (limitRows + 1)">
                    <VideoCard
                        :video="video"
                        fluid
                        :includeChannel="includeChannel"
                        :horizontal="horizontal"
                        :includeAvatar="includeAvatar"
                        :colSize="colSize"
                        :active="video.id === activeId"
                        :disableDefaultClick="disableDefaultClick"
                        @videoClicked="handleVideoClick"
                        :hideThumbnail="shouldHideThumbnail"
                    > -->
                <!-- pass slot to each individual video card -->
                <!-- <template v-slot:action>
                            <slot name="action" :video="video"></slot>
                        </template>
                    </VideoCard>
                </v-lazy> -->
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
            if (this.limitRows <= 0 || this.expanded) {
                return this.videos.filter((x) => {
                    return this.ignoreBlock || !blockedChannels.has(x.channel_id || x.channel.id);
                });
            }
            return this.videos
                .slice(0)
                .splice(0, this.limitRows * this.colSize)
                .filter((x) => {
                    return this.ignoreBlock || !blockedChannels.has(x.channel_id || x.channel.id);
                });
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
</style>
