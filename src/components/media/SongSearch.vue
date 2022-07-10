<template>
  <!-- https://dev.vuetifyjs.com/en/api/v-autocomplete/#props -->
  <v-autocomplete
    v-model="query"
    class="ma-auto song-lookup"
    solo
    filled
    disable-lookup
    hide-no-data
    auto-select-first
    clearable
    :autofocus="autofocus"
    :loading="isLoading"
    :items="results"
    :item-value="(x) => x.trackId"
    :search-input.sync="search"
    :label="$t('editor.music.itunesLookupPlaceholder')"
    :filter="(a, b) => true"
    return-object
    hide-details
    @input="onInput"
    @keydown.enter="onEnterKeyDown"
  >
    <template #selection="x">
      <div class="ma-n1 py-0 pl-3 pr-1 d-flex" style="width: 100%">
        <!-- @click="addItem(dropdownItem.item) -->
        <v-list-item-avatar tile>
          <v-img :src="x.item.artworkUrl100" />
        </v-list-item-avatar>

        <v-list-item-content class="py-1 pt-1">
          <v-list-item-subtitle class="text--primary">
            🎵 {{ x.item.trackName }} [{{ formatDuration(x.item.trackTimeMillis) }}]
          </v-list-item-subtitle>
          <v-list-item-subtitle class="text--caption">
            🎤 {{ x.item.artistName }} / {{ x.item.collectionName }} {{ x.item.releaseDate ? ' / '+x.item.releaseDate.slice(0, 7) : '' }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </div>
    </template>

    <template #item="x">
      <div class="ma-n1 py-0 pl-3 pr-1 d-flex">
        <!-- @click="addItem(dropdownItem.item) -->
        <v-list-item-avatar tile>
          <v-img :src="x.item.artworkUrl100" />
        </v-list-item-avatar>

        <v-list-item-content class="py-1 pt-1">
          <v-list-item-subtitle class="text--primary">
            🎵 {{ x.item.trackName }} [{{ formatDuration(x.item.trackTimeMillis) }}]
          </v-list-item-subtitle>
          <v-list-item-subtitle class="text--caption">
            🎤 {{ x.item.artistName }} {{ x.item.collectionName && (' / ' + x.item.collectionName) }} {{ x.item.releaseDate ? ' / '+x.item.releaseDate.slice(0, 7) : "" }}
            <v-chip
              x-small
              outlined
              label
              class="ml-1 px-1"
              style="opacity:0.5"
            >
              {{ x.item.src }}
            </v-chip>
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
import debounce from "lodash-es/debounce";
// TODO(jprochazk): type declarations for this module
import jsonp from "jsonp-es6";
import { formatDuration } from "@/utils/time";
// TODO(jprochazk): type declarations for this module
import { compareTwoStrings } from "string-similarity";
import { axiosInstance } from "@/utils/backend-api";

export default {
    name: "SongSearch",
    components: {},
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
    data() {
        return {
            query: this.value,
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
            const [md, res, resEn] = await Promise.all([this.searchMusicdex(query), this.searchAutocomplete(query, "ja_jp"), this.searchAutocomplete(query, "en_us")]);
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
                this.fromApi = [...md.slice(3), ...res.results.map(
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
                        src: "iTunes",
                    }),
                )];
            }
            this.isLoading = false;
            // console.log(res);
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
        async searchMusicdex(query) {
            try {
                const resp = await axiosInstance({ url: "https://staging.holodex.net/api/v2/musicdex/search", method: "POST", data: { q: query } });
                return resp?.data?.hits?.map(({ document }) => ({
                    trackId: document.itunesid,
                    artistName: document.original_artist,
                    trackName: document.name,
                    trackTimeMillis: (document.end - document.start) * 1000,
                    trackViewUrl: document.amUrl,
                    artworkUrl100: document.art,
                    src: "Musicdex",
                })) || [];
            } catch (e) {
                console.error(e);
                return [];
            }
        },

        onInput() {
            this.search = null;
            this.fromApi = [];
        },
    },
};
</script>

<style></style>