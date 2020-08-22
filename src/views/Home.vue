<template>
    <v-container class="home">
        <div class="text-h6">Channels</div>
        <v-row>
            <v-col
                v-for="channel in channels"
                :key="channel.id"
                sm="12"
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
import api from "@/utils/backend-api";

export default {
    name: "Home",
    components: {
        ChannelCard,
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
