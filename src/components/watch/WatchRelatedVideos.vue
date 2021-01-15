<template>
    <div>
        <div class="text-subtitle-2 ma-2" v-if="simulcasts.length > 0">Simulcasts</div>
        <VideoCardList
            :videos="simulcasts"
            horizontal
            includeChannel
            :cols="{
                lg: 12,
                md: 4,
                cols: 12,
                sm: 6,
            }"
        />
        <div class="text-subtitle-2 ma-2" v-if="clips.length > 0">Clips</div>
        <VideoCardList
            :videos="clips"
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

        <div v-if="clips.length + simulcasts.length === 0" style="text-align: center" class="pa-2">
            No clips or related video yet
        </div>
    </div>
</template>

<script>
import VideoCardList from "@/components/video/VideoCardList";

export default {
    name: "WatchRelatedVideos",
    components: {
        VideoCardList,
    },
    props: {
        simulcasts: {
            required: true,
        },
        clips: {
            required: true,
        },
    },
};
</script>

<style></style>
