<template>
    <v-container>
        <v-tabs v-model="category" class="channels-tabs">
            <v-tab>{{ $t("views.channels.tabs.Vtuber") }}</v-tab>
            <v-tab>{{ $t("views.channels.tabs.Subber") }}</v-tab>
            <v-tab>{{ $t("views.channels.tabs.Favorites") }}</v-tab>
            <v-tab>{{ $t("views.channels.tabs.Blocked") }}</v-tab>
        </v-tabs>
        <v-divider />
        <v-container fluid class="pa-0">
            <v-list class="d-flex justify-space-between" style="background: none" v-if="category !== Tabs.BLOCKED">
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
                :channels="channelList"
                includeVideoCount
                :grouped="sort === 'group'"
                :cardView="cardView"
                :key="`channel-list-${category}`"
                :showDelete="category === Tabs.BLOCKED || category === Tabs.SUBBER"
            />
        </v-container>
        <InfiniteLoad
            @infinite="load"
            :identifier="infiniteId"
            v-if="category !== Tabs.FAVORITES && category !== Tabs.BLOCKED"
        />
        <!-- Favorites specific view items: -->
        <template v-if="category === Tabs.FAVORITES">
            <div v-if="!favorites || favorites.length === 0">
                {{ $t("views.channels.favoritesAreEmpty") }}
            </div>
        </template>
        <!-- Blocked list specific view items -->
        <template v-if="category === Tabs.BLOCKED">
            <div v-if="!blockedChannels || blockedChannels.length === 0">
                {{ $t("views.channels.blockedAreEmpty") }}
            </div>
        </template>
    </v-container>
</template>

<script lang="ts">
import ChannelList from "@/components/channel/ChannelList.vue";
// import InfiniteLoading from "vue-infinite-loading";
import ApiErrorMessage from "@/components/common/ApiErrorMessage.vue";
import InfiniteLoad from "@/components/common/InfiniteLoad.vue";

import { mdiArrowDown, mdiViewList, mdiViewModule } from "@mdi/js";
import { mapState } from "vuex";
import { localSortChannels } from "@/utils/functions";
import reloadable from "@/mixins/reloadable";

export default {
    name: "Channels",
    mixins: [reloadable],
    metaInfo() {
        const vm = this;
        return {
            get title() {
                return `${vm.$t("component.mainNav.channels")} - Holodex`;
            },
        };
    },
    components: {
        ChannelList,
        // InfiniteLoading,
        ApiErrorMessage,
        InfiniteLoad,
    },
    data() {
        return {
            ...{ mdiArrowDown, mdiViewList, mdiViewModule },
            // perPage: 25,
            infiniteId: +new Date(),
            // freeze object to stop Vue from creating watchers (small optimization)
            Tabs: Object.freeze({
                VTUBER: 0,
                SUBBER: 1,
                FAVORITES: 2,
                BLOCKED: 3,
            }),
            defaultSort: "subscribers",
        };
    },
    mounted() {
        this.init();
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
                /* eslint-disable indent */
                return [
                    {
                        text: this.$t("views.channels.sortOptions.subscribers"),
                        value: "subscribers",
                        query_value: {
                            sort: "subscriber_count",
                            order: "desc",
                        },
                    },
                    ...(this.category === this.Tabs.VTUBER || this.category === this.Tabs.FAVORITES
                        ? [
                              {
                                  text: this.$t("views.channels.sortOptions.group"),
                                  value: "group",
                                  query_value: {
                                      sort: "suborg",
                                      order: "asc",
                                  },
                              },
                          ]
                        : []),
                    {
                        text: this.$t("views.channels.sortOptions.videoCount"),
                        value: "video_count",
                        query_value: {
                            sort: "video_count",
                            order: "desc",
                        },
                    },
                    ...(this.category === this.Tabs.VTUBER || this.category === this.Tabs.FAVORITES
                        ? [
                              {
                                  text: this.$t("views.channels.sortOptions.clipCount"),
                                  value: "clip_count",
                                  query_value: {
                                      sort: "clip_count",
                                      order: "desc",
                                  },
                              },
                          ]
                        : []),
                ];
                /* eslint-enable indent */
            },
        },
        ...mapState("channels", ["channels", "isLoading", "hasError", "currentOffset"]),
        ...mapState("favorites", ["favorites", "live"]),
        ...mapState("settings", ["blockedChannels"]),
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
        channelList() {
            if (this.category === this.Tabs.FAVORITES) return this.sortedFavorites;
            if (this.category === this.Tabs.BLOCKED) return this.blockedChannels;
            return this.channels;
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
        init() {
            this.$store.commit("channels/resetState");
        },
        reload() {
            this.init();
        },
        load($state) {
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
                        $state.completed();
                    }
                })
                .catch((e) => {
                    console.error(e);
                    $state.error();
                });
        },
        // changing category also changes sort, which will cause this to trigger twice
        // eslint-disable-next-line func-names
        resetChannels() {
            this.infiniteId = +new Date();
            this.$store.commit("channels/resetChannels");
        },
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
                        $state.completed();
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

.channels-tabs .v-slide-group__prev--disabled {
    display: none !important;
}

.rotate-asc {
    transform: rotate(180deg);
}
</style>
