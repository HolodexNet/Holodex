<template>
    <v-row dense style="min-height: 200px;">
        <v-col
            v-for="video in spliced"
            :key="video.id"
            :class="['video-col']"
            :cols="cols.cols"
            :sm="cols.sm"
            :md="cols.md"
            :lg="cols.lg"
            :xl="cols.xl"
        >
            <VideoCard
                :video="video"
                fluid
                :includeChannel="includeChannel"
                :horizontal="horizontal"
                :withAvatar="withAvatar"
            />
        </v-col>
        <div
            class="text-center"
            style="width: 100%"
            v-if="limit > 0 && videos.length > limit"
        >
            <v-btn icon @click="expanded = !expanded">
                <v-icon>{{
                    this.expanded ? "mdi-chevron-up" : "mdi-chevron-down"
                }}</v-icon>
            </v-btn>
        </div>
        <infinite-loading
            v-if="infiniteLoad"
            @infinite="emitInfinite"
        ></infinite-loading>
    </v-row>
</template>

<script>
import VideoCard from "@/components/VideoCard.vue";
import InfiniteLoading from "vue-infinite-loading";

export default {
    name: "VideoCardList",
    components: {
        VideoCard,
        InfiniteLoading,
    },
    data() {
        return {
            expanded: false,
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
        withAvatar: {
            required: false,
            type: Boolean,
        },
        horizontal: {
            required: false,
            type: Boolean,
        },
        cols: {
            type: Object,
            default: () => {
                return {
                    cols: 12,
                    sm: 4,
                    md: 3,
                    lg: 2,
                    xl: 2,
                };
            },
        },
        limit: {
            requird: false,
            type: Number,
            default: 0,
        },
        infiniteLoad: {
            required: false,
            type: Boolean,
            default: false,
        },
    },
    methods: {
        emitInfinite($state) {
            this.$emit("infinite", $state);
        },
    },
    computed: {
        spliced() {
            return this.limit > 0 && !this.expanded
                ? this.videos.slice(0).splice(0, this.limit)
                : this.videos;
        },
    },
};
</script>

<style>
.video-col {
    display: flex;
    justify-content: center;
}
</style>
