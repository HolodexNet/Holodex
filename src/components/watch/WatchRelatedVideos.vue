<template>
    <div>
        <template v-for="relation in Object.keys(related)">
            <template v-if="related[relation].length">
                <div class="text-overline ma-2" :key="`${relation}-title`">
                    {{ relation }}
                </div>
                <VideoCardList
                    :key="`${relation}-videos`"
                    :videos="related[relation]"
                    horizontal
                    includeChannel
                    :cols="{
                        lg: 12,
                        md: 4,
                        cols: 12,
                        sm: 6,
                    }"
                >
                </VideoCardList>
            </template>
        </template>
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
        related: {
            required: true,
            type: Object,
        },
    },
};
</script>

<style></style>
