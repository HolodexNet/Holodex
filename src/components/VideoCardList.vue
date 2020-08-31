<template>
    <v-row v-if="videos.length != 0" dense>
        <v-col
            v-for="video in videos"
            :key="video.id"
            :class="['video-col', { 'lg5-custom': cols.lg === 2.4 }]"
            :cols="cols.cols"
            :sm="cols.sm"
            :md="cols.md"
            :lg="cols.lg"
            :xl="cols.xl"
        >
            <VideoCard :video="video" fluid :includeChannel="includeChannel" />
        </v-col>
    </v-row>
</template>

<script>
import VideoCard from "@/components/VideoCard.vue";
export default {
    name: "VideoCardList",
    components: {
        VideoCard,
    },
    data() {
        return {};
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
        cols: {
            type: Object,
            default: () => {
                return {
                    cols: 12,
                    sm: 4,
                    md: 3,
                    lg: 2.4,
                    xl: 2,
                };
            },
        },
    },
};
</script>

<style>
.video-col {
    display: flex;
    justify-content: center;
}

@media (min-width: 1264px) and (max-width: 1903px) {
    .lg5-custom {
        width: 20%;
        max-width: 20%;
        flex-basis: 20%;
    }
}
</style>
