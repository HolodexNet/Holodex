<template>
    <v-container class="py-0" style="position: relative" fluid>
        <v-row :dense="dense">
            <!-- Video Cards with custom grid size class based on breakpoint -->
            <v-col
                v-for="(video, index) in processedVideos"
                :key="`${index}-${video.id}`"
                :class="['video-col', `video-${colSize}`]"
            >
                <!-- Render skeleton items when data hasn't loaded yet -->
                <div style="position: relative; width: 100%; padding-bottom: calc(56.25% + 88px)">
                    <v-skeleton-loader
                        type="image, list-item-avatar-three-line"
                        style="position: absolute; width: 100%; height: 100%"
                        boilerplate
                    ></v-skeleton-loader>
                </div>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
export default {
    name: "SkeletonCardList",
    data() {
        return {
            expanded: false,
            randomId: Date.now(),
        };
    },
    props: {
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
    methods: {
        handleVideoClick(video) {
            this.$emit("videoClicked", video);
        },
    },
    computed: {
        processedVideos() {
            const currentTime = new Date();
            const size = this.limitRows ? this.limitRows * this.colSize : this.expectedSize;
            return [...new Array(size)].map((el, index) => {
                return {
                    id: +currentTime + index,
                };
            });
        },
        colSize() {
            if (this.horizontal) return 1;
            return this.cols[this.$vuetify.breakpoint.name];
        },
    },
};
</script>

<style scoped lang="scss">
::v-deep .v-skeleton-loader.v-skeleton-loader--is-loading {
    .v-skeleton-loader__image {
        height: 56.25%;
        width: 100%;
    }
}
</style>
