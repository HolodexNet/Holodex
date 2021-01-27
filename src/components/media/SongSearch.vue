<template>
    <!-- https://dev.vuetifyjs.com/en/api/v-autocomplete/#props -->
    <!--         :class="{ 'search-bar-small': isMobile }" -->
    <v-autocomplete
        class="ma-auto song-lookup"
        solo
        flat
        multiple
        deletable-chips
        chips
        disable-lookup
        clearable
        hide-no-data
        hide-selected
        auto-select-first
        dense
        :rules="[validate]"
        :autofocus="autofocus"
        :small-chips="dense"
        v-model="query"
        :loading="isLoading"
        :items="results"
        :search-input.sync="search"
        @input="onInput"
        :append-icon="''"
        label="Lookup on iTunes"
        :filter="(a, b) => true"
        return-object
        @keydown.enter="onEnterKeyDown"
        hide-details
    >
        <template v-slot:selection="selection">
            <v-card
                :color="$vuetify.theme.dark ? 'grey darken-3' : 'light-blue accent-4'"
                :label="selection.item.type !== 'channel'"
                class="pa-0 selected-card"
                :dark="$vuetify.theme.dark"
            >
                <v-list-item class="ma-n1 py-0 pl-3 pr-1">
                    {{ dropdownItem }}

                    <!-- <div class="selected-card-type px-1 py-0 ma-0 rounded text--disabled caption">
                        <v-icon x-small v-if="selection.item.type === 'channel'">{{ icons.mdiYoutube }}</v-icon>
                        <v-icon x-small v-if="selection.item.type === 'topic'">{{ icons.mdiAnimationPlay }}</v-icon>
                        <v-icon x-small v-if="selection.item.type === 'org'">{{ mdiAccountMultiple }}</v-icon>
                        <v-icon x-small v-if="selection.item.type === 'title & desc'">{{ mdiTextSearch }}</v-icon>
                        <v-icon x-small v-if="selection.item.type === 'comments'">{{ mdiCommentSearch }}</v-icon>
                        {{ i18nItem(selection.item.type) }}
                    </div>

                    <v-list-item-content class="py-1 pt-4">
                        <v-list-item-subtitle
                            class="text--primary search-item"
                            v-text="selection.item.text"
                        ></v-list-item-subtitle>
                    </v-list-item-content>

                    <v-list-item-action>
                        <v-icon small color="red accent-2" @click="deleteChip(selection.item)">{{
                            icons.mdiClose
                        }}</v-icon>
                    </v-list-item-action> -->
                </v-list-item>
            </v-card>
        </template>
        <template v-slot:item="dropdownItem">
            <div class="ma-n1 py-0 pl-3 pr-1">
                <!-- @click="addItem(dropdownItem.item) -->
                <v-list-item-content class="py-1 pt-1">
                    <v-list-item-subtitle class="text--primary">
                        {{ dropdownItem }}
                    </v-list-item-subtitle>
                </v-list-item-content>
            </div>
        </template>
        <template v-slot:append-outer>
            <v-icon key="searchbtn" large color="info" @click="commitSearch" v-text="icons.mdiMagnify"></v-icon>
        </template>
    </v-autocomplete>
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
import * as icons from "@/utils/icons";
import { debounce } from "@/utils/functions";
import { json2csvAsync, csv2jsonAsync } from "json-2-csv";
import jsonp from "jsonp-es6";

export default {
    name: "SongSearch",
    components: {},
    data() {
        return {
            query: [],
            icons,
            mdiLabel,
            mdiAccountMultiple,
            mdiMagnifyPlusOutline,
            mdiTextSearch,
            mdiCommentSearch,
            mdiFilter,
            isLoading: false,
            search: null,
            fromApi: [],
        };
    },
    props: {
        dense: {
            type: Boolean,
            default: false,
        },
        autofocus: {
            type: Boolean,
            default: false,
        },
    },

    computed: {
        isMobile() {
            return this.$store.state.isMobile;
        },
        results() {
            return this.fromApi.concat(this.query ? this.query : []);
        },
        nameProperty() {
            return this.$store.state.settings.nameProperty;
        },
    },
    watch: {
        async $route(to) {
            // console.log("UPDATED");
            if (to.query?.q && this.query.length === 0) {
                this.query = await csv2jsonAsync(to.query?.q);
            }
        },
        // eslint-disable-next-line func-names
        search: debounce(function (val) {
            if (!val) return;
            this.fromApi = [];
            const entropy = encodeURIComponent(val).length;
            if (entropy <= 2) return;
            // const formatted = val.replace("#", "").toLowerCase();
            jsonp();
        }),
    },
    methods: {
        async getAutocomplete(query) {
            this.isLoading = true;
            const res = await this.searchAutocomplete(query);
            console.log(res);
            this.isLoading = false;
            return res;
        },
        async searchAutocomplete(query) {
            return jsonp("https://itunes.apple.com/search", {
                term: query,
                entity: "musicTrack",
                country: "JP",
                limit: 30,
                lang: "ja_jp",
            });
        },
        deleteChip(item) {
            this.query.splice(this.query.map((q) => q.value).indexOf(item.value), 1);
        },
        async commitSearch() {
            if (!this.query || this.query.length === 0) return;

            if (this.query.length === 1 && this.query[0].type === "channel") {
                this.$router.push(`/channel/${this.query[0].value}`);
                return;
            }

            this.$router.push({
                path: "/search",
                query: { q: await json2csvAsync(this.query) },
            });
        },
        addItem(item) {
            // console.log(item);
            this.query.push({ ...item });
        },
        onInput() {
            this.search = null;
            this.fromApi = [];
        },
        validate(currentQuery) {
            // current limitations:
            // if more than 1 comment search, fail
            // if text search AND comment search, fail
            const countcomments = currentQuery.filter((x) => x.type === "comments").length;
            if (countcomments > 1) return "Cannot search using multiple comment conditions.";
            if (countcomments === 1 && currentQuery.filter((x) => x.type === "title & desc").length > 0)
                return "Cannot search using comment + title & desc filters at the same time.";
            return true;
        },
        onEnterKeyDown() {
            if (this.search === null || this.search.length === 0) {
                this.commitSearch();
            }
        },
    },
};
</script>

<style></style>
