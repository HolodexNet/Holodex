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
                :windowSize="BREAKPOINTS[$vuetify.breakpoint.name]"
                :itemWidth="220"
                :itemCount="popularSongs.length"
                v-if="popularSongs.length"
            >
                <template v-for="(song, idx) in popularSongs">
                    <song-item-card
                        style="width: 200px; margin: 10px"
                        :song="song"
                        @play="$store.commit('music/addSong', song)"
                        @playNow="skipToSong"
                        showTime
                        :hoverIcon="icons.mdiPlaylistPlus"
                        :artworkHoverIcon="icons.mdiPlay"
                        :key="'clist2' + idx"
                    ></song-item-card>
                </template>
                <v-icon disabled v-if="popularSongs.length === 0">{{ icons.mdiDatabaseOff }}</v-icon>
            </carousel>
        </v-col>
        <v-col sm="12" md="12">
            <generic-list-loader
                paginate
                :key="'ldr' + channel.id + '+' + committedSearch"
                :perPage="PER_PAGE_ITEMS"
                :loadFn="getSongLoader()"
                v-slot="{ data, isLoading }"
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

                    <v-spacer></v-spacer>

                    <v-text-field
                        v-model="search"
                        :append-icon="icons.mdiMagnify"
                        :label="$t('component.search.searchLabel')"
                        ref="searchbox"
                        single-line
                        hide-details
                        @submit="doSearch(search)"
                        @click:append="doSearch(search)"
                        @keydown.enter="doSearch(search)"
                    ></v-text-field>
                </v-card-title>

                <v-row>
                    <v-col>
                        <song-table :PER_PAGE_ITEMS="PER_PAGE_ITEMS" :loading="isLoading" :songs="data"></song-table>
                    </v-col>
                </v-row>
            </generic-list-loader>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import backendApi from "@/utils/backend-api";
import SongItemCard from "@/components/media/SongItemCard.vue";
import SongItem from "@/components/media/SongItem.vue";
import Carousel from "@/components/common/Carousel.vue";
import PaginateLoad from "@/components/common/PaginateLoad.vue";
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
    components: { SongItem, SongItemCard, Carousel, PaginateLoad, SongTable, GenericListLoader },
    name: "ChannelMusic",
    data() {
        return {
            popularSongs: [],

            BREAKPOINTS,
            PER_PAGE_ITEMS,

            search: "",
            committedSearch: "",
        };
    },
    mounted() {
        // this.songsByRecent();
        this.songsByPopular();
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
