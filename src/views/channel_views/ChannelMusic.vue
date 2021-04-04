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
            <v-card-title>
                <span class="text-h5 mr-3">{{ $t("component.channelMusic.recentSongsHeader") }}</span>
                <v-btn
                    fab
                    color="primary"
                    @click="
                        $store.commit('music/addSong', recentSongs);
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

            <song-table :PER_PAGE_ITEMS="PER_PAGE_ITEMS" :search="search" :songs="recentSongs"></song-table>
            <v-row>
                <v-spacer></v-spacer>
                <PaginateLoad
                    @paginate="songsByRecent"
                    pageLess
                    :identifier="channel.id + search + 'songs'"
                    scrollElementId="songSearchTable"
                />
                <v-spacer></v-spacer>
            </v-row>
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
import { debounce } from "@/utils/functions";
import SongTable from "@/components/media/SongTable.vue";

const BREAKPOINTS = Object.freeze({
    xs: 1,
    sm: 2,
    md: 4,
    lg: 4,
    xl: 7,
});
const PER_PAGE_ITEMS = 20;

export default {
    components: { SongItem, SongItemCard, Carousel, PaginateLoad, SongTable },
    name: "ChannelMusic",
    data() {
        return {
            recentSongs: [],
            popularSongs: [],

            BREAKPOINTS,
            PER_PAGE_ITEMS,

            search: "",
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
        // eslint-disable-next-line func-names
        songsByRecent: debounce(async function ({ page, loaded, completed, error }) {
            console.log("fetching...", page, this.search);
            try {
                const { data } = await backendApi.songListByCondition(
                    { channel_id: this.channel.id, ...(this.search && { q: this.search }) },
                    (page - 1) * PER_PAGE_ITEMS,
                    PER_PAGE_ITEMS,
                );
                if (data.length < PER_PAGE_ITEMS) {
                    completed && completed();
                } else {
                    loaded && loaded();
                }
                this.recentSongs = data.map((x) => ({
                    ...x,
                    id: x.video_id + x.name,
                }));
            } catch (e) {
                error();
            }
        }, 100),
        async songsByPopular() {
            const { data } = await backendApi.topSongs(null, this.channel.id, "w");
            this.popularSongs = data;
        },
        skipToSong(song) {
            this.$store.dispatch("music/skipToSong", song);
        },
    },
};
</script>

<style>
.popup.v-btn:hover {
    margin-bottom: 2px;
    margin-top: -2px;
    color: rgb(167, 50, 106);
}
</style>
