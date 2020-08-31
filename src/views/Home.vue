<template>
    <v-container class="home">
        <div class="text-h6">Live</div>
        <v-divider />
        <VideoCardList
            :videos="live"
            includeChannel
            :cols="{
                cols: 12,
                sm: 6,
                md: 4,
                lg: 3,
                xl: 3,
            }"
        >
        </VideoCardList>
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
                xl="3"
            >
                <ChannelCard :channel="channel"></ChannelCard>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
// @ is an alias to /src
import ChannelCard from "@/components/ChannelCard.vue";
import VideoCardList from "@/components/VideoCardList.vue";
import api from "@/utils/backend-api";
import moment from "moment";

export default {
    name: "Home",
    components: {
        ChannelCard,
        VideoCardList,
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
            // get currently live and upcoming lives within then 12 hour
            this.live = res.data.live
                .concat(res.data.upcoming)
                .filter(live =>
                    moment(live.live_schedule).isBefore(moment().add(12, "h"))
                )
                .splice(0, 8);
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
