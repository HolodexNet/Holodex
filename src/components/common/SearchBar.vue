<template>
    <!-- https://dev.vuetifyjs.com/en/api/v-autocomplete/#props -->
    <v-autocomplete
        class="ma-auto search-bar"
        :class="{ 'search-bar-small': isMobile }"
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
        :label="$t('component.search.searchLabel')"
        :filter="(a, b) => true"
        return-object
        @keydown.enter="onEnterKeyDown"
        hide-details="auto"
    >
        <template v-slot:selection="selection">
            <v-card
                :color="$vuetify.theme.dark ? 'grey darken-3' : 'primary accent-4'"
                :label="selection.item.type !== 'channel'"
                class="pa-0 selected-card"
                :dark="$vuetify.theme.dark"
            >
                <v-list-item class="ma-n1 py-0 pl-3 pr-1">
                    <div class="selected-card-type px-1 py-0 ma-0 rounded text--disabled caption">
                        <v-icon x-small v-if="selection.item.type === 'channel'">{{ icons.mdiYoutube }}</v-icon>
                        <v-icon x-small v-if="selection.item.type === 'video url'">{{ icons.mdiYoutube }}</v-icon>
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
                        <v-icon small color="primary accent-2" @click="deleteChip(selection.item)">{{
                            icons.mdiClose
                        }}</v-icon>
                    </v-list-item-action>
                </v-list-item>
            </v-card>
        </template>
        <template v-slot:item="dropdownItem">
            <div class="ma-n1 py-0 pl-3 pr-1">
                <!-- @click="addItem(dropdownItem.item) -->
                <v-list-item-content class="py-1 pt-1">
                    <v-list-item-subtitle class="text--primary">
                        {{ i18nItem(dropdownItem.item.type) }}
                        <v-icon small v-if="dropdownItem.item.type === 'channel'">{{ icons.mdiYoutube }}</v-icon>
                        <v-icon small v-if="dropdownItem.item.type === 'video url'">{{ icons.mdiYoutube }}</v-icon>
                        <v-icon small v-if="dropdownItem.item.type === 'topic'">{{ icons.mdiAnimationPlay }}</v-icon>
                        <v-icon small v-if="dropdownItem.item.type === 'org'">{{ mdiAccountMultiple }}</v-icon>
                        <v-icon small v-if="dropdownItem.item.type === 'title & desc'">{{ mdiTextSearch }}</v-icon>
                        <v-icon small v-if="dropdownItem.item.type === 'comments'">{{ mdiCommentSearch }}</v-icon>

                        {{ dropdownItem.item.text }}
                    </v-list-item-subtitle>
                </v-list-item-content>
            </div>
        </template>
        <template v-slot:append-outer>
            <v-btn large class="ml-1 append-btn" @click="commitSearch">
                <v-icon key="searchbtn" large color="secondary" v-text="icons.mdiMagnify"></v-icon>
            </v-btn>
            <v-btn large class="ml-1 append-btn" @click="goToOrToggleAdvanced">
                <v-icon key="advanced" large color="secondary" v-text="mdiFilter"></v-icon>
            </v-btn>
        </template>
    </v-autocomplete>
</template>

<script lang="ts">
import {
    mdiLabel,
    mdiMagnifyPlusOutline,
    mdiAccountMultiple,
    mdiTextSearch,
    mdiFilter,
    mdiCommentSearch,
} from "@mdi/js";
import * as icons from "@/utils/icons";
import api from "@/utils/backend-api";
import ChannelImg from "@/components/channel/ChannelImg.vue";
import { debounce } from "@/utils/functions";
import { json2csvAsync, csv2jsonAsync } from "json-2-csv";

