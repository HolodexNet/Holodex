<template>
    <v-row>
        <v-col cols="12" style="min-height: 404px">
            <v-card-title>
                <span class="text-h5 mr-3">{{ $t("component.channelMusic.weeklyTopPlaysHeader") }}</span>
                <v-btn
                    fab
                    color="primary"
                    @click="
                        $store.commit('music/addSong', popularSongs);
                        $store.commit('music/openBar');
                    "
                >
                    <v-icon> {{ icons.mdiPlaylistPlus }} </v-icon>
                </v-btn>
            </v-card-title>
            <carousel
                v-if="popularSongs.length"
                :window-size="BREAKPOINTS[$vuetify.breakpoint.name]"
                :item-width="220"
                :item-count="popularSongs.length"
            >
                <template v-for="(song, idx) in popularSongs">
                    <song-item-card
                        :key="'clist2' + idx"
                        style="width: 200px; margin: 10px"
                        :song="song"
                        show-time
                        :hover-icon="icons.mdiPlaylistPlus"
                        :artwork-hover-icon="icons.mdiPlay"
                        @play="$store.commit('music/addSong', song)"
                        @playNow="skipToSong"
                    />
                </template>
                <v-icon v-if="popularSongs.length === 0" disabled>
                    {{ icons.mdiDatabaseOff }}
                </v-icon>
            </carousel>
        </v-col>
        <v-col sm="12" md="12">
            <generic-list-loader
                :key="'ldr' + channel.id + '+' + committedSearch"
                v-slot="{ data, isLoading }"
                paginate
                :per-page="PER_PAGE_ITEMS"
                :load-fn="getSongLoader()"
            >
                <v-card-title>
                    <span class="text-h5 mr-3">{{ $t("component.channelMusic.recentSongsHeader") }}</span>
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
                        <song-table :per-page-items="PER_PAGE_ITEMS" :loading="isLoading" :songs="data" />
                    </v-col>
                </v-row>
            </generic-list-loader>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import backendApi from "@/utils/backend-api";
import SongItemCard from "@/components/media/SongItemCard.vue";
import Carousel from "@/components/common/Carousel.vue";
// import { mapState } from "vuex";
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
    name: "ChannelMusic",
    components: {
        SongItemCard,
        Carousel,
        SongTable,
        GenericListLoader,
    },
    data() {
        return {
            popularSongs: [],

            BREAKPOINTS,
            PER_PAGE_ITEMS,

            search: "",
            committedSearch: "",
        };
    },
    computed: {
        channel() {
            return this.$store.state.channel.channel;
        },
    },
    watch: {
        channel() {
            this.songsByPopular();
        },
    },
    created() {
        // this.songsByRecent();
        this.songsByPopular();
    },
    methods: {
        async songsByPopular() {
            const { data } = await backendApi.topSongs(null, this.channel.id, "w");
            this.popularSongs = data;
        },
        skipToSong(song) {
            this.$store.dispatch("music/skipToSong", song);
        },
        getSongLoader() {
            // eslint-disable-next-line func-names
            return async (offset, limit) => {
                const res = await backendApi.songListByCondition(
                    {
                        channel_id: this.channel.id,
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

<style>
.popup.v-btn:hover {
    margin-bottom: 2px;
    margin-top: -2px;
    color: var(--v-secondary-lighten1);
}
</style>
