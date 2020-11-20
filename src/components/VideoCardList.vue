<template>
    <v-row dense>
        <v-col v-for="video in spliced" :key="video.id" :class="['video-col', `video-${colSize}`]">
            <VideoCard
                :video="video"
                fluid
                :includeChannel="includeChannel"
                :horizontal="horizontal"
                :includeAvatar="includeAvatar"
                :colSize="colSize"
                :isXs="isXs"
            >
                <!-- pass slot to each individual video card -->
                <template v-slot:action>
                    <slot name="action" :video="video"></slot>
                </template>
            </VideoCard>
        </v-col>
        <div class="text-center" style="width: 100%">
            <v-btn
                icon
                @click="expanded = !expanded"
                v-if="limitRows > 0 && videos.length > this.limitRows * this.colSize"
            >
                <v-icon>
                    {{ this.expanded ? mdiChevronUp : mdiChevronDown }}
                </v-icon>
            </v-btn>
            <infinite-loading
                v-if="infiniteLoad"
                @infinite="emitInfinite"
                :distance="100"
                style="min-height: 10px"
                :identifier="infiniteId"
                spinner="spiral"
            >
                <template v-slot:error>
                    <ApiErrorMessage />
                </template>
            </infinite-loading>
            <v-pagination
                v-if="paginated && videos.length > 0"
                v-model="page"
                class="my-4"
                :length="Math.ceil(total / pageSize)"
            ></v-pagination>
        </div>
    </v-row>
</template>

<script>
import VideoCard from "@/components/VideoCard.vue";
import ApiErrorMessage from "@/components/ApiErrorMessage";
import { mdiChevronDown, mdiChevronUp } from "@mdi/js";

export default {
    name: "VideoCardList",
    components: {
        VideoCard,
        ApiErrorMessage,
        InfiniteLoading: () => import("vue-infinite-loading"),
    },
    data() {
        return {
            expanded: false,
            ...{ mdiChevronUp, mdiChevronDown },
            requestedPage: null,
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
            requird: false,
            type: Number,
            default: 0,
        },
        infiniteLoad: {
            required: false,
            type: Boolean,
            default: false,
        },
        infiniteId: {
            required: false,
            default: 0,
        },
        paginated: {
            type: Boolean,
            default: false,
        },
        currentPage: {
            default: 1,
        },
        pageSize: {
            default: 30,
        },
        total: {
            default: 1,
        },
    },
    methods: {
        emitInfinite($state) {
            this.$emit("infinite", $state);
        },
    },
    mounted() {},
    computed: {
        spliced() {
            if (this.limitRows <= 0 || this.expanded) return this.videos;
            return this.videos.slice(0).splice(0, this.limitRows * this.colSize);
        },
        colSize() {
            if (this.horizontal) return 1;
            return this.cols[this.$vuetify.breakpoint.name];
        },
        page: {
            get() {
                return this.currentPage;
            },
            set(val) {
                this.$emit("changePage", val, this.pageSize);
            },
        },
        isXs() {
            return this.$vuetify.breakpoint.name === "xs";
        },
    },
};
</script>

<style>
.video-col {
    display: flex;
    justify-content: center;
}

.video-1 {
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
</style>
