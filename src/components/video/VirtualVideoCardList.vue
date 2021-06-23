<template>
    <!-- <v-container class="py-0" style="position: relative" fluid :id="'t' + randomId"> -->
    <!-- Video Card grid rows -->
    <virtual-list
        style="overflow-y: auto; overflow-x: hidden"
        :style="{ height: computedHeight }"
        :data-key="'id'"
        :data-sources="videos"
        :data-component="VideoCard"
        :extra-props="$props"
        :estimate-size="88"
        :keeps="keeps"
        :page-mode="pageMode"
        :item-class="'virtual-video-list'"
    />
    <!-- </v-container> -->
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
            default: true,
        },
        keeps: {
            type: Number,
            default: 10,
        },
        pageMode: {
            type: Boolean,
            default: false,
        },
        activeId: {
            required: false,
            type: String,
        },
        dense: {
            type: Boolean,
            default: false,
        },
        // to be used in conjunction with videoClicked event
        disableDefaultClick: {
            type: Boolean,
            default: false,
        },
        activePlaylistItem: {
            type: Boolean,
            default: false,
        },
        height: {
            type: String,
            default: "500px",
        },
    },
    computed: {
        isMobile() {
            return this.$store.state.isMobile;
        },
        computedHeight() {
            return this.pageMode ? "" : this.height;
        },
    },
};
</script>

<style lang="scss">
.virtual-video-list {
    padding: 6px 4px;
}
</style>
