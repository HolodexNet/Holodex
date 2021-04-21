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
        <v-row v-if="loading">
            <v-progress-circular indeterminate size="32" class="ma-auto"></v-progress-circular>
        </v-row>
        <v-row>
            <v-col class="offset-xl-1 col-xl-10">
                <VideoCardList
                    :videos="filteredVideos"
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

export default {
    name: "Search",
    mixins: [isActive],
    metaInfo: {
        title: "Search - Holodex",
    },
    components: {
        VideoCardList,
        SearchForm,
    },
    data() {
        return {
            videos: [],
            loading: false,
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
        };
    },
    computed: {
        query() {
            return this.$route.query;
        },
        currentPage() {
            return Number(this.$route.query.page) || 1;
        },
        filteredVideos() {
            const acceptable = this.filter_type === "all" ? ["stream", "clip"] : [this.filter_type];
            const sorter =
                this.filter_sort === "oldest"
                    ? (x, y) => new Date(x.available_at).valueOf() - new Date(y.available_at).valueOf()
                    : (x, y) => new Date(y.available_at).valueOf() - new Date(x.available_at).valueOf();
            return this.videos.filter((v) => acceptable.includes(v.type)).sort(sorter);
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
    },
    watch: {
        // eslint-disable-next-line func-names
        "$route.query": function (x) {
            if (!this.isActive) return;
            this.syncFilters();
            // console.log(x.q, this.executedQuery);
            if (x.q !== this.executedQuery && x.q) this.searchVideo();
        },
        // eslint-disable-next-line func-names
        filter_sort: function () {
            this.$router.push({
                query: {
                    ...this.query,
                    sort: this.filter_sort,
                },
            });
            // do search if the videos returned is too many.
            // this is because sorting in reverse when the list is > 500 videos may require a new pull.
            if (this.videos.length > 400) this.searchVideo();
        },
        // eslint-disable-next-line func-names
        filter_type: function () {
            this.$router.push({
                query: {
                    ...this.query,
                    type: this.filter_type,
                },
            });
            // do search if the videos returned is too many.
            // this is because if i have more videos than 500 there'd be cutoff,
            // so getting a new batch of videos would be more data complete.
            if (this.videos.length > 400) this.searchVideo();
        },
    },
    mounted() {
        // console.log(this.$route);
        this.syncFilters();
        if (this.$route.query?.q !== this.executedQuery) this.searchVideo();
    },
    methods: {
        async searchVideo() {
            if (this.loading) return;
            this.loading = true;
            this.videos = [];
            const { q } = this.$route.query;
            if (q.length < 5) return;
            this.executedQuery = q; // save to executed query;
            const parsedQuery = await csv2jsonAsync(q);
            // console.log("PARSED", parsedQuery);
            const searchQuery = forwardTransformSearchToAPIQuery(parsedQuery, {
                sort: this.filter_sort,
                lang: this.$store.state.settings.clipLangs,
                target: this.filter_type === "all" ? ["stream", "clip"] : [this.filter_type],
                conditions: [],
                topic: [],
                vch: [],
                org: [],
                comment: [],
            });
            // console.log("SEARCHING", searchQuery);

            if (searchQuery.comment.length === 0)
                api.searchVideo(searchQuery)
                    .then((res) => {
                        // console.log(res.data);
                        this.horizontal = false;
                        this.videos = res.data;
                        return this;
                    })
                    .catch((error) => {
                        console.log(error);
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            else {
                api.searchComments(searchQuery)
                    .then((res) => {
                        // console.log(res.data);
                        this.horizontal = true;
                        this.videos = res.data;
                        return this;
                    })
                    .catch((error) => {
                        console.log(error);
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            }
        },
        loadPage(page) {
            this.$router.push({
                query: {
                    ...this.$route.query,
                    page,
                },
            });
        },
        syncFilters() {
            this.filter_sort = this.query.sort ? this.query.sort.toLowerCase() : this.options.defaults.sort;
            this.filter_type = this.query.type ? this.query.type.toLowerCase() : this.options.defaults.type;
        },
    },
};
</script>

<style></style>
