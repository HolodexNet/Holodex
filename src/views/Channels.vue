<template>
    <v-container>
        <v-tabs v-model="category">
            <v-tab>Vtuber</v-tab>
            <v-tab>Subber</v-tab>
            <v-tab>Favorites</v-tab>
        </v-tabs>
        <v-divider />
        <v-container fluid class="pa-0">
            <ChannelList :channels="channels" includeVideoCount />
            <infinite-loading
                @infinite="loadData"
                style="min-height: 10px;"
                :identifier="infiniteId"
                v-if="category !== 2"
            >
                <template v-slot:no-more><span></span></template>
            </infinite-loading>
        </v-container>
    </v-container>
</template>

<script>
import ChannelList from "@/components/ChannelList";
import api from "@/utils/backend-api";
import InfiniteLoading from "vue-infinite-loading";

export default {
    name: "Home",
    components: {
        ChannelList,
        InfiniteLoading,
    },
    data() {
        return {
            channels: [],
            category: 0,
            currentOffset: 0,
            perPage: 25,
            infiniteId: +new Date(),
        };
    },
    created() {
        // might be bad to access directly, but needed in order to avoid double api calls
        this.category = this.$store.state.favorites.length > 0 ? 2 : 0;
    },
    watch: {
        category() {
            this.init();
        },
    },
    computed: {
        favorites() {
            return this.$store.state.favorites;
        },
        cachedChannels() {
            return this.$store.state.cachedChannels;
        },
    },
    methods: {
        init() {
            this.channels = [];
            this.currentOffset = 0;
            this.infiniteId += 1;
            if (this.category == 2) {
                this.loadFavorites();
            }
        },
        loadData($state) {
            api.channels({
                limit: this.perPage,
                offset: this.currentOffset * this.perPage,
                type: this.category == 1 ? "subber" : "vtuber",
                sort: "subscriber_count",
                order: "desc",
            })
                .then(res => {
                    if (res.data.channels.length) {
                        this.channels = this.channels.concat(res.data.channels);
                        console.log(res.data.channels);
                        this.currentOffset++;
                        $state.loaded();
                    } else {
                        $state.complete();
                    }
                })
                .catch(e => {
                    console.log(e);
                    $state.error();
                });
        },
        async loadFavorites() {
            // check if any channels missing from favorites and update the cache
            await this.$store.dispatch("checkChannelCache");
            this.channels = this.favorites.map(
                channel_id => this.cachedChannels[channel_id]
            );
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
