<template>
    <v-container>
        <template v-for="relation in Object.keys(related)">
            <template v-if="related[relation].length">
                <div class="text-overline ma-2" :key="`${relation}-title`">
                    {{ relationI18N(relation) }}
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
                    dense
                >
                </VideoCardList>
            </template>
        </template>
        <!-- <template v-if="totalRelations === 0">
            No clips or related videos yet...
        </template> -->
    </v-container>
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
    computed: {
        // totalRelations() {
        //     return Object.values(this.related).map(r => r.length).reduce((a, b) => a+b);
        // }
    },
    methods: {
        relationI18N(relation) {
            switch (relation) {
                case "clips":
                    return this.$t("component.relatedVideo.clipsLabel");
                case "simulcasts":
                    return this.$t("component.relatedVideo.simulcastsLabel");
                case "refers":
                    return this.$t("component.relatedVideo.refersLabel");
                case "sources":
                    return this.$t("component.relatedVideo.sourcesLabel");
                case "recommendations":
                    return "Recommendations";
                default:
                    return "";
            }
        },
    },
};
</script>

<style></style>
