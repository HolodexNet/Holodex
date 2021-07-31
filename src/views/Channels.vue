<template>
    <v-container
        v-touch="{
            right: () => (category = Math.max(category - 1, 0)),
            left: () => (category = Math.min(category + 1, 3)),
        }"
        style="min-height: 70vh"
    >
        <portal to="mainNavExt" :disabled="!$vuetify.breakpoint.xs || !isActive">
            <v-tabs v-if="isActive" v-model="category" class="channels-tabs secondary darken-1">
                <v-tab>{{ $t("views.channels.tabs.Vtuber") }}</v-tab>
                <v-tab>{{ $t("views.channels.tabs.Subber") }}</v-tab>
                <v-tab>{{ $t("views.channels.tabs.Favorites") }}</v-tab>
                <v-tab>{{ $t("views.channels.tabs.Blocked") }}</v-tab>
            </v-tabs>
        </portal>

        <v-container fluid class="pa-0">
            <v-list v-if="category !== Tabs.BLOCKED" class="d-flex justify-space-between" style="background: none">
                <!-- Dropdown to pick sort-by into 'sort' data attr -->
                <v-menu offset-y>
                    <template #activator="{ on, attrs }">
                        <v-btn
                            v-bind="attrs"
                            text
                            style="border: none; text-transform: initial; font-weight: 400"
                            class="text--secondary pa-1"
                            v-on="on"
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
            <!-- Static channel list with no loading for locally stored blocked/favorites list -->
            <ChannelList
                v-if="category === Tabs.BLOCKED || category === Tabs.FAVORITES"
                :channels="channelList"
                include-video-count
                :grouped="sort === 'group'"
                :card-view="cardView"
                :show-delete="category === Tabs.BLOCKED"
            />
            <!-- API retrieved channels list -->
            <generic-list-loader
                v-else
                v-slot="{ data }"
                :key="`channel-list-${category}-${identifier}`"
                infinite-load
                :per-page="category === Tabs.VTUBER ? 100 : 25"
                :load-fn="getLoadFn()"
            >
                <ChannelList
                    :channels="data"
                    include-video-count
                    :grouped="currentSortValue.value === 'group' || currentSortValue.value === 'org'"
                    :group-key="$store.state.currentOrg.name === 'All Vtubers' ? 'org' : 'group'"
                    :card-view="cardView"
                    :show-delete="category === Tabs.SUBBER"
                />
            </generic-list-loader>
        </v-container>
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
import api from "@/utils/backend-api";
import { CHANNEL_TYPES } from "@/utils/consts";

import { mdiArrowDown, mdiViewList, mdiViewModule } from "@mdi/js";
import { mapState } from "vuex";
import { localSortChannels } from "@/utils/functions";
import reloadable from "@/mixins/reloadable";
import GenericListLoader from "@/components/video/GenericListLoader.vue";
import isActive from "@/mixins/isActive";

export default {
    name: "Channels",
    components: {
        ChannelList,
        GenericListLoader,
    },
    mixins: [reloadable, isActive],
    metaInfo() {
        const vm = this;
        return {
            get title() {
                return `${vm.$t("component.mainNav.channels")} - Holodex`;
            },
        };
    },
    data() {
        return {
            ...{ mdiArrowDown, mdiViewList, mdiViewModule },
            // perPage: 25,
            identifier: +new Date(),
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
    created() {
        this.init();
    },
    mounted() {},
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
                    ...((this.category === this.Tabs.VTUBER || this.category === this.Tabs.FAVORITES) &&
                    this.$store.state.currentOrg.name !== "All Vtubers"
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
                    ...(this.$store.state.currentOrg.name === "All Vtubers"
                        ? [
                              {
                                  text: this.$t("views.channels.sortOptions.org"),
                                  value: "org",
                                  query_value: {
                                      sort: "org",
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
        // ...mapState("channels", ["channels"]),
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
            return [];
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
        getLoadFn() {
            return async (offset, limit) => {
                const type = this.category === this.Tabs.SUBBER ? CHANNEL_TYPES.SUBBER : CHANNEL_TYPES.VTUBER;
                const res = await api.channels({
                    limit,
                    offset,
                    type,
                    ...(type === CHANNEL_TYPES.VTUBER && { org: this.$store.state.currentOrg.name }),
                    ...(type === CHANNEL_TYPES.SUBBER && { lang: this.$store.state.settings.clipLangs.join(",") }),
                    ...this.currentSortValue.query_value,
                });
                return res.data;
            };
        },
        // changing category also changes sort, which will cause this to trigger twice
        // eslint-disable-next-line func-names
        resetChannels() {
            this.identifier = +new Date();
            // this.$store.commit("channels/resetChannels");
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
