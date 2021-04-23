<template>
    <v-card>
        <v-form>
            <v-container>
                <v-row class="px-3">
                    <v-col cols="12">
                        <v-select
                            v-model="org"
                            clearable
                            solo-inverted
                            hide-details="auto"
                            :items="ORGS"
                            :label="$t('component.search.type.org')"
                            :prepend-icon="mdiAccountMultiple"
                        ></v-select>
                    </v-col>

                    <v-col cols="12">
                        <v-select
                            v-model="topic"
                            :items="topics"
                            hide-details="auto"
                            :label="$t('component.search.type.topic')"
                            solo-inverted
                            :prepend-icon="icons.mdiAnimationPlay"
                        ></v-select>
                    </v-col>

                    <v-col cols="12">
                        <v-autocomplete
                            chips
                            hide-details="auto"
                            v-model="channels"
                            :label="$t('component.search.type.channel')"
                            :prepend-icon="icons.mdiYoutube"
                            :loading="channelLoading"
                            :items="channelResultsFinal"
                            :search-input.sync="channelSearch"
                            @input="channelClearAPIResults"
                            no-filter
                            multiple
                            solo-inverted
                            item-color="secondary"
                            small-chips
                            return-object
                        ></v-autocomplete>
                    </v-col>
                    <v-divider></v-divider>
                    <v-col cols="12" md="6">
                        <v-text-field
                            v-model="title"
                            hide-details="auto"
                            :label="$t('component.search.type.titledesc')"
                            :prepend-icon="mdiTextSearch"
                            :solo-inverted="!commentIsFilled"
                            :outlined="commentIsFilled"
                            :disabled="commentIsFilled"
                        ></v-text-field>
                    </v-col>
                    <v-divider vertical></v-divider>
                    <v-col cols="12" md="6">
                        <v-text-field
                            v-model="comment"
                            hide-details="auto"
                            :label="$t('component.search.type.comments')"
                            :prepend-icon="mdiCommentSearch"
                            :solo-inverted="!titleIsFilled"
                            :outlined="titleIsFilled"
                            :disabled="titleIsFilled"
                        ></v-text-field>
                    </v-col>

                    <v-btn
                        fab
                        color="primary"
                        large
                        type="submit"
                        class="ml-auto mr-3 mb-3"
                        :disabled="false"
                        @click.stop.prevent="submitSearch"
                    >
                        <v-icon>{{ icons.mdiMagnify }}</v-icon>
                    </v-btn>
                </v-row>
            </v-container>
        </v-form>
    </v-card>
</template>

<script>
import {
    mdiLabel,
    mdiMagnifyPlusOutline,
    mdiAccountMultiple,
    mdiTextSearch,
    mdiFilter,
    mdiCommentSearch,
} from "@mdi/js";

import { ORGS } from "@/utils/consts";
import { debounce } from "@/utils/functions";
import backendApi from "@/utils/backend-api";
import { csv2jsonAsync, json2csvAsync } from "json-2-csv";

export default {
    data() {
        return {
            mdiLabel,
            mdiAccountMultiple,
            mdiMagnifyPlusOutline,
            mdiTextSearch,
            mdiCommentSearch,
            mdiFilter,

            ORGS,

            org: undefined,
            topic: undefined,
            comment: undefined,
            title: undefined,

            channels: undefined,

            channelLoading: false,
            channelResults: [],
            channelSearch: undefined,

            topics: [],
        };
    },
    async mounted() {
        backendApi.topics().then(({ data }) => {
            this.topics = data.map(({ id, count }) => ({ value: id, text: `${id} (${count})` }));
        });
        this.processQuery(await csv2jsonAsync(this.$route.query.q));
    },
    watch: {
        // eslint-disable-next-line func-names
        channelSearch: debounce(async function (val) {
            if (!val) return;
            this.channelLoading = true;
            const res = await backendApi.searchAutocomplete(val);
            res.data = res.data
                .map((x) => {
                    if (!x.text) x.text = x.value;
                    return x;
                })
                .filter((x) => x.type === "channel");

            this.channelResults = [...res.data];
            this.channelLoading = false;
        }, 200),
        async $route(to) {
            this.processQuery(await csv2jsonAsync(to.query.q));
        },
    },
    computed: {
        channelResultsFinal() {
            return this.channelResults.concat(this.channels || []);
        },
        commentIsFilled() {
            return (this.comment && this.comment.length > 0) || false;
        },
        titleIsFilled() {
            return (this.title && this.title.length > 0) || false;
        },
    },
    methods: {
        channelClearAPIResults() {
            this.channelSearch = undefined;
            this.channelResults = [];
        },
        processQuery(queryArray) {
            /* [
                {
                    "type": "topic",
                    "value": "nier",
                    "text": "nier"
                },
                {
                    "type": "channel",
                    "value": "UCOyYb1c43VlX9rc_lT6NKQw",
                    "text": "Ayunda Risu Ch. hololive-I"
                },
                {
                    "type": "channel",
                    "value": "UCu4d39x6pdw3l7aPk4kHepg",
                    "text": "Edoman Ch."
                }
            ] */
            const topicOpt = queryArray.find((v) => v.type === "topic");
            this.topic = (topicOpt && topicOpt.value) || undefined;

            this.channels = queryArray.filter((v) => v.type === "channel");

            const titleOpt = queryArray.find((v) => v.type === "title & desc");
            this.title = (titleOpt && titleOpt.text) || undefined;

            const commentOpt = queryArray.find((v) => v.type === "comments");
            this.comment = (commentOpt && commentOpt.text) || undefined;

            const orgOpt = queryArray.find((v) => v.type === "org");
            this.org = (orgOpt && orgOpt.value) || undefined;
        },
        async submitSearch() {
            const reconstruction = [];
            if (this.org) reconstruction.push({ type: "org", value: `${this.org}`, text: this.org });
            if (this.topic) reconstruction.push({ type: "topic", value: `${this.topic}`, text: this.topic });
            if (this.channels) reconstruction.push(...this.channels);
            if (this.title)
                reconstruction.push({ type: "title & desc", value: `${this.title}title & desc`, text: this.title });
            if (this.comment)
                reconstruction.push({ type: "comments", value: `${this.comment}comments`, text: this.comment });

            this.$router.push({
                path: "/search",
                query: {
                    ...this.$route.query,
                    q: await json2csvAsync(reconstruction),
                    page: undefined,
                },
            });
        },
    },
};
</script>

<style></style>
