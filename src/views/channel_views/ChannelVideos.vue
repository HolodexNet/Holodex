<template>
    <div style="height: 100%">
        <!-- <v-row v-if="loading">
            <v-progress-circular indeterminate size="32" class="ma-auto"></v-progress-circular>
        </v-row> -->
        <VideoCardList
            :videos="videos"
            :includeChannel="hasChannelInfo"
            infiniteLoad
            @infinite="loadNext"
            :infiniteId="infiniteId"
            :cols="{
                xs: 1,
                sm: 3,
                md: 4,
                lg: 5,
                xl: 6,
            }"
        />
    </div>
</template>

<script>
import VideoCardList from "@/components/video/VideoCardList";
// import api from "@/utils/backend-api";
import { mapState } from "vuex";

export default {
    name: "ChannelVideos",
    components: {
        VideoCardList,
    },
    data() {
        return {
            infiniteId: +new Date(),
            pageLength: 25,
        };
    },
    mounted() {
        this.resetVideos();
    },
    computed: {
        ...mapState("channel", ["videos"]),
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
    },
    watch: {
        $route() {
            this.resetVideos();
        },
    },
    methods: {
        resetVideos() {
            this.infiniteId = +new Date();
            this.$store.commit("channel/resetVideos");
        },
        loadNext($state) {
            const lastLength = this.videos.length;
            this.$store
                .dispatch("channel/fetchNextVideos", {
                    type: this.type,
                    params: {
                        limit: this.pageLength,
                        include: "clips",
                    },
                })
                .then(() => {
                    if (this.videos.length !== lastLength) {
                        $state?.loaded();
                    } else {
                        $state?.complete();
                    }
                })
                .catch((e) => {
                    console.error(e);
                    $state?.error();
                });
        },
    },
};
</script>

<style></style>
