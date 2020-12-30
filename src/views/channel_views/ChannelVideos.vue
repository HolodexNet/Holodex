<template>
    <div style="height: 100%">
        <v-row v-if="loading">
            <v-progress-circular indeterminate size="32" class="ma-auto"></v-progress-circular>
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
            :currentPage="currentPage"
            :total="totalVideos"
            @changePage="loadPaginate"
            paginated
        />
    </div>
</template>

<script>
import VideoCardList from "@/components/video/VideoCardList";
import api from "@/utils/backend-api";

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
            // get uploader name for videos not uploaded by current channel
            return this.$route.name === "channel_clips" || this.$route.name === "channel_collabs";
        },
        currentPage() {
            return Number(this.$route.query.page) || 1;
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
            let apiReq = null;
            this.loading = true;
            const query = {
                limit: this.videoPerPage,
                offset: (this.currentPage - 1) * this.videoPerPage,
                ...(this.hasChannelInfo && { include_channel: 1 }),
            };
            switch (this.$route.name) {
                case "channel_clips":
                    query.mentioned_channel_id = Number(this.channel_id);
                    query.channel_type = "subber";
                    apiReq = api.videos(query);
                    break;
                case "channel_collabs":
                    query.mentioned_channel_id = Number(this.channel_id);
                    query.channel_type = "vtuber";
                    apiReq = api.videos(query);
                    break;
                default:
                    query.channel_id = Number(this.channel_id);
                    apiReq = api.videos(query);
                    break;
            }
            apiReq.then((res) => {
                this.videos = res.data.videos;
                this.totalVideos = res.data.total;
                this.loading = false;
            });
        },
        loadPaginate(page) {
            this.$router.push({
                query: { ...this.$route.query, page },
            });
        },
    },
};
</script>

<style></style>
