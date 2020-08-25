<template>
    <v-container class="home">
        <div class="text-h6">Live</div>
        <v-row>
            <v-col
                v-for="video in live"
                :key="video.id"
                cols="12"
                sm="6"
                md="6"
                lg="4"
            >
                <VideoCard :video="video" includeChannel />
            </v-col>
        </v-row>
        <div class="text-h6">Channels</div>
        <v-divider />
        <v-row>
            <v-col
                v-for="channel in channels"
                :key="channel.id"
                cols="12"
                sm="6"
                md="6"
                lg="4"
            >
                <ChannelCard :channel="channel"></ChannelCard>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
// @ is an alias to /src
import ChannelCard from "@/components/ChannelCard.vue";
import VideoCard from "@/components/VideoCard.vue";
import api from "@/utils/backend-api";

export default {
    name: "Home",
    components: {
        ChannelCard,
        VideoCard,
    },
    data() {
        return {
            channels: [],
            live: [],
        };
    },
    created() {
        api.vtuberChannels().then(res => {
            this.channels = res.data.channels;
        });
        api.live().then(res => {
            this.live = res.data.live;
        });
    },
};
</script>

<style scoped>
.channel-card-grid::after {
    content: "";
    flex: auto;
}
</style>
