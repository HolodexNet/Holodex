<template>
    <v-container>
        <v-tabs v-model="category">
            <v-tab>Vtuber</v-tab>
            <v-tab>Subber</v-tab>
        </v-tabs>
        <v-divider />
        <v-container fluid class="pa-0">
            <ChannelList :channels="channels" />
            <infinite-loading
                @infinite="loadData"
                style="min-height: 10px;"
                :identifier="infiniteId"
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
            currentPage: 0,
            perPage: 25,
            infiniteId: +new Date(),
        };
    },
    created() {
        // this.loadData();
    },
    watch: {
        category() {
            this.channels = [];
            this.currentPage = 0;
            this.infiniteId += 1;
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
                    console.log(res.data.channels);
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
    },
};
</script>

<style scoped>
.channel-card-grid::after {
    content: "";
    flex: auto;
}
</style>
