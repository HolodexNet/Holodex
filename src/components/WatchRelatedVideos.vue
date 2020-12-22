<template>
    <div>
        <div class="text-subtitle-2 ma-2" v-if="videoClips.length > 0">Clips</div>
        <VideoCardList
            :videos="videoClips"
            horizontal
            includeChannel
            :cols="{
                lg: 12,
                md: 12,
                cols: 12,
                sm: 12,
            }"
        />
        <v-divider />
        <div class="text-subtitle-2 ma-2" v-if="videoSources.length > 0">Related</div>
        <VideoCardList
            :videos="videoSources"
            horizontal
            includeChannel
            :cols="{
                lg: 12,
                md: 4,
                cols: 12,
                sm: 6,
            }"
        />
        <div v-if="videoSources.length + videoClips.length === 0" style="text-align: center" class="pa-2">
            No clips or related video yet
        </div>
    </div>
</template>

<script>
import VideoCardList from "@/components/VideoCardList";

export default {
    name: "WatchRelatedVideos",
    components: {
        VideoCardList,
    },
    props: {
        videoSources: {
            required: true,
        },
        videoClips: {
            required: true,
        },
    },
};
</script>

<style></style>
