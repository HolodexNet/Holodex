<template>
  <v-container class="org-music-container">
    <v-row>
      <v-col
        v-if="!isAllVTubers"
        cols="12"
        class="my-0 pa-0"
        style="min-height: 404px"
      >
        <v-card-title>
          <span class="text-lg-h5 mr-2">
            {{ $t("component.music.trendingForOrg", [currentOrg.name]) }}
          </span>
          <v-btn
            fab
            color="primary"
            @click="
              $store.commit('music/addSong', hotSongs);
              $store.commit('music/openBar');
            "
          >
            <v-icon> {{ icons.mdiPlaylistPlus }} </v-icon>
          </v-btn>
        </v-card-title>
        <carousel
          v-if="hotSongs.length"
          :window-size="BREAKPOINTS[$vuetify.breakpoint.name]"
          :item-width="220"
          :item-count="hotSongs.length"
        >
          <template v-for="(song, idx) in hotSongs">
            <song-item-card
              :key="'clist4' + idx"
              style="width: 200px; margin: 10px"
              :song="song"
              show-time
              show-artist
              :hover-icon="icons.mdiPlaylistMusic"
              :artwork-hover-icon="icons.mdiPlay"
              @play="$store.commit('music/addSong', song)"
              @playNow="skipToSong"
              @channel="$router.push({ path: `/channel/${song.channel_id}` })"
            />
          </template>
          <v-icon v-if="hotSongs.length === 0" disabled>
            {{ icons.mdiDatabaseOff }}
          </v-icon>
        </carousel>
      </v-col>
      <v-col cols="12" class="my-0 py-0">
        <generic-list-loader
          :key="'ldr' + currentOrg.name + '+' + committedSearch"
          v-slot="{ data, isLoading }"
          paginate
          :per-page="PER_PAGE_ITEMS"
          :load-fn="getSongLoader()"
        >
          <v-card-title>
            <span class="text-lg-h5 mr-2">{{ $t("component.channelMusic.recentSongsHeader") }}</span>
            <v-btn
              fab
              color="primary"
              @click="
                $store.commit('music/addSong', data);
                $store.commit('music/openBar');
              "
            >
              <v-icon> {{ icons.mdiPlaylistPlus }} </v-icon>
            </v-btn>

            <v-spacer />

            <v-text-field
              ref="searchbox"
              v-model="search"
              :append-icon="icons.mdiMagnify"
              :label="$t('component.search.searchLabel')"
              single-line
              hide-details
              @submit="doSearch(search)"
              @click:append="doSearch(search)"
              @keydown.enter="doSearch(search)"
            />
          </v-card-title>
          <v-row>
            <v-col>
              <song-table
                :per-page-items="PER_PAGE_ITEMS"
                channel-link
                :loading="isLoading"
                :songs="data"
              />
            </v-col>
          </v-row>
        </generic-list-loader>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import backendApi from "@/utils/backend-api";
import SongItemCard from "@/components/media/SongItemCard.vue";
import Carousel from "@/components/common/Carousel.vue";
import { mapState } from "vuex";
import SongTable from "@/components/media/SongTable.vue";
import GenericListLoader from "@/components/video/GenericListLoader.vue";

const BREAKPOINTS = Object.freeze({
    xs: 1,
    sm: 2,
    md: 4,
    lg: 4,
    xl: 7,
});
const PER_PAGE_ITEMS = 20;

export default {
    name: "OrgMusic",
    components: {
        SongItemCard,
        Carousel,
        SongTable,
        GenericListLoader,
    },
    metaInfo() {
        const vm = this;
        return {
            get title() {
                return `${vm.$t("component.mainNav.music")} - Holodex`;
            },
        };
    },
    data() {
        return {
            hotSongs: [],

            BREAKPOINTS,
            PER_PAGE_ITEMS,

            search: "",
            committedSearch: "",
        };
    },
    computed: {
        ...mapState(["currentOrg"]),
        isAllVTubers() {
            return this.currentOrg.name === "All Vtubers";
        },
    },
    watch: {
        currentOrg() {
            this.songsByPopular();
        },
    },
    created() {
        this.songsByPopular();
    },
    methods: {
        async songsByPopular() {
            const res2 = backendApi.hot(this.currentOrg.name, null);

            this.hotSongs = (await res2).data;
        },
        skipToSong(song) {
            console.log(song);
            console.log("skipping: ", this.$store.state.music.playlist.length - 1);
            this.$store.commit("music/addSong", song);
            this.$store.commit("music/openBar");
            this.$store.commit("music/skipTo", this.$store.state.music.playlist.length - 1);
        },
        getSongLoader() {
            // eslint-disable-next-line func-names
            return async (offset, limit) => {
                const res = await backendApi.songListByCondition(
                    {
                        ...(!this.isAllVTubers && { org: this.currentOrg.name }),
                        paginated: 1,
                        ...(this.committedSearch && { q: this.committedSearch }),
                    },
                    offset,
                    limit,
                );
                res.data.items = res.data.items.map((x) => ({
                    ...x,
                    id: x.video_id + x.name,
                }));
                return res.data;
            };
        },
        doSearch(newVal) {
            this.committedSearch = newVal.trim();
            this.$router.push({
                query: {
                    ...this.$route.query,
                    page: undefined,
                },
            });
            // eslint-disable-next-line func-names
            this.$nextTick(function () {
                this.$refs.searchbox.focus();
            });
        },
    },
};
</script>

<style lang="scss">
/* .recent-table .selectable {
    cursor: pointer;
}
.recent-table.theme--dark .selectable .hoverable.v-btn {
    color: rgb(182, 182, 182);
    border-color: rgb(194, 194, 194);
}
.recent-table.theme--light .selectable .hoverable.v-btn {
    color: rgb(87, 87, 87);
    border-color: rgb(59, 59, 59);
}

.recent-table .selectable .hoverable.v-btn:hover {
    color: var(--v-secondary-base);
    border-color: var(--v-secondary-base);
    background-color: rgba(134, 134, 134, 0.3);
} */

.popup.v-btn:hover {
    margin-bottom: 2px;
    margin-top: -2px;
    color: var(--v-secondary-lighten1);
}

.bump-bottom .org-music-container {
    /* to allow floating song frame to sit top right space */
    padding-top: 140px;

    @media screen and (max-width: 768px) {
        padding-top: inherit;
    }
}
</style>
