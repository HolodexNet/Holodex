<template>
    <v-container style="height: 100%">
        <v-row
            class="justify-end"
            style="margin-bottom: -15px; margin-top: 15px;"
        >
            <v-col sm="4" md="2" class="py-1">
                <v-select
                    v-model="filter.sort"
                    :items="options.sort"
                    dense
                    label="Sort By"
                ></v-select>
            </v-col>
            <v-col sm="4" md="2" class="py-1">
                <v-select
                    v-model="filter.type"
                    :items="options.type"
                    dense
                    label="Type"
                ></v-select>
            </v-col>
        </v-row>
        <v-row v-if="loading">
            <v-progress-circular
                indeterminate
                size="32"
                class="ma-auto"
            ></v-progress-circular>
        </v-row>
        <v-row>
            <v-col class="offset-xl-1 col-xl-10">
                <VideoCardList
                    :videos="videos"
                    includeChannel
                    :cols="{
                        xs: 1,
                        sm: 3,
                        md: 4,
                        lg: 5,
                        xl: 6,
                    }"
                    paginated
                    @changePage="loadPage"
                    :currentPage="currentPage"
                    :pageSize="pageSize"
                    :total="totalVideos"
                ></VideoCardList>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import VideoCardList from "@/components/VideoCardList";
import api from "@/utils/backend-api";
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
            totalVideos: 1,
            pageSize: 30,
            loading: false,
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
                        value: "official",
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
    },
    watch: {
        "$route.query"() {
            this.syncFilters();
            this.searchVideo();
        },
        filter: {
            handler() {
                this.$router.push({
                    path: "/search",
                    query: {
                        tags: this.$route.query.tags,
                        title: this.$route.query.title,
                        type: this.filter.type,
                        sort: this.filter.sort,
                    },
                });
            },
            deep: true,
        },
    },
    mounted() {
        // console.log(this.$route);
        this.syncFilters();
        this.searchVideo();
    },
    methods: {
        searchVideo() {
            this.loading = true;
            this.videos = [];
            const query = {
                tags: this.$route.query.tags,
                title: this.$route.query.title,
                ...this.options.sort.find(
                    opt => opt.value == this.filter.sort.toLowerCase()
                ).query_value,
                ...this.options.type.find(
                    opt => opt.value == this.filter.type.toLowerCase()
                ).query_value,
                include_channel: 1,
                limit: this.pageSize,
                offset: (this.currentPage - 1) * this.pageSize,
            };
            api.videos(query)
                .then(res => {
                    this.videos = res.data.videos;
                    this.totalVideos = res.data.total;
                    return this;
                })
                .catch(error => {
                    console.log(error);
                })
                .finally(() => (this.loading = false));
        },
        loadPage(page) {
            this.$router.push({
                query: {
                    ...this.$route.query,
                    page: page,
                },
            });
        },
        syncFilters() {
            this.filter.sort = this.query.sort
                ? this.query.sort.toLowerCase()
                : this.options.defaults.sort;
            this.filter.type = this.query.type
                ? this.query.type.toLowerCase()
                : this.options.defaults.type;
        },
    },
};
</script>

<style></style>