export default {
    name: "SearchBar",
    components: {
        ChannelImg,
    },
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
        cachedChannels() {
            return this.$store.state.cachedChannels;
        },
        results() {
            return this.fromApi.concat(this.query ? this.query : []);
        },
        nameProperty() {
            return this.$store.state.settings.nameProperty;
        },
    },
    async mounted() {
        if (this.$route.query && this.$route.query.q) {
            this.query = await csv2jsonAsync(this.$route.query.q);
        }
    },
    watch: {
        "$route.query": {
            deep: true,
            async handler({ q }) {
                if (q) {
                    this.query = await csv2jsonAsync(q);
                }
            },
        },
        // eslint-disable-next-line func-names
        search: debounce(function (val) {
            if (!val) return;
            this.fromApi = [];
            const entropy = encodeURIComponent(val).length;
            if (entropy <= 2) return;
            const formatted = val.replace("#", "");
            this.getAutocomplete(formatted)
                .then((res) => {
                    let textQueries = [];
                    if (encodeURIComponent(val).length > 2)
                        textQueries = [
                            { type: "none", disabled: true, divider: true, value: "div", text: "div" },
                            { type: "title & desc", value: `${val}title & desc`, text: val },
                            { type: "none", disabled: true, divider: true, value: "div", text: "div" },
                            { type: "comments", value: `${val}comments`, text: val },
                        ];
                    this.fromApi = [...res.data, ...textQueries];
                })
                .catch((e) => console.log(e));
        }, 500),
    },
    methods: {
        async getAutocomplete(query) {
            this.isLoading = true;
            const res = await api.searchAutocomplete(query);
            res.data = res.data.map((x) => {
                if (!x.text) x.text = x.value;
                return x;
            });
            this.isLoading = false;
            return res;
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

            if (this.query.length === 1 && this.query[0].type === "video url") {
                this.$router.push(`/watch/${this.query[0].value}`);
                return;
            }

            this.$router.push({
                path: "/search",
                query: {
                    ...this.$route.query,
                    q: await json2csvAsync(this.query),
                    page: undefined,
                },
            });
        },
        async goToOrToggleAdvanced() {
            if (this.$route.name === "search") {
                // toggle
                this.$router.push({
                    path: "/search",
                    query: {
                        ...this.$route.query,
                        q: await json2csvAsync(this.query),
                        advanced: !(this.$route.query.advanced === "true"),
                        page: undefined,
                    },
                });
            } else {
                // go to
                this.$router.push({
                    path: "/search",
                    query: {
                        q: await json2csvAsync(this.query),
                        advanced: true,
                        page: undefined,
                    },
                });
            }
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
        i18nItem(item) {
            switch (item) {
                case "channel":
                    return this.$t("component.search.type.channel");
                case "video url":
                    return this.$t("component.search.type.videourl");
                case "topic":
                    return this.$t("component.search.type.topic");
                case "org":
                    return this.$t("component.search.type.org");
                case "title & desc":
                    return this.$t("component.search.type.titledesc");
                case "comments":
                    return this.$t("component.search.type.comments");
                default:
                    return "";
            }
        },
        onEnterKeyDown() {
            if (this.search === null || this.search.length === 0) {
                this.commitSearch();
            }
        },
    },
};
</script>

<style lang="scss">
.search-bar {
    // width management.
    max-width: 670px !important;
    // these two properties prevent the bar from moving 'up'
    height: 56px;
    padding-top: 4px !important;

    &.search-bar-small {
        max-width: 90vw !important;
    }

    .selected-card {
        margin: 3px;
        max-width: 100%;
        min-width: 80px;
        overflow: hidden;
    }

    &.v-input > .v-input__control {
        height: auto !important;
        min-height: 47px !important;
    }

    input {
        padding-left: 10px !important;
    }

    &.v-input--dense > .v-input__append-outer {
        min-height: 47px !important;
        min-width: 38px;
        height: 100%;
        margin: 0 !important;
        background-color: none;
        border-radius: inherit;

        .append-btn {
            min-height: 46px;
            min-width: 49px;
            max-width: 49px;
        }
    }

    .v-messages.theme--dark.error--text {
        background-color: rgb(30, 30, 30);
        font-weight: 600;
        padding: 2px;
        border-radius: 2px;
    }

    .selected-card-type {
        position: absolute;
        top: 3px;
        left: 3px;
        background-color: rgba(100, 100, 100, 0.3);
        line-height: 1rem;
    }

    &.v-input .v-input__slot {
        padding-left: 1px !important;
        padding-top: 1px !important;
    }

    & > .v-input__append-outer > .v-input__icon > .v-icon.primary--text {
        color: white !important;
    }

    & > .v-input__control > .v-input__slot > .v-select__slot > label {
        left: 10px !important;
    }
}
.v-autocomplete__content.v-menu__content {
    translate: 0 -4px;
}

/* .search-bar.theme--light > .v-input__append-outer > .v-input__icon > .v-icon {
    color: black !important;
} */
</style>
