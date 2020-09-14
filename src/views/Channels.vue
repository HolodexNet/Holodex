<template>
    <v-container>
        <v-tabs v-model="category">
            <v-tab>Vtuber</v-tab>
            <v-tab>Subber</v-tab>
        </v-tabs>
        <v-divider />
        <v-container fluid class="pa-0">
            <ChannelList :channels="channels" />
        </v-container>
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
            category: 0,
        };
    },
    created() {
        this.loadData();
    },
    watch: {
        category() {
            this.loadData();
        },
    },
    methods: {
        loadData() {
            this.channels = [];
            if (this.category == 1) {
                api.subberChannels().then(res => {
                    this.channels = res.data.channels;
                });
            } else {
                api.vtuberChannels().then(res => {
                    this.channels = res.data.channels;
                });
            }
        },
    },
};
</script>

<style scoped>
.channel-card-grid::after {
    content: "";
    flex: auto;
}
</style>
