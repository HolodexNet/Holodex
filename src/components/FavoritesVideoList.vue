<template>
    <v-container fluid>
        <v-row v-for="videoList in videoLists" :key="videoList.title">
            <span
                style="font-size: 1rem !important; font-weight: 500"
                class="my-2"
            >
                {{ videoList.title }}
            </span>
            <VideoCardList
                :videos="videoList.videos"
                includeChannel
                :cols="{
                    xs: 1,
                    sm: 3,
                    md: 4,
                    lg: 5,
                    xl: 6,
                }"
            ></VideoCardList>
            <v-divider class="my-5" />
        </v-row>
    </v-container>
</template>

<script>
import VideoCardList from "@/components/VideoCardList";
export default {
    name: "FavoritesVideoList",
    components: {
        VideoCardList,
    },
    // data() {
    //     return {
    //         videoLists: {},
    //     };
    // },
    props: {
        videoLists: {
            type: Array,
            required: true,
        },
    },
};
</script>

<style></style>
