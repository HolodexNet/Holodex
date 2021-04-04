<template>
    <!-- https://dev.vuetifyjs.com/en/api/v-autocomplete/#props -->
    <v-autocomplete
        class="ma-auto song-lookup"
        solo
        filled
        disable-lookup
        hide-no-data
        auto-select-first
        clearable
        :autofocus="autofocus"
        v-model="query"
        :loading="isLoading"
        :items="results"
        :item-value="(x) => x.trackId"
        :search-input.sync="search"
        @input="onInput"
        :label="$t('editor.music.itunesLookupPlaceholder')"
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
                        🎵 {{ x.item.trackName }} [{{ formatDuration(x.item.trackTimeMillis) }}]
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
                        🎵 {{ x.item.trackName }} [{{ formatDuration(x.item.trackTimeMillis) }}]
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
import { debounce } from "@/utils/functions";
// TODO(jprochazk): type declarations for this module
import jsonp from "jsonp-es6";
import { formatDuration } from "@/utils/time";
// TODO(jprochazk): type declarations for this module
import { compareTwoStrings } from "string-similarity";

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
        autofocus: {
            type: Boolean,
            default: false,
        },
        value: {
            type: Object,
            default: null,
        },
        id: {
            type: Number,
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
    },
    watch: {
        // eslint-disable-next-line func-names
        search: debounce(function (val) {
            if (!val) return;
            this.fromApi = [];
            const entropy = encodeURIComponent(val).length;
            if (entropy <= 2) return;
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
            const res = await this.searchAutocomplete(query, "ja_jp");
            const resEn = await this.searchAutocomplete(query, "en_us");
            const lookupEn = resEn.results || [];
            console.log(lookupEn);
            const fnLookupFn = (id, name) => {
                const foundEn = lookupEn.find((x) => x.trackId === id);
                if (foundEn && foundEn.trackName !== name && compareTwoStrings(foundEn.trackName, name) < 0.2) {
                    return `${name} / ${foundEn.trackName}`;
                }
                return name;
            };
            if (res && res.results) {
                console.log(res.results);
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
                        trackName: fnLookupFn(trackId, trackName),
                        artworkUrl100,
                        trackViewUrl,
                    }),
                );
            }
            this.isLoading = false;
            return res;
        },
        async searchAutocomplete(query, lang = "ja_jp") {
            return jsonp("https://itunes.apple.com/search", {
                term: query,
                entity: "musicTrack",
                country: "JP",
                limit: 10,
                lang,
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
