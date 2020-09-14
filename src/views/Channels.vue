<template>
    <v-container>
        <!-- <v-row>
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
        </v-row> -->
        <ChannelList :channels="channels" />
    </v-container>
</template>

<script>
// @ is an alias to /src
// import ChannelCard from "@/components/ChannelCard.vue";
import ChannelList from "@/components/ChannelList";
import api from "@/utils/backend-api";

export default {
    name: "Home",
    components: {
        // ChannelCard,
        ChannelList,
    },
    data() {
        return {
            channels: [],
        };
    },
    created() {
        api.vtuberChannels().then(res => {
            this.channels = res.data.channels;
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
