<template>
  <!-- <v-container class="py-0" style="position: relative" fluid :id="'t' + randomId"> -->
  <!-- Video Card grid rows -->
  <virtual-list
    ref="virtualVideoList"
    style="overflow-y: auto; overflow-x: hidden; overscroll-behavior: contain"
    :style="{ height: computedHeight }"
    :data-key="'id'"
    :data-sources="videos"
    :data-component="VideoCard"
    :extra-props="{ ...$props, parentPlaylistId: (playlist && playlist.id) || 'local' }"
    :estimate-size="88"
    :keeps="keeps"
    :page-mode="pageMode"
    :item-class="'virtual-video-list-item'"
    :item-class-add="checkActive"
  />
  <!-- </v-container> -->
</template>

<script lang="ts">
import VideoCard from "@/components/video/VideoCard.vue";
import VirtualList from "vue-virtual-scroll-list";
import { mdiChevronDown, mdiChevronUp } from "@mdi/js";

export default {
    name: "VirtualVideoCardList",
    components: {
        VirtualList,
    },
    props: {
        // videos: {
        //     required: true,
        //     type: Array,
        // },
        playlist: {
            required: true,
            type: Object,
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
        },
        activeId: {
            required: false,
            type: String,
            default: null,
        },
        dense: {
            type: Boolean,
        },
        // to be used in conjunction with videoClicked event
        disableDefaultClick: {
            type: Boolean,
        },
        activePlaylistItem: {
            type: Boolean,
        },
        activeIndex: {
            type: Number,
            default: -1,
        },
        height: {
            type: String,
            default: "500px",
        },
    },
    data() {
        return {
            expanded: false,
            randomId: Date.now(),
            VideoCard,
            ...{ mdiChevronUp, mdiChevronDown },
        };
    },
    computed: {
        videos() {
            return this.playlist.videos || [];
        },
        isMobile() {
            return this.$store.state.isMobile;
        },
        computedHeight() {
            return this.pageMode ? "" : this.height;
        },
    },
    watch: {
        activeIndex(idx) {
            this.$refs.virtualVideoList.scrollToIndex(idx);
        },
    },
    mounted() {
        this.$refs.virtualVideoList.scrollToIndex(this.activeIndex);
    },
    methods: {
        checkActive(index) {
            if (index === this.activeIndex) return "video-card-active";
            return "";
        },
    },
};
</script>

<style lang="scss">
.virtual-video-list-item {
    padding: 6px 4px;
}
.video-card-active {
    /* primary color with opacity */
    /* background-color: #f0629257; */
    height: auto;
    width: auto;
    position: relative;
}

.video-card-active::before {
    content: "";
    background-color: var(--v-primary-darken2);
    background-size: cover;
    position: absolute;
    top: -1px;
    right: -1px;
    bottom: -1px;
    left: -1px;
    opacity: 0.15;
    border-radius: 4px;
}
</style>
