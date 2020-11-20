<template>
    <v-container>
        <v-tabs v-model="category">
            <v-tab>{{ $t("views.channels.tabs.Vtuber") }}</v-tab>
            <v-tab>{{ $t("views.channels.tabs.Subber") }}</v-tab>
            <v-tab>{{ $t("views.channels.tabs.Favorites") }}</v-tab>
        </v-tabs>
        <v-divider />
        <v-container fluid class="pa-0">
            <v-list
                class="d-flex justify-space-between"
                style="background: none"
            >
                <!-- Dropdown to pick sort-by into 'sort' data attr -->
                <v-menu offset-y>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn
                            v-bind="attrs"
                            v-on="on"
                            text
                            style="
                                border: none;
                                text-transform: initial;
                                font-weight: 400;
                            "
                            class="text--secondary pa-1"
                        >
                            {{ currentSortValue.text }}
                            <span
                                :class="{
                                    'rotate-asc':
                                        currentSortValue.query_value.order === 'asc',
                                }"
                            >
                                <v-icon size="20">{{ mdiArrowDown }}</v-icon>
                            </span>
                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-item
                            v-for="(item, index) in sortOptions"
                            :key="index"
                            link
                            @click="sort = item.value"
                        >
                            <v-list-item-title>
                                {{ item.text }}
                            </v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>

                <!-- Toggle of Card or Row view -->
                <v-btn icon @click="cardView = !cardView">
                    <v-icon>
                        {{ cardView ? mdiViewModule : mdiViewList }}
                    </v-icon>
                </v-btn>
            </v-list>
            <ChannelList
                :channels="channels"
                includeVideoCount
                :includeGroupHeader="sort === 'group'"
                :cardView="cardView"
            />
            <infinite-loading
                @infinite="loadData"
                style="min-height: 10px"
                :identifier="infiniteId"
                spinner="spiral"
            >
                <template v-slot:no-more><span></span></template>
                <template v-slot:error>
                    <ApiErrorMessage />
                </template>
            </infinite-loading>
        </v-container>
        <!-- Favorites specific view items: -->
        <template v-if="category === Tabs.FAVORITES">
            <div
                v-if="favorites.length > 0"
                class="text--secondary text-caption"
            >
                {{ $t("views.channels.favoriteLastUpdated", [lastUpdated]) }}
            </div>
            <div v-if="!favorites || favorites.length === 0">
                {{ $t("views.channels.favoritesAreEmpty") }}
            </div>
        </template>
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
    metaInfo: {
        title: "Channels",
    },
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
        };
    },
    beforeCreate() {
        // shorthand the translation
        this.Tabs = {
            SUBBER: 1,
            VTUBER: 0,
            FAVORITES: 2,
        };
    },
    watch: {
        category() {
            this.init();
        },
        sort() {
            if (this.category === this.Tabs.SUBBER) this.init();
            else this.localSortChannel();
        },
        favorites() {
            // update our `channel` whenever the favorites changes.
            if (this.category === this.Tabs.FAVORITES) this.loadFavorites();
        },
    },
    computed: {
        sortOptions: {
            get() {
                return [
                    {
                        text: this.$t("views.channels.sortOptions.subscribers"),
                        value: "subscribers",
                        query_value: {
                            sort: "subscriber_count",
                            order: "desc",
                        },
                    },
                    {
                        text: this.$t("views.channels.sortOptions.group"),
                        value: "group",
                        query_value: {
                            sort: "group",
                            order: "asc",
                        },
                    },
                    {
                        text: this.$t(
                            "views.channels.sortOptions.recentUpload",
                        ),
                        value: "recent_upload",
                        query_value: {
                            sort: "latest_published_at",
                            order: "desc",
                        },
                    },
                    {
                        text: this.$t("views.channels.sortOptions.videoCount"),
                        value: "video_count",
                        query_value: {
                            sort: "video_count",
                            order: "desc",
                        },
                    },
                    {
                        text: this.$t("views.channels.sortOptions.clipCount"),
                        value: "clip_count",
                        query_value: {
                            sort: "clip_count",
                            order: "desc",
                        },
                    },
                ];
            },
        },
        favorites() {
            return this.$store.state.favorites;
        },
        cachedChannels() {
            return this.$store.state.cachedChannels;
        },
        lastUpdated() {
            return dayjs(this.$store.state.cachedChannelsLastUpdated).toNow(
                true,
            );
        },
        category: {
            get() {
                return this.$store.state.channelsCategory;
            },
            set(val) {
                return this.$store.commit("setChannelsCategory", val);
            },
        },
        sort: {
            get() {
                return this.$store.state.channelsSort[this.category];
            },
            set(val) {
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
                return this.$store.commit("setChannelsCardView", {
                    category: this.category,
                    value: val,
                });
            },
        },
        currentSortValue() {
            return this.findSortValue(this.sort);
        },
    },
    methods: {
        init() {
            this.channels = [];
            this.currentOffset = 0;
            this.infiniteId += 1;
            // if (this.category == this.Tabs.FAVORITES) {
            //     this.loadFavorites();
            // }
        },
        loadData($state) {
            // load favorites directly from storage
            if (this.category === this.Tabs.FAVORITES) {
                this.loadFavorites();
                $state.loaded();
                $state.complete();
                return;
            }

            api.channels({
                limit: this.category === this.Tabs.SUBBER ? this.perPage : 100,
                offset: this.currentOffset * this.perPage,
                type: this.category === this.Tabs.SUBBER ? "subber" : "vtuber",
                ...(this.category === this.Tabs.SUBBER && {
                    ...this.currentSortValue.query_value,
                }),
            })
                .then((res) => {
                    if (res.data.channels.length) {
                        this.channels.push(...res.data.channels);
                        if (this.category === this.Tabs.VTUBER) {
                            // update channel cache when fresh data is pulled
                            res.data.channels.map((channelObj) =>
                                this.$store.commit(
                                    "addCachedChannel",
                                    channelObj,
                                ),
                            );
                            this.localSortChannel();

                            // vtubers are loaded all at once, so inifinite scrolling should do nothing
                            $state.complete();
                        }
                        this.currentOffset += 1;
                        $state.loaded();
                    } else {
                        $state.complete();
                    }
                })
                .catch((e) => {
                    console.log(e);
                    $state.error();
                });
        },
        async loadFavorites() {
            // check if any channels missing from favorites and update the cache
            await this.$store.dispatch("checkChannelCache");
            this.channels = this.favorites.map(
                (channelId) => this.cachedChannels[channelId],
            );
            this.localSortChannel();
        },
        localSortChannel() {
            const sortProp = this.currentSortValue.query_value;
            if (!sortProp) return;
            this.channels.sort((a, b) => {
                if (sortProp.sort === "latest_published_at") {
                    const dateA = new Date(a[sortProp.sort]).getTime();
                    const dateB = new Date(b[sortProp.sort]).getTime();
                    return dateA > dateB ? 1 : -1;
                }
                if (sortProp.sort === "video_count") {
                    return parseInt(a[sortProp.sort], 10) > parseInt(b[sortProp.sort], 10) ? 1 : -1;
                }
                return a[sortProp.sort] > b[sortProp.sort] ? 1 : -1;
            });
            if (sortProp.order === "desc") this.channels.reverse();
        },
        findSortValue(sort) {
            return this.sortOptions.find((opt) => opt.value === sort);
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

.rotate-asc {
    transform: rotate(180deg);
}
</style>
