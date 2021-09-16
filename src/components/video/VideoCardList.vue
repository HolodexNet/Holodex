<template>
  <v-container
    class="py-0"
    style="position: relative"
    fluid
  >
    <!-- Video Card grid rows -->
    <div class="row video-row" :class="{'row--dense': dense}">
      <!-- Video Cards with custom grid size class based on breakpoint -->
      <div
        v-for="(video, index) in processedVideos"
        :key="`${index}-${video.id}`"
        :class="['video-col', `video-${colSize}`, 'flex-column', 'col']"
      >
        <VideoCard
          :video="video"
          fluid
          :include-channel="includeChannel"
          :horizontal="horizontal"
          :include-avatar="includeAvatar"
          :col-size="colSize"
          :active="video.id === activeId"
          :disable-default-click="disableDefaultClick"
          :hide-thumbnail="shouldHideThumbnail"
          @videoClicked="handleVideoClick"
        >
          <!-- pass slot to each individual video card -->
          <template #action>
            <slot name="action" :video="video" />
          </template>
        </VideoCard>
        <!-- Append comment item for Comment Search -->
        <v-list
          v-if="showComments && video.comments"
          style="max-height: 400px"
          dense
          class="pa-0 transparent overflow-y-auto caption overflow-x-hidden"
        >
          <v-divider class="mx-4" style="flex-basis: 100%; height: 0" />
          <!-- Render Channel Avatar if necessary -->
          <v-list-item v-for="comment in video.comments" :key="comment.comment_key" class="pa-0">
            <comment :comment="comment" :video-id="video.id" />
          </v-list-item>
        </v-list>
      </div>
    </div>
    <!-- Expand button/show more -->
    <div v-if="hasExpansion" class="text-center" style="width: 100%">
      <v-btn
        v-if="hasExpansion"
        ref="expandBtn"
        :text="!isMobile"
        color="primary"
        @click="expanded = !expanded"
      >
        {{ expanded ? $t("component.description.showLess") : $t("component.description.showMore") }}
        <v-icon>
          {{ expanded ? mdiChevronUp : mdiChevronDown }}
        </v-icon>
      </v-btn>
    </div>
  </v-container>
</template>

<script lang="ts">
import VideoCard from "@/components/video/VideoCard.vue";
import filterVideos from "@/mixins/filterVideos";
import { mdiChevronDown, mdiChevronUp } from "@mdi/js";

export default {
    name: "VideoCardList",
    components: {
        VideoCard,
        Comment: () => import("./Comment.vue"),
    },
    mixins: [filterVideos],
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
            default: "",
        },
        dense: {
            type: Boolean,
            default: false,
        },
        disableDefaultClick: {
            type: Boolean,
            default: false,
        },
        hideCollabs: {
            type: Boolean,
            default: false,
        },
        hideIgnoredTopics: {
            type: Boolean,
            default: false,
        },
        forOrg: {
            type: String,
            default: "",
        },
        ignoreBlock: {
            type: Boolean,
            default: false,
        },
        showComments: {
            type: Boolean,
        },
    },
    data() {
        return {
            expanded: false,
            ...{ mdiChevronUp, mdiChevronDown },
        };
    },
    computed: {
        hasExpansion() {
            return this.limitRows > 0 && this.videos.length > this.limitRows * this.colSize;
        },
        processedVideos() {
            const filterConfig = {
                ignoreBlock: this.ignoreBlock,
                hideCollabs: this.hideCollabs,
                hideIgnoredTopics: this.hideIgnoredTopics,
                forOrg: this.forOrg,
            };
            if (this.limitRows <= 0 || this.expanded) {
                return this.videos.filter((v) => this.filterVideos(v, filterConfig));
            }
            return this.videos
                .slice(0)
                .splice(0, this.limitRows * this.colSize)
                .filter((v) => this.filterVideos(v, filterConfig));
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
    watch: {
        expanded() {
            // on close, set the scroll position back to the expand button
            if (!this.expanded) {
                this.$nextTick(() => {
                    this.$refs.expandBtn.$el.scrollIntoView({ block: "center" });
                });
            }
        },
    },
    methods: {
        handleVideoClick(video) {
            this.$emit("videoClicked", video);
        },
    },
};
</script>

<style lang="scss">
.video-col {
    display: flex;
    justify-content: center;

    &.video-1 {
        padding-left: 0px;
        padding-right: 0px;
        width: 100%;
        max-width: 100%;
        flex-basis: 100%;
    }

    &.video-2 {
        width: 50%;
        max-width: 50%;
        flex-basis: 50%;
    }

    &.video-3 {
        width: 33.3%;
        max-width: 33.3%;
        flex-basis: 33.3%;
    }

    &.video-4 {
        width: 25%;
        max-width: 25%;
        flex-basis: 25%;
    }

    &.video-5 {
        width: 20%;
        max-width: 20%;
        flex-basis: 20%;
    }

    &.video-6 {
        width: 16.666%;
        max-width: 16.666%;
        flex-basis: 16.666%;
    }

    &.video-7 {
        width: 14.285%;
        max-width: 14.285%;
        flex-basis: 14.285%;
    }

    &.video-8 {
        width: 12.5%;
        max-width: 12.5%;
        flex-basis: 12.5%;
    }

    &.video-12 {
        width: 8.33%;
        max-width: 8.33%;
        flex-basis: 8.33%;
    }
}
// Increase vertical padding to accomadate collab border
.video-row.row--dense > .col,
.row--dense > [class*="col-"] {
    padding: 6px 4px;
}

.video-row.row {
    margin: 0 -12px;
}
</style>
