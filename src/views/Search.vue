<template>
    <v-container>
        <v-row class="justify-end">
            <v-col cols="2" class="py-1">
                <v-select
                    v-model="filter.sort"
                    :items="options.sort"
                    dense
                    label="Sort By"
                ></v-select>
            </v-col>
            <v-col cols="2" class="py-1">
                <v-select
                    v-model="filter.type"
                    :items="options.type"
                    dense
                    label="Type"
                ></v-select>
            </v-col>
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
    components: {
        VideoCardList,
    },
    data() {
        return {
            videos: [],
            filter: {
                sort: "newest",
                type: "all",
            },
            options: {
                sort: [
                    {
                        text: "Newest",
                        value: "newest",
                        query_value: {
                            sort: "published_at",
                            order: "desc",
                        },
                    },
                    {
                        text: "Oldest",
                        value: "oldest",
                        query_value: {
                            sort: "published_at",
                            order: "asc",
                        },
                    },
                ],
                type: [
                    {
                        text: "All",
                        value: "all",
                        query_value: {},
                    },
                    {
                        text: "Official",
                        value: "official",
                        query_value: {
                            channel_type: "vtuber",
                        },
                    },
                    {
                        text: "Clip",
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
    },
    watch: {
        "$route.query"() {
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
        console.log(this.$route);
        if (this.query.sort) this.filter.sort = this.query.sort.toLowerCase();
        if (this.query.type) this.filter.type = this.query.type.toLowerCase();
        this.searchVideo();
    },
    methods: {
        searchVideo() {
            const query = {
                tags: this.$route.query.tags,
                title: this.$route.query.title,
                ...this.options.sort.find(opt => opt.value == this.filter.sort.toLowerCase()).query_value,
                ...this.options.type.find(opt => opt.value == this.filter.type.toLowerCase()).query_value,
                include_channel: 1,
            };
            api.videos(query).then(res => {
                this.videos = res.data.videos;
            });
        },
    },
};
</script>

<style></style>
