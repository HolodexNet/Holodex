<template>
    <v-container>
        <v-row>
            <v-col cols="12" class="mb-0 pa-0" style="min-height: 404px">
                <v-card-title>
                    <span class="text-lg-h5 mr-2">{{ $t("component.orgMusic.monthlyTopForOrg", [currentOrg]) }}</span>
                    <v-btn
                        fab
                        color="primary"
                        @click="
                            $store.commit('music/addSong', popularMonthlySongs);
                            $store.commit('music/openBar');
                        "
                    >
                        <v-icon> {{ icons.mdiPlaylistPlus }} </v-icon>
                    </v-btn>
                </v-card-title>
                <carousel
                    :windowSize="BREAKPOINTS[$vuetify.breakpoint.name]"
                    :itemWidth="220"
                    :itemCount="popularMonthlySongs.length"
                    v-if="popularMonthlySongs.length"
                >
                    <template v-for="(song, idx) in popularMonthlySongs">
                        <song-item-card
                            style="width: 200px; margin: 10px"
                            :song="song"
                            @play="$store.commit('music/addSong', song)"
                            @playNow="skipToSong"
                            showTime
                            showArtist
                            @channel="$router.push({ path: `/channel/${song.channel_id}` })"
                            :hoverIcon="icons.mdiPlaylistMusic"
                            :artworkHoverIcon="icons.mdiPlay"
                            :key="'clist3' + idx"
                        ></song-item-card>
                    </template>
                    <v-icon disabled v-if="popularMonthlySongs.length === 0">{{ icons.mdiDatabaseOff }}</v-icon>
                </carousel>
            </v-col>
            <v-col cols="12" class="my-0 pa-0" style="min-height: 404px">
                <v-card-title>
                    <span class="text-lg-h5 mr-2">{{ $t("component.orgMusic.weeklyTopForOrg", [currentOrg]) }}</span>
                    <v-btn
                        fab
                        color="primary"
                        @click="
                            $store.commit('music/addSong', popularWeeklySongs);
                            $store.commit('music/openBar');
                        "
                    >
                        <v-icon> {{ icons.mdiPlaylistPlus }} </v-icon>
                    </v-btn>
                </v-card-title>
                <carousel
                    :windowSize="BREAKPOINTS[$vuetify.breakpoint.name]"
                    :itemWidth="220"
                    :itemCount="popularWeeklySongs.length"
                    v-if="popularWeeklySongs.length"
                >
                    <template v-for="(song, idx) in popularWeeklySongs">
                        <song-item-card
                            style="width: 200px; margin: 10px"
                            :song="song"
                            @play="$store.commit('music/addSong', song)"
                            @playNow="skipToSong"
                            showTime
                            showArtist
                            @channel="$router.push({ path: `/channel/${song.channel_id}` })"
                            :hoverIcon="icons.mdiPlaylistMusic"
                            :artworkHoverIcon="icons.mdiPlay"
                            :key="'clist4' + idx"
                        ></song-item-card>
                    </template>
                    <v-icon disabled v-if="popularWeeklySongs.length === 0">{{ icons.mdiDatabaseOff }}</v-icon>
                </carousel>
            </v-col>
            <v-col cols="12" class="my-0 py-0">
                <generic-list-loader
                    paginate
                    :key="'ldr' + currentOrg + '+' + debounceSearch"
                    :perPage="PER_PAGE_ITEMS"
                    :loadFn="getSongLoader()"
                    v-slot="{ data, isLoading }"
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

                        <v-spacer></v-spacer>

                        <v-text-field
                            v-model="search"
                            :append-icon="icons.mdiMagnify"
                            :label="$t('component.search.searchLabel')"
                            single-line
                            hide-details
                        ></v-text-field>
                    </v-card-title>
                    <v-row>
                        <v-col>
                            <song-table
                                :PER_PAGE_ITEMS="PER_PAGE_ITEMS"
                                :search="search"
                                channelLink
                                :loading="isLoading"
                                :songs="data"
                            ></song-table>
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
import SongItem from "@/components/media/SongItem.vue";
import Carousel from "@/components/common/Carousel.vue";
import PaginateLoad from "@/components/common/PaginateLoad.vue";
import { mapState } from "vuex";
import { debounce } from "@/utils/functions";
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
    name: "OrgMusic",
    data() {
        return {
            popularMonthlySongs: [],
            popularWeeklySongs: [],

            BREAKPOINTS,
            PER_PAGE_ITEMS,

            search: "",
            debounceSearch: "",
        };
    },
    mounted() {
        // this.songsByRecent();
        this.songsByPopular();
    },
    computed: {
        ...mapState(["currentOrg"]),
    },
    watch: {
        currentOrg() {
            this.songsByPopular();
        },
        // eslint-disable-next-line func-names
        search: debounce(function (newVal) {
            this.debounceSearch = newVal;
            this.$router.push({
                query: {
                    ...this.$route.query,
                    page: undefined,
                },
            });
        }, 500),
    },
    methods: {
        async songsByPopular() {
            const res1 = backendApi.topSongs(this.currentOrg, null, "m");
            const res2 = backendApi.topSongs(this.currentOrg, null, "w");

            this.popularMonthlySongs = (await res1).data;
            this.popularWeeklySongs = (await res2).data;
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
                        org: this.currentOrg,
                        paginated: 1,
                        ...(this.debounceSearch && { q: this.debounceSearch }),
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
    },
};
</script>

<style>
.recent-table .selectable {
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
    color: rgb(227, 92, 240);
    border-color: rgb(232, 125, 241);
    background-color: rgba(134, 134, 134, 0.3);
}

.popup.v-btn:hover {
    margin-bottom: 2px;
    margin-top: -2px;
    color: rgb(167, 50, 106);
}
</style>
