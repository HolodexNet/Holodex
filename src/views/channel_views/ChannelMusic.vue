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
            <v-data-table
                :headers="RECENT_HEADER"
                :items="recentSongs"
                :item-class="() => 'selectable'"
                item-key="name"
                class="elevation-1 recent-table"
                :search="search"
                hide-default-footer
                :items-per-page="PER_PAGE_ITEMS"
                disable-sort
                @click:row="
                    (item) => {
                        $store.commit('music/addSong', item);
                    }
                "
            >
                <!-- eslint-disable-next-line vue/valid-v-slot -->
                <template v-slot:item.channel_id="{ item }">
                    <v-btn small class="hoverable" icon outlined @click.stop="() => skipToSong(item)">
                        <v-icon>{{ icons.mdiPlay }}</v-icon>
                    </v-btn>
                </template>
                <!-- eslint-disable-next-line vue/valid-v-slot -->
                <template v-slot:item.channel.name="{ item, value }">
                    <span>{{ item.channel[nameProperty] || value }}</span>
                </template>
                <!-- eslint-disable-next-line vue/valid-v-slot -->
                <template v-slot:item.start="{ item }">
                    <span>{{ formatDuration(item.end * 1000 - item.start * 1000) }}</span>
                </template>
                <!-- eslint-disable-next-line vue/valid-v-slot -->
                <template v-slot:item.available_at="{ item }">
                    <span class="blue-grey--text">{{ formatDate(item.available_at) }}</span>
                    <v-btn class="popup" icon small target="_blank" :href="`/watch/${item.video_id}?t=${item.start}`">
                        <v-icon small>{{ icons.mdiLoginVariant }}</v-icon>
                    </v-btn>
                    <v-btn class="popup" small icon target="_blank" :href="`/edit/video/${item.video_id}/music`">
                        <v-icon small>{{ icons.mdiPencil }}</v-icon>
                    </v-btn>
                </template>
            </v-data-table>
            <v-row>
                <v-spacer></v-spacer>
                <paginate-load @paginate="songsByRecent" pageLess :identifier="channel.id + search" />
                <v-spacer></v-spacer>
            </v-row>
        </v-col>
    </v-row>
</template>

<script>
import backendApi from "@/utils/backend-api";
import SongItemCard from "@/components/media/SongItemCard";
import SongItem from "@/components/media/SongItem";
import Carousel from "@/components/common/Carousel";
import PaginateLoad from "@/components/common/PaginateLoad";
import { formatDistance, formatDuration } from "@/utils/time";
import { mapState } from "vuex";
import { debounce } from "@/utils/functions";

const BREAKPOINTS = Object.freeze({
    xs: 1,
    sm: 2,
    md: 4,
    lg: 4,
    xl: 7,
});
const PER_PAGE_ITEMS = 20;

export default {
    components: { SongItem, SongItemCard, Carousel, PaginateLoad },
    name: "ChannelMusic",
    data() {
        return {
            // recentOffset: 0,
            // recentLimit: 20,
            recentSongs: [],
            RECENT_HEADER: Object.freeze([
                {
                    text: "",
                    value: "channel_id",
                    width: "20px",
                },
                {
                    text: this.$t("editor.music.trackNameInput"),
                    align: "start",
                    sortable: false,
                    value: "name",
                    cellClass: "text-subtitle-2",
                },
                { text: this.$t("component.songList.songCoveredBy"), value: "channel.name" },
                { text: this.$t("editor.music.originalArtistInput"), value: "original_artist" },
                { text: this.$t("component.songList.songDuration"), value: "start", align: "end" },
                { text: this.$t("component.songList.sangOnTime"), value: "available_at", align: "end" },
            ]),
            // popularOffset: 0,
            // popularLimit: 20,
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
        ...mapState("settings", ["nameProperty"]),
    },
    watch: {
        channel() {
            this.songsByPopular();
        },
        // recentOffset() {
        //     this.songsByRecent();
        // },
        // popularOffset() {
        //     this.songsByPopular();
        // },
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
                this.recentSongs = data;
            } catch (e) {
                error();
            }
        }, 400),
        async songsByPopular() {
            console.log("tbd");
            const { data } = await backendApi.topSongs(null, this.channel.id, "w");
            this.popularSongs = data;
        },
        skipToSong(song) {
            console.log(song);
            console.log("skipping: ", this.$store.state.music.playlist.length - 1);
            this.$store.commit("music/addSong", song);
            this.$store.commit("music/openBar");
            this.$store.commit("music/skipTo", this.$store.state.music.playlist.length - 1);
        },
        formatDate(dt) {
            return formatDistance(dt, this.$store.state.settings.lang, this.$t.bind(this));
        },
        formatDuration,
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
