<template>
    <generic-list-loader
        paginate
        :perPage="this.pageLength"
        :loadFn="getLoadFn()"
        v-slot="{ data, isLoading }"
        :key="id + type"
    >
        <VideoCardList :videos="data" :includeChannel="hasChannelInfo" :cols="cols" dense v-show="!isLoading" />
        <!-- Render skeleton items when data hasn't loaded yet -->
        <SkeletonCardList :cols="cols" dense v-if="isLoading" />
    </generic-list-loader>
</template>

<script lang="ts">
import VideoCardList from "@/components/video/VideoCardList.vue";
// import api from "@/utils/backend-api";
import { mapState } from "vuex";
import backendApi from "@/utils/backend-api";
import GenericListLoader from "@/components/video/GenericListLoader.vue";
import SkeletonCardList from "@/components/video/SkeletonCardList.vue";

export default {
    name: "ChannelVideos",
    components: {
        VideoCardList,
        GenericListLoader,
        SkeletonCardList,
    },
    data() {
        return {
            identifier: +new Date(),
            pageLength: 24,
            cols: Object.freeze({
                xs: 1,
                sm: 3,
                md: 4,
                lg: 5,
                xl: 6,
            }),
        };
    },
    computed: {
        ...mapState("channel", ["id", "channel"]),
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
        // eslint-disable-next-line func-names
        "$route.name": function () {
            this.identifier = +new Date();
        },
    },
    methods: {
        getLoadFn() {
            // eslint-disable-next-line func-names
            return async (offset, limit) => {
                const res = await backendApi.channelVideos(this.id, {
                    type: this.type,
                    query: {
                        lang: this.$store.state.settings.clipLangs.join(","),
                        include: "clips,live_info",
                        limit,
                        offset,
                        paginated: true,
                    },
                });
                return res.data;
            };
        },
    },
};
</script>

<style></style>
