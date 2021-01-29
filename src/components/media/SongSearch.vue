<template>
    <!-- https://dev.vuetifyjs.com/en/api/v-autocomplete/#props -->
    <!--         :class="{ 'search-bar-small': isMobile }" -->
    <v-autocomplete
        class="ma-auto song-lookup"
        solo
        filled
        disable-lookup
        hide-no-data
        auto-select-first
        clearable
        :autofocus="autofocus"
        :small-chips="dense"
        v-model="query"
        :loading="isLoading"
        :items="results"
        :item-value="(x) => x.trackId"
        :search-input.sync="search"
        @input="onInput"
        label="Lookup on iTunes"
        :filter="(a, b) => true"
        return-object
        @keydown.enter="onEnterKeyDown"
        hide-details
    >
        <template v-slot:selection="x">
            <div class="ma-n1 py-0 pl-3 pr-1 d-flex" style="width: 100%">
                <!-- @click="addItem(dropdownItem.item) -->
                <v-list-item-avatar tile>
                    <v-img :src="x.item.artworkUrl100"></v-img>
                </v-list-item-avatar>

                <v-list-item-content class="py-1 pt-1">
                    <v-list-item-subtitle class="text--primary">
                        🎵 {{ x.item.trackName }} [{{ Math.floor(x.item.trackTimeMillis / 1000 / 60) }}:{{
                            Math.round(x.item.trackTimeMillis / 1000) % 60
                        }}]
                    </v-list-item-subtitle>
                    <v-list-item-subtitle class="text--caption">
                        🎤 {{ x.item.artistName }} / {{ x.item.collectionName }} / {{ x.item.releaseDate.slice(0, 7) }}
                    </v-list-item-subtitle>
                </v-list-item-content>
            </div>
        </template>

        <template v-slot:item="x">
            <div class="ma-n1 py-0 pl-3 pr-1 d-flex">
                <!-- @click="addItem(dropdownItem.item) -->
                <v-list-item-avatar tile>
                    <v-img :src="x.item.artworkUrl100"></v-img>
                </v-list-item-avatar>

                <v-list-item-content class="py-1 pt-1">
                    <v-list-item-subtitle class="text--primary">
                        🎵 {{ x.item.trackName }} [{{ Math.floor(x.item.trackTimeMillis / 1000 / 60) }}:{{
                            Math.round(x.item.trackTimeMillis / 1000) % 60
                        }}]
                    </v-list-item-subtitle>
                    <v-list-item-subtitle class="text--caption">
                        🎤 {{ x.item.artistName }} / {{ x.item.collectionName }} / {{ x.item.releaseDate.slice(0, 7) }}
                    </v-list-item-subtitle>
                </v-list-item-content>
            </div>
        </template>
        <!-- <template v-slot:append-outer>
            <v-icon key="searchbtn" large color="info" @click="commitSearch" v-text="icons.mdiMagnify"></v-icon>
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
import { debounce } from "@/utils/functions";
import jsonp from "jsonp-es6";
import { formatDuration } from "@/utils/time";

export default {
    name: "SongSearch",
    components: {},
    data() {
        return {
            query: this.value,
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
        value: {
            type: Object,
            default: null,
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
        // eslint-disable-next-line func-names
        search: debounce(function (val) {
            if (!val) return;
            this.fromApi = [];
            const entropy = encodeURIComponent(val).length;
            if (entropy <= 2) return;
            // const formatted = val.replace("#", "").toLowerCase();
            // jsonp();
            this.getAutocomplete(val);
        }, 500),
        query() {
            if (this.query) this.$emit("input", this.query);
        },
    },
    methods: {
        formatDuration,
        async getAutocomplete(query) {
            this.isLoading = true;
            const res = await this.searchAutocomplete(query);
            if (res && res.results) {
                this.fromApi = res.results.map(
                    ({
                        trackId,
                        collectionName,
                        releaseDate,
                        artistName,
                        trackName,
                        trackTimeMillis,
                        artworkUrl100,
                        trackViewUrl,
                    }) => ({
                        trackId,
                        trackTimeMillis,
                        collectionName,
                        releaseDate,
                        artistName,
                        trackName,
                        artworkUrl100,
                        trackViewUrl,
                    }),
                );
            }
            this.isLoading = false;
            return res;
        },
        async searchAutocomplete(query) {
            return jsonp("https://itunes.apple.com/search", {
                term: query,
                entity: "musicTrack",
                country: "JP",
                limit: 10,
                lang: "ja_jp",
            });
        },
        onInput() {
            this.search = null;
            this.fromApi = [];
        },
    },
};
</script>

<style></style>
