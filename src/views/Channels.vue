<template>
    <v-container>
        <v-tabs v-model="category">
            <v-tab>Vtuber</v-tab>
            <v-tab>Subber</v-tab>
            <v-tab>Favorites</v-tab>
        </v-tabs>
        <v-divider />
        <v-container fluid class="pa-0">
            <v-list
                class="d-flex justify-space-between"
                style="background: none"
            >
                <v-menu offset-y>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn
                            dark
                            v-bind="attrs"
                            v-on="on"
                            text
                            style="border: none; textTransform: initial; font-weight: 400"
                            class="text--secondary"
                        >
                            {{ sort.find(s => s.value == sort_value).text }}
                            <v-icon size="20">{{ mdiArrowDown }}</v-icon>
                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-item
                            v-for="(item, index) in sort"
                            :key="index"
                            link
                        >
                            <v-list-item-title @click="sort_value = item.value">
                                {{ item.text }}
                            </v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
                <v-btn icon @click="cardView = !cardView" class="mr-2">
                    <v-icon>
                        {{ cardView ? mdiViewModule : mdiViewList }}
                    </v-icon>
                </v-btn>
            </v-list>
            <ChannelList
                :channels="channels"
                includeVideoCount
                :includeGroupHeader="sort_value === 'group'"
                :cardView="cardView"
            />
            <infinite-loading
                @infinite="loadData"
                style="min-height: 10px;"
                :identifier="infiniteId"
                v-if="category !== 2"
                spinner="spiral"
            >
                <template v-slot:no-more><span></span></template>
                <template v-slot:error>
                    <ApiErrorMessage />
                </template>
            </infinite-loading>
        </v-container>
        <div
            v-if="favorites.length > 0 && category == 2"
            class="text--secondary"
        >
            Last updated {{ lastUpdated }} ago
        </div>
    </v-container>
</template>

<script>
import ChannelList from "@/components/ChannelList";
import api from "@/utils/backend-api";
import InfiniteLoading from "vue-infinite-loading";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ApiErrorMessage from "@/components/ApiErrorMessage";
import { mdiArrowDown, mdiViewList, mdiViewModule } from "@mdi/js";
dayjs.extend(relativeTime);
export default {
    name: "Channels",
    components: {
        ChannelList,
        InfiniteLoading,
        ApiErrorMessage,
    },
    data() {
        return {
            ...{ mdiArrowDown, mdiViewList, mdiViewModule },
            channels: [],
            // category: 0,
            currentOffset: 0,
            perPage: 25,
            infiniteId: +new Date(),
            sort: [
                {
                    text: "Subscribers",
                    value: "subscribers",
                    query_value: {
                        sort: "subscriber_count",
                        order: "desc",
                    },
                },
                {
                    text: "Group",
                    value: "group",
                    query_value: {
                        sort: "group",
                        order: "asc",
                    },
                },
                {
                    text: "Recent Upload",
                    value: "recent_upload",
                    query_value: {
                        sort: "latest_published_at",
                        order: "desc",
                    },
                },
            ],
        };
    },
    created() {
        // might be bad to access directly, but needed in order to avoid double api calls
        // this.category = this.$store.state.favorites.length > 0 ? 2 : 0;
    },
    watch: {
        category() {
            this.init();
        },
        sort_value() {
            if (this.category == 2) this.localSortChannel();
            else this.init();
        },
    },
    computed: {
        favorites() {
            return this.$store.state.favorites;
        },
        cachedChannels() {
            return this.$store.state.cachedChannels;
        },
        lastUpdated() {
            return dayjs(this.$store.state.cachedChannelsLastUpdated).toNow(
                true
            );
        },
        category: {
            get() {
                return this.$store.state.channelsCategory;
            },
            set(val) {
                return this.$store.commit("setChannelsCategory", val);
            }
        },
        sort_value: {
            get() {
                console.log(this.$store.state.channelsSort[this.category]);
                return this.$store.state.channelsSort[this.category];
            },
            set(val) {
                console.log({
                    category: this.category,
                    value: val,
                });
                return this.$store.commit("setChannelsSort", {
                    category: this.category,
                    value: val,
                });
            },
        },
        cardView: {
            get() {
                return this.$store.state.channelsCardView[this.category];
            },
            set(val) {
                console.log({
                    category: this.category,
                    value: val,
                });
                return this.$store.commit("setChannelsCardView", {
                    category: this.category,
                    value: val,
                });
            },
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
                ...this.sort.find(opt => opt.value == this.sort_value)
                    .query_value,
            })
                .then(res => {
                    if (res.data.channels.length) {
                        this.channels = this.channels.concat(res.data.channels);
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
            this.localSortChannel();
        },
        localSortChannel() {
            const sort_prop = this.sort.find(
                opt => opt.value == this.sort_value
            ).query_value;
            this.channels.sort((a, b) => {
                if (sort_prop.sort == "latest_published_at") {
                    var dateA = new Date(a[sort_prop.sort]).getTime();
                    var dateB = new Date(b[sort_prop.sort]).getTime();
                    console.log(dateA);
                    return dateA > dateB ? 1 : -1;
                }
                return a[sort_prop.sort] > b[sort_prop.sort] ? 1 : -1;
            });
            if (sort_prop.order == "desc") this.channels.reverse();
        },
    },
};
</script>

<style>
.channel-card-grid::after {
    content: "";
    flex: auto;
}
.v-slide-group__prev--disabled {
    display: none !important;
}
</style>
