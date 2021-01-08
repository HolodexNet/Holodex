<template>
    <v-container>
        <v-tabs v-model="category">
            <v-tab>{{ $t("views.channels.tabs.Vtuber") }}</v-tab>
            <v-tab>{{ $t("views.channels.tabs.Subber") }}</v-tab>
            <v-tab>{{ $t("views.channels.tabs.Favorites") }}</v-tab>
        </v-tabs>
        <v-divider />
        <v-container fluid class="pa-0">
            <v-list class="d-flex justify-space-between" style="background: none">
                <!-- Dropdown to pick sort-by into 'sort' data attr -->
                <v-menu offset-y>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn
                            v-bind="attrs"
                            v-on="on"
                            text
                            style="border: none; text-transform: initial; font-weight: 400"
                            class="text--secondary pa-1"
                        >
                            {{ currentSortValue.text }}
                            <span
                                :class="{
                                    'rotate-asc': currentSortValue.query_value.order === 'asc',
                                }"
                            >
                                <v-icon size="20">{{ mdiArrowDown }}</v-icon>
                            </span>
                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-item v-for="(item, index) in sortOptions" :key="index" link @click="sort = item.value">
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
                :channels="category === Tabs.FAVORITES ? sortedFavorites : channels"
                includeVideoCount
                :includeGroupHeader="sort === 'group'"
                :cardView="cardView"
            />
            <infinite-loading
                @infinite="loadNext"
                style="min-height: 10px"
                :identifier="infiniteId"
                spinner="spiral"
                v-if="category !== Tabs.FAVORITES"
            >
                <template v-slot:no-more><span></span></template>
                <template v-slot:error>
                    <ApiErrorMessage />
                </template>
            </infinite-loading>
        </v-container>
        <!-- Favorites specific view items: -->
        <template v-if="category === Tabs.FAVORITES">
            <div v-if="favorites.length > 0" class="text--secondary text-caption">
                <!-- {{ $t("views.channels.favoriteLastUpdated", [lastUpdated]) }} -->
            </div>
            <div v-if="!favorites || favorites.length === 0">
                {{ $t("views.channels.favoritesAreEmpty") }}
            </div>
        </template>
    </v-container>
</template>

<script>
import ChannelList from "@/components/channel/ChannelList";
import InfiniteLoading from "vue-infinite-loading";
import ApiErrorMessage from "@/components/common/ApiErrorMessage";
import { mdiArrowDown, mdiViewList, mdiViewModule } from "@mdi/js";
import { mapState } from "vuex";
import { debounce, localSortChannels } from "@/utils/functions";

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
            // perPage: 25,
            infiniteId: +new Date(),
            // freeze object to stop Vue from creating watchers (small optimization)
            Tabs: Object.freeze({
                SUBBER: 1,
                VTUBER: 0,
                FAVORITES: 2,
            }),
            defaultSort: "subscribers",
        };
    },
    mounted() {
        this.$store.commit("channels/resetState");
    },
    watch: {
        category() {
            this.resetChannels();
            if (this.category === this.Tabs.FAVORITES) this.$store.dispatch("favorites/fetchFavorites");
        },
        sort() {
            if (this.category !== this.Tabs.FAVORITES) this.resetChannels();
        },
        // eslint-disable-next-line func-names
        "$store.state.currentOrg": function () {
            this.resetChannels();
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
                            sort: "suborg",
                            order: "asc",
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
        ...mapState("channels", ["channels", "isLoading", "hasError", "currentOffset"]),
        ...mapState("favorites", ["favorites", "live"]),
        category: {
            get() {
                return this.$store.state.channels.category;
            },
            set(val) {
                return this.$store.commit("channels/setCategory", val);
            },
        },
        sort: {
            get() {
                return this.$store.state.channels.sort[this.category];
            },
            set(val) {
                if (this.findSortValue(val)) {
                    return this.$store.commit("channels/setSort", val);
                }
                return this.$store.commit("channels/setSort", this.defaultSort);
            },
        },
        cardView: {
            get() {
                return this.$store.state.channels.cardView[this.category];
            },
            set(val) {
                return this.$store.commit("channels/setCardView", val);
            },
        },
        currentSortValue() {
            return this.findSortValue(this.sort) || this.findSortValue(this.defaultSort);
        },
        sortedFavorites() {
            return localSortChannels(this.$store.state.favorites.favorites, this.currentSortValue.query_value);
        },
    },
    methods: {
        // changing category also changes sort, which will cause this to trigger twice
        // eslint-disable-next-line func-names
        resetChannels: debounce(function () {
            this.infiniteId = +new Date();
            this.$store.commit("channels/resetChannels");
        }, 100),
        loadNext($state) {
            const lastLength = this.channels.length;
            this.$store
                .dispatch("channels/fetchNextChannels", {
                    type: this.category === this.Tabs.SUBBER ? "subber" : "vtuber",
                    ...this.currentSortValue.query_value,
                })
                .then(() => {
                    if (this.channels.length !== lastLength) {
                        $state.loaded();
                    } else {
                        $state.complete();
                    }
                })
                .catch((e) => {
                    console.error(e);
                    $state.error();
                });
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
