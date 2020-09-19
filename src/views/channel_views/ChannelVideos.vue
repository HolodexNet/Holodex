<template>
    <div style="height: 100%">
        <v-row v-if="loading">
            <v-progress-circular
                indeterminate
                size="32"
                class="ma-auto"
            ></v-progress-circular>
        </v-row>
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
        />
        <v-pagination
            v-if="videos.length > 0"
            v-model="currentPage"
            class="my-4"
            :length="Math.ceil(totalVideos / videoPerPage)"
        ></v-pagination>
    </div>
</template>

<script>
import VideoCardList from "@/components/VideoCardList.vue";
import api from "@/utils/backend-api.js";

export default {
    name: "ChannelVideos",
    components: {
        VideoCardList,
    },
    data() {
        return {
            channel_id: null,
            videos: [],
            totalVideos: 1,
            videoPerPage: 30,
            loading: true,
        };
    },
    mounted() {
        this.channel_id = this.$route.params.id;
        this.loadTabContent();
    },
    computed: {
        hasChannelInfo() {
            // load uploader name for videos not uploaded by current channel
            return (
                this.$route.name === "clips" || this.$route.name === "mentions"
            );
        },
        currentPage: {
            get() {
                return Number(this.$route.query.page) || 1;
            },
            set(val) {
                this.$router.push({
                    query: { ...this.$route.query, page: val },
                });
            },
        },
    },
    watch: {
        $route() {
            this.totalVideos = 1;
            this.loadTabContent();
        },
    },
    methods: {
        loadTabContent() {
            this.videos = [];
            let api_req = null;
            this.loading = true;
            const query = {
                channel_id: Number(this.channel_id),
                limit: this.videoPerPage,
                offset: (this.currentPage - 1) * this.videoPerPage,
                ...(this.hasChannelInfo && { include_channel: 1 }),
            };
            switch (this.$route.name) {
                case "clips":
                    api_req = api.clips(query);
                    break;
                case "mentions":
                    api_req = api.mentions(query);
                    break;
                default:
                    api_req = api.videos(query);
                    break;
            }
            api_req.then(res => {
                this.videos = res.data.videos;
                this.totalVideos = res.data.total;
                this.loading = false;
            });
        },
    },
};
</script>

<style></style>
