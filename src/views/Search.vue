<template>
    <v-container style="height: 100%">
        <v-alert :v-if="containsTopicAndOrg" color="primary">
            Currently searching clips by <kbd>Topic</kbd> and <kbd>Organization</kbd> is not supported. No
            <b>clips</b> will show up.
        </v-alert>
        <v-row class="justify-end" style="margin-bottom: -10px">
            <v-col sm="4" md="2" class="py-1">
                <v-select v-model="filter.sort" :items="options.sort" dense label="Sort By"></v-select>
            </v-col>
            <v-col sm="4" md="2" class="py-1">
                <v-select v-model="filter.type" :items="options.type" dense label="Type"></v-select>
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

<script>
import VideoCardList from "@/components/video/VideoCardList";
import api from "@/utils/backend-api";
import { forwardTransformSearchToAPIQuery } from "@/utils/functions";
import { csv2jsonAsync } from "json-2-csv";

export default {
    name: "Search",
    metaInfo: {
        title: "Search",
    },
    components: {
        VideoCardList,
    },
    data() {
        return {
            videos: [],
            loading: false,
            horizontal: false,
            executedQuery: null,
            containsTopicAndOrg: false,
            filter: {
                sort: "newest",
                type: "all",
            },
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
            const acceptable = this.filter.type === "all" ? ["stream", "clip"] : [this.filter.type];
            const sorter =
                this.filter.sort === "oldest"
                    ? (x, y) => new Date(x.available_at) - new Date(y.available_at)
                    : (x, y) => new Date(y.available_at) - new Date(x.available_at);
            return this.videos.filter((v) => acceptable.includes(v.type)).sort(sorter);
        },
    },
    watch: {
        // eslint-disable-next-line func-names
        "$route.query": function (x) {
            this.syncFilters();
            console.log(x.q, this.executedQuery);
            if (x.q !== this.executedQuery && x.q) this.searchVideo();
        },
        // eslint-disable-next-line func-names
        "filter.sort": function () {
            // do search if the videos returned is too many.
            if (this.videos.length > 400) this.searchVideo();
        },
        // eslint-disable-next-line func-names
        "filter.type": function () {
            // do search if the videos returned is too many.
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
            this.executedQuery = q; // save to executed query;
            const parsedQuery = await csv2jsonAsync(q);
            // console.log("PARSED", parsedQuery);
            const searchQuery = forwardTransformSearchToAPIQuery(parsedQuery, {
                sort: this.filter.sort,
                lang: this.$store.state.settings.clipLangs,
                target: this.filter.type === "all" ? ["stream", "clip"] : [this.filter.type],
                conditions: [],
                topic: [],
                vch: [],
                org: [],
                comment: [],
            });
            // console.log("SEARCHING", searchQuery);
            this.containsTopicAndOrg =
                searchQuery.target.includes("clip") && (searchQuery.topic.length > 0 || searchQuery.topic.org > 0);

            if (searchQuery.comment.length === 0)
                api.searchVideo(searchQuery)
                    .then((res) => {
                        console.log(res.data);
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
            this.filter.sort = this.query.sort ? this.query.sort.toLowerCase() : this.options.defaults.sort;
            this.filter.type = this.query.type ? this.query.type.toLowerCase() : this.options.defaults.type;
        },
    },
};
</script>

<style></style>
