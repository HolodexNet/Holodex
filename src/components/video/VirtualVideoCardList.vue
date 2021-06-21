<template>
    <v-container class="py-0" style="position: relative" fluid :id="'t' + randomId">
        <!-- Video Card grid rows -->
        <virtual-list
            style="overflow-y: auto; overflow-x: hidden"
            :data-key="'id'"
            :data-sources="videos"
            :data-component="VideoCard"
            :extra-props="{ horizontal: true }"
            page-mode
            :estimate-size="88"
            :keeps="15"
            :item-class="'virtual-video-list'"
        />
    </v-container>
</template>

<script lang="ts">
import VideoCard from "@/components/video/VideoCard.vue";
import ApiErrorMessage from "@/components/common/ApiErrorMessage.vue";
import VirtualList from "vue-virtual-scroll-list";
import { mdiChevronDown, mdiChevronUp } from "@mdi/js";

export default {
    name: "VirtualVideoCardList",
    components: {
        VideoCard,
        ApiErrorMessage,
        VirtualList,
    },
    data() {
        return {
            expanded: false,
            randomId: Date.now(),
            VideoCard,
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
    },
};
</script>

<style lang="scss">
.virtual-video-list {
    padding: 6px 4px;
}
</style>
