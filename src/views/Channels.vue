<template>
    <v-container>
        <v-tabs v-model="category">
            <v-tab>Vtuber</v-tab>
            <v-tab>Subber</v-tab>
            <v-tab>Favorites</v-tab>
        </v-tabs>
        <v-divider />
        <v-container fluid class="pa-0">
            <ChannelList
                :channels="channels"
                :includeSocials="category == 0 || category == 2"
                includeVideoCount
            />
            <infinite-loading
                @infinite="loadData"
                style="min-height: 10px;"
                :identifier="infiniteId"
                v-if="category !== 2"
            ></infinite-loading>
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
            currentPage: 1,
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
            this.channels = [];
            this.currentPage = 0;
            this.infiniteId += 1;
            if (this.category == 2) {
                this.loadFavorites();
            }
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
        loadData($state) {
            api.channels(
                this.perPage,
                this.currentPage * this.perPage,
                this.category == 1 ? "subber" : "vtuber"
            )
                .then(res => {
                    if (res.data.channels.length) {
                        this.channels = this.channels.concat(res.data.channels);
                        this.currentPage++;
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
            // for (let id of this.favorites) {
            //     if (!Object.prototype.hasOwnProperty.call(this.cachedChannels,id)) {
            //         console.log(`Missing channel_id: ${id}, refreshing cache`);
            await this.$store.dispatch("checkFavorites");
            //         break;
            //     }
            // }
            this.channels = Object.values(this.cachedChannels);
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
