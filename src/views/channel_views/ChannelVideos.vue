<template>
    <div style="height: 100%">
        <VideoCardList
            :videos="videos"
            :includeChannel="hasChannelInfo"
            :cols="{
                xs: 1,
                sm: 3,
                md: 4,
                lg: 5,
                xl: 6,
            }"
            :dense="true"
            paginateLoad
            :identifier="identifier"
            :paginatePages="pages"
            @load="loadNext"
        />
        <!-- infiniteLoad
            @infinite="loadNext"
            :infiniteId="infiniteId" -->
    </div>
</template>

<script lang="ts">
import VideoCardList from "@/components/video/VideoCardList.vue";
// import api from "@/utils/backend-api";
import { mapState } from "vuex";

export default {
    name: "ChannelVideos",
    components: {
        VideoCardList,
    },
    data() {
        return {
            identifier: +new Date(),
            pageLength: 25,
        };
    },
    computed: {
        ...mapState("channel", ["videos", "total"]),
        hasChannelInfo() {
            // get uploader name for videos not uploaded by current channel
            return this.$route.name === "channel_clips" || this.$route.name === "channel_collabs";
        },
        type() {
            switch (this.$route.name) {
                case "channel_clips":
                    return "clips";
                case "channel_collabs":
                    return "collabs";
                default:
                    return "videos";
            }
        },
        pages() {
            return Math.ceil(this.total / this.pageLength);
        },
    },
    watch: {
        // eslint-disable-next-line func-names
        "$route.name": function () {
            this.resetVideos();
        },
    },
    methods: {
        resetVideos() {
            this.identifier = +new Date();
            this.$store.commit("channel/resetVideos");
        },
        loadNext($state) {
            // const lastLength = this.videos.length;
            this.$store.commit("channel/resetVideos");
            this.$store
                .dispatch("channel/fetchNextVideos", {
                    type: this.type,
                    params: {
                        limit: this.pageLength,
                        offset: this.pageLength * ($state.page - 1),
                        paginated: true,
                    },
                })
                .then(() => {
                    if ($state.page <= this.pages) {
                        $state.loaded();
                    } else {
                        $state.completed();
                    }
                })
                .catch((e) => {
                    console.error(e);
                    $state.error();
                });
        },
    },
};
</script>

<style></style>
