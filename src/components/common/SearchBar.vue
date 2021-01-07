<template>
    <!-- https://dev.vuetifyjs.com/en/api/v-autocomplete/#props -->
    <v-autocomplete
        class="ma-auto search-bar"
        :class="{ 'search-bar-small': isXs }"
        solo
        flat
        multiple
        deletable-chips
        chips
        disable-lookup
        clearable
        hide-no-data
        hide-selected
        hide-details
        auto-select-first
        dense
        :autofocus="autofocus"
        :small-chips="dense"
        v-model="query"
        :loading="isLoading"
        :items="results"
        :search-input.sync="search"
        @input="onInput"
        :append-icon="''"
        :append-outer-icon="icons.mdiMagnify"
        @click:append-outer="commitSearch"
        label="> Search"
        :filter="(a, b) => true"
        return-object
    >
        <template v-slot:selection="selection">
            <v-card
                :color="$vuetify.theme.dark ? 'grey darken-3' : 'teal accent-2'"
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
                        <v-icon small color="yellow darken-3" @click="deleteChip(selection.item)">{{
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
        <!-- <template v-slot:append-outer>
            <v-slide-x-reverse-transition mode="out-in">
                <v-icon
                    :key="`icon-${isEditing}`"
                    :color="isEditing ? 'success' : 'info'"
                    @click="isEditing = !isEditing"
                    v-text="isEditing ? 'mdi-check-outline' : 'mdi-circle-edit-outline'"
                ></v-icon>
            </v-slide-x-reverse-transition>
        </template> -->
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
        isXs() {
            return this.$vuetify.breakpoint.name === "xs";
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
                this.query = await csv2jsonAsync(this.$route.query?.q);
            }
        },
        // eslint-disable-next-line func-names
        search: debounce(function (val) {
            if (!val) return;
            const formatted = val.replace("#", "").toLowerCase();
            this.getAutocomplete(formatted)
                .then((res) => {
                    // todo maybe remove seen ones
                    this.fromApi = [
                        { type: "title & desc", value: `${val}title & desc`, text: val },
                        { type: "none", disabled: true, divider: true, value: "div", text: "div" },
                        { type: "comments", value: `${val}comments`, text: val },
                        { type: "none", disabled: true, divider: true, value: "div", text: "div" },
                        ...res.data.map((x) => {
                            if (!x.text) x.text = x.value;
                            // x.value = x.text + x.type;
                            return x;
                        }),
                    ];
                })
                .catch((e) => console.log(e));
            // .finally(() => alert(this.fromApi.map(item => item.text)));
        }, 200),
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
            if (!this.query) return;

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
    },
};
</script>

<style>
.search-bar {
    max-width: 670px;
}
.search-bar-small {
    max-width: 90vw !important;
}
.search-bar .selected-card {
    margin: 3px;
    max-width: 100%;
    min-width: 80px;
}

.search-bar.v-input > .v-input__control {
    height: auto !important;
    min-height: 47px !important;
}

.search-bar input {
    padding-left: 10px !important;
}

.search-bar.v-input--dense > .v-input__append-outer {
    background-color: #424242;
    min-width: 48px;
    min-height: 47px !important;
    height: 100%;
    margin: 0 !important;
    align-items: center;
    border-radius: inherit;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
}

.search-bar.v-input--dense > .v-input__append-outer {
    min-width: 38px;
    /* min-height: 38px; */
    margin: 0 !important;
}

.search-bar .selected-card-type {
    position: absolute;
    top: 0px;
    left: 0px;
    background-color: rgba(100, 100, 100, 0.3);
}

.search-bar.v-input > .v-input__control {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
}

.search-bar.v-input .v-input__slot {
    padding-left: 1px !important;
    padding-top: 1px !important;
}

.search-bar > .v-input__append-outer > .v-input__icon > .v-icon {
    color: gray !important;
}

.search-bar > .v-input__append-outer > .v-input__icon > .v-icon.primary--text {
    color: white !important;
}

.search-bar.theme--light > .v-input__append-outer {
    background-color: #eee;
}

.search-bar .search-item {
    /* max-width: 30vw; */
}
/* .search-bar.theme--light > .v-input__append-outer > .v-input__icon > .v-icon {
    color: black !important;
} */
</style>
