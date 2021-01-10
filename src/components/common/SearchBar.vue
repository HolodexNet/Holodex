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
        label="Search"
        :filter="(a, b) => true"
        return-object
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
                    <div class="selected-card-type px-1 py-0 ma-0 rounded text--disabled caption">
                        <v-icon x-small v-if="selection.item.type === 'channel'">{{ icons.mdiYoutube }}</v-icon>
                        <v-icon x-small v-if="selection.item.type === 'topic'">{{ icons.mdiAnimationPlay }}</v-icon>
                        <v-icon x-small v-if="selection.item.type === 'org'">{{ mdiAccountMultiple }}</v-icon>
                        <v-icon x-small v-if="selection.item.type === 'title & desc'">{{ mdiTextSearch }}</v-icon>
                        <v-icon x-small v-if="selection.item.type === 'comments'">{{ mdiCommentSearch }}</v-icon>
                        {{ selection.item.type }}
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
                    </v-list-item-action>
                </v-list-item>
            </v-card>
        </template>
        <template v-slot:item="dropdownItem">
            <div class="ma-n1 py-0 pl-3 pr-1">
                <!-- @click="addItem(dropdownItem.item) -->
                <v-list-item-content class="py-1 pt-1">
                    <v-list-item-subtitle class="text--primary">
                        {{ dropdownItem.item.type }}
                        <v-icon small v-if="dropdownItem.item.type === 'channel'">{{ icons.mdiYoutube }}</v-icon>
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
import ChannelChip from "@/components/channel/ChannelChip";
import api from "@/utils/backend-api";
import ChannelImg from "@/components/channel/ChannelImg";
import { debounce } from "@/utils/functions";
import { json2csvAsync, csv2jsonAsync } from "json-2-csv";

export default {
    name: "SearchBar",
    components: {
        ChannelChip,
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
    watch: {
        async $route(to) {
            console.log("UPDATED");
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
            const formatted = val.replace("#", "").toLowerCase();
            this.getAutocomplete(formatted)
                .then((res) => {
                    let textQueries = [];
                    if (encodeURIComponent(val).length > 2)
                        textQueries = [
                            { type: "title & desc", value: `${val}title & desc`, text: val },
                            { type: "none", disabled: true, divider: true, value: "div", text: "div" },
                            { type: "comments", value: `${val}comments`, text: val },
                            { type: "none", disabled: true, divider: true, value: "div", text: "div" },
                        ];
                    this.fromApi = [
                        ...textQueries,
                        ...res.data.map((x) => {
                            if (!x.text) x.text = x.value;
                            // x.value = x.text + x.type;
                            return x;
                        }),
                    ];
                })
                .catch((e) => console.log(e));
        }, 500),
    },
    methods: {
        async getAutocomplete(query) {
            this.isLoading = true;
            const res = await api.searchAutocomplete(query);
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

            this.$router.push({
                path: "/search",
                query: { q: await json2csvAsync(this.query) },
            });
        },
        addItem(item) {
            console.log(item);
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
    },
};
</script>

<style>
.search-bar {
    max-width: 670px;
    margin-bottom: -5px;
}
.search-bar-small {
    max-width: 90vw !important;
}
.search-bar .selected-card {
    margin: 3px;
    max-width: 100%;
    min-width: 80px;
    overflow: hidden;
}

.search-bar.v-input > .v-input__control {
    height: auto !important;
    min-height: 47px !important;
}

.search-bar input {
    padding-left: 10px !important;
}

.search-bar.v-input--dense > .v-input__append-outer {
    /* background-color: #424242; */
    min-width: 48px;
    min-height: 47px !important;
    height: 100%;
    margin: 0 !important;
    align-items: center;
    border-radius: inherit;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
}

.search-bar .v-messages.theme--dark.error--text {
    background-color: rgb(30, 30, 30);
    font-weight: 600;
    padding: 2px;
    border-radius: 2px;
}

.search-bar.v-input--dense > .v-input__append-outer {
    min-width: 38px;
    /* min-height: 38px; */
    margin: 0 !important;
}

.search-bar .selected-card-type {
    position: absolute;
    top: 3px;
    left: 3px;
    background-color: rgba(100, 100, 100, 0.3);
    line-height: 1rem;
}

.search-bar.v-input > .v-input__control {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
}

.search-bar.v-input .v-input__slot {
    padding-left: 1px !important;
    padding-top: 1px !important;
}

.search-bar > .v-input__append-outer > .v-input__icon > .v-icon.primary--text {
    color: white !important;
}
.search-bar > .v-input__append-outer {
    padding-left: 4px;
    padding-right: 12px;
}
.search-bar.theme--light > .v-input__append-outer {
    background-color: rgb(255, 255, 255);
}
.search-bar.theme--dark > .v-input__append-outer {
    background-color: rgb(66, 66, 66);
}

.search-bar .search-item {
    /* max-width: 30vw; */
}

.search-bar > .v-input__control > .v-input__slot > .v-select__slot > label {
    left: 10px !important;
}
/* .search-bar.theme--light > .v-input__append-outer > .v-input__icon > .v-icon {
    color: black !important;
} */
</style>
