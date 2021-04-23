<template>
    <v-container style="height: 100%">
        <v-row v-if="advancedOpen">
            <v-col class="offset-xl-1 col-xl-10">
                <search-form></search-form>
            </v-col>
        </v-row>
        <v-row class="justify-end" style="margin-bottom: -10px">
            <v-col sm="4" md="2" class="py-1">
                <v-select
                    v-model="filter_sort"
                    :items="options.sort"
                    dense
                    :label="$t('views.search.sortByLabel')"
                ></v-select>
            </v-col>
            <v-col sm="4" md="2" class="py-1">
                <v-select
                    v-model="filter_type"
                    :items="options.type"
                    dense
                    :label="$t('views.search.typeDropdownLabel')"
                ></v-select>
            </v-col>
        </v-row>
        <v-row>
            <v-col class="offset-xl-1 col-xl-10">
                <generic-list-loader
                    v-if="searchVideo !== null"
                    paginate
                    :perPage="pageLength"
                    :loadFn="searchVideo"
                    v-slot="{ data, isLoading }"
                    :key="filter_type + filter_sort + id + executedQuery"
                >
                    <VideoCardList
                        v-show="!isLoading"
                        :videos="data"
                        :horizontal="horizontal"
                        includeChannel
                        :cols="{
                            xs: 1,
                            sm: 3,
                            md: 4,
                            lg: 5,
                            xl: 6,
                        }"
                    ></VideoCardList>
                    <!-- Render skeleton items when data hasn't loaded yet -->
                    <skeleton-card-list
                        :cols="{
                            xs: 1,
                            sm: 3,
                            md: 4,
                            lg: 5,
                            xl: 6,
                        }"
                        dense
                        v-if="isLoading"
                    />
                </generic-list-loader>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import VideoCardList from "@/components/video/VideoCardList.vue";
import api from "@/utils/backend-api";
import { forwardTransformSearchToAPIQuery } from "@/utils/functions";
import { csv2jsonAsync } from "json-2-csv";
import isActive from "@/mixins/isActive";
import SearchForm from "@/components/search/SearchForm.vue";
import GenericListLoader from "@/components/video/GenericListLoader.vue";
import SkeletonCardList from "@/components/video/SkeletonCardList.vue";

export default {
    name: "Search",
    mixins: [isActive],
    metaInfo: {
        title: "Search - Holodex",
    },
    components: {
        VideoCardList,
        SearchForm,
        GenericListLoader,
        SkeletonCardList,
    },
    data() {
        return {
            id: Date.now(),
            // videos: [],
            horizontal: false,
            executedQuery: null,
            filter_sort: "newest",
            filter_type: "all",
            options: {
                defaults: {
                    sort: "newest",
                    type: "all",
                },
                sort: [
                    {
                        text: this.$t("views.search.sort.newest"),
                        value: "newest",
                        query_value: {
                            sort: "published_at",
                            order: "desc",
                        },
                    },
                    {
                        text: this.$t("views.search.sort.oldest"),
                        value: "oldest",
                        query_value: {
                            sort: "published_at",
                            order: "asc",
                        },
                    },
                ],
                type: [
                    {
                        text: this.$t("views.search.type.all"),
                        value: "all",
                        query_value: {},
                    },
                    {
                        text: this.$t("views.search.type.official"),
                        value: "stream",
                        query_value: {
                            channel_type: "vtuber",
                        },
                    },
                    {
                        text: this.$t("views.search.type.clip"),
                        value: "clip",
                        query_value: {
                            channel_type: "subber",
                        },
                    },
                ],
            },
            pageLength: 30,
        };
    },
    computed: {
        query() {
            return this.$route.query;
        },
        advancedOpen: {
            get() {
                return this.query.advanced === "true";
            },
            set(val) {
                this.$router.push({
                    query: {
                        ...this.query,
                        advanced: val,
                    },
                });
            },
        },
        searchVideo() {
            // this.videos = [];
            const { q } = this.query;
            if (q.length < 5) return null;
            this.executedQuery = q; // save to executed query;

            const self = this;
            console.log("Generating new search function");
            return async (offset, limit) => {
                const parsedQuery = await csv2jsonAsync(q);
                const searchQuery = forwardTransformSearchToAPIQuery(parsedQuery, {
                    sort: self.filter_sort,
                    lang: self.$store.state.settings.clipLangs,
                    target: self.filter_type === "all" ? ["stream", "clip"] : [self.filter_type],
                    conditions: [],
                    topic: [],
                    vch: [],
                    org: [],
                    comment: [],
                });

                if (searchQuery.comment.length === 0) {
                    self.horizontal = false;
                    return api
                        .searchVideo({
                            ...searchQuery,
                            paginated: true,
                            offset,
                            limit,
                        })
                        .then((x) => x.data);
                }
                self.horizontal = true;
                return api
                    .searchComments({
                        ...searchQuery,
                        paginated: true,
                        offset,
                        limit,
                    })
                    .then((x) => x.data);
            };
        },
    },
    watch: {
        // eslint-disable-next-line func-names
        "$route.query": function (x) {
            if (!this.isActive) return;
            this.syncFilters();
            // console.log(x.q, this.executedQuery);
            if (x.q !== this.executedQuery && x.q) this.id = Date.now();
        },
        // eslint-disable-next-line func-names
        filter_sort() {
            this.$router.push({
                query: {
                    ...this.query,
                    sort: this.filter_sort,
                },
            });
            this.id = Date.now();
            // do search if the videos returned is too many.
            // this is because sorting in reverse when the list is > 500 videos may require a new pull.
        },
        // eslint-disable-next-line func-names
        filter_type() {
            this.$router.push({
                query: {
                    ...this.query,
                    type: this.filter_type,
                },
            });
            this.id = Date.now();
            // do search if the videos returned is too many.
            // this is because if i have more videos than 500 there'd be cutoff,
            // so getting a new batch of videos would be more data complete.
        },
    },
    mounted() {
        this.syncFilters();
    },
    methods: {
        syncFilters() {
            this.filter_sort = this.query.sort ? this.query.sort.toLowerCase() : this.options.defaults.sort;
            this.filter_type = this.query.type ? this.query.type.toLowerCase() : this.options.defaults.type;
        },
    },
};
</script>

<style></style>
