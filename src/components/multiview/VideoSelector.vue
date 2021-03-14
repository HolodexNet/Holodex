<template>
    <v-card class="pa-3">
        <v-row>
            <v-col cols="2">
                <v-card-title>Select Live</v-card-title>
            </v-col>
            <v-col cols="10" style="max-height: 75vh; overflow-y: auto">
                <VideoCardList
                    :videos="live"
                    horizontal
                    @videoClicked="handleVideoClick"
                    disableDefaultClick
                ></VideoCardList>
            </v-col>
        </v-row>
    </v-card>
</template>

<script>
import api from "@/utils/backend-api";
import VideoCardList from "@/components/video/VideoCardList";

export default {
    name: "VideoSelector",
    components: {
        VideoCardList,
    },
    data() {
        return {
            // favoritesLive: [],
            live: [],
        };
    },
    mounted() {
        // this.loadFavorites();
        this.live = this.loadOrg("Hololive");
    },
    methods: {
        handleVideoClick(video) {
            this.$emit("videoClicked", video);
        },
        loadFavorites() {
            api.favoritesLive({
                channels: this.$store.state.favorites.favorites.map((f) => f.id).join(","),
            }).then((data) => {
                data.sort((a, b) => {
                    const dateA = new Date(a.available_at).getTime();
                    const dateB = new Date(b.available_at).getTime();
                    return dateA > dateB ? 1 : -1;
                });
                console.log(data);
                this.live = data;
            });
        },
        loadOrg(orgName) {
            return api
                .live({
                    org: orgName,
                })
                .then((res) => {
                    this.live = res;
                })
                .catch((e) => {
                    console.error(e);
                });
        },
    },
};
</script>

<style></style>
