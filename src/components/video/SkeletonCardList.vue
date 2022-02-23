<template>
  <v-container class="py-0" style="position: relative" fluid>
    <v-row :dense="dense || horizontal || denseList">
      <!-- Video Cards with custom grid size class based on breakpoint -->
      <v-col
        v-for="(video, index) in processedVideos"
        :key="`${index}-${video.id}`"
        :class="['video-skeleton', 'video-col', `video-${colSize}`]"
      >
        <!-- Render skeleton items when data hasn't loaded yet -->
        <div v-if="horizontal || denseList" class="flex-grow-1">
          <v-skeleton-loader
            :type="denseList ? 'list-item-avatar' : 'list-item-avatar-three-line'"
            boilerplate
          />
        </div>
        <div v-else style="position: relative; width: 100%; padding-bottom: calc(56.25% + 88px)">
          <v-skeleton-loader
            type="image, list-item-avatar-three-line"
            style="position: absolute; width: 100%; height: 100%;"
            boilerplate
          />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
export default {
    name: "SkeletonCardList",
    props: {
        horizontal: {
            required: false,
            type: Boolean,
        },
        denseList: {
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
        dense: {
            type: Boolean,
            default: false,
        },
        useSkeleton: {
            type: Boolean,
            default: false,
        },
        expectedSize: {
            type: [Number, String],
            default: 24,
        },
    },
    data() {
        return {
            expanded: false,
            randomId: Date.now(),
        };
    },
    computed: {
        processedVideos() {
            const currentTime = new Date();
            return [...new Array(this.expectedSize)].map((el, index) => ({
                id: +currentTime + index,
            }));
        },
        colSize() {
            if (this.horizontal || this.denseList) return 1;
            return this.cols[this.$vuetify.breakpoint.name];
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
.video-skeleton .v-skeleton-loader.v-skeleton-loader--is-loading {
    .v-skeleton-loader__image {
        height: calc(100% - 88px);
        width: 100%;
    }
}

.video-skeleton .v-skeleton-loader {
     .v-skeleton-loader__list-item-avatar-three-line, .v-skeleton-loader__list-item-avatar {
        background: transparent;
    }
}
</style>
