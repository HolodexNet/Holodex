<template>
    <v-container>
        <v-row>
            <v-col cols="12 mb-0 pb-0">
                <v-card-title>
                    <span class="text-h5">Monthly Top Plays for {{ currentOrg }}</span>
                </v-card-title>
                <carousel
                    :windowSize="BREAKPOINTS[$vuetify.breakpoint.name]"
                    :itemWidth="220"
                    :itemCount="popularMonthlySongs.length"
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
                </carousel>
            </v-col>
            <v-col cols="12" class="my-0 py-0">
                <v-card-title>
                    <span class="text-h5">Weekly Top Plays for {{ currentOrg }}</span>
                </v-card-title>
                <carousel
                    :windowSize="BREAKPOINTS[$vuetify.breakpoint.name]"
                    :itemWidth="220"
                    :itemCount="popularWeeklySongs.length"
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
                </carousel>
            </v-col>
            <v-col cols="12" class="my-0 py-0">
                <v-card-title>
                    <span class="text-h5">Recent Songs</span>
                    <v-spacer></v-spacer>
                    <v-text-field
                        v-model="search"
                        :append-icon="icons.mdiMagnify"
                        label="Search"
                        single-line
                        hide-details
                    ></v-text-field>
                </v-card-title>
                <v-data-table
                    :headers="RECENT_HEADER"
                    :items="recentSongs"
                    :item-class="() => 'selectable'"
                    item-key=""
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
                        <v-btn class="popup" icon target="_blank" :href="`/channel/${item.channel_id}/music`">
                            <v-icon small>{{ icons.mdiLoginVariant }}</v-icon>
                        </v-btn>
                    </template>

                    <!-- eslint-disable-next-line vue/valid-v-slot -->
                    <template v-slot:item.start="{ item }">
                        <span>{{ formatDuration(item.end * 1000 - item.start * 1000) }}</span>
                    </template>
                    <!-- eslint-disable-next-line vue/valid-v-slot -->
                    <template v-slot:item.available_at="{ item }">
                        <span class="blue-grey--text">{{ formatDate(item.available_at) }}</span>
                        <v-btn
                            class="popup"
                            small
                            icon
                            target="_blank"
                            :href="`/watch/${item.video_id}?t=${item.start}`"
                        >
                            <v-icon small>{{ icons.mdiLoginVariant }}</v-icon>
                        </v-btn>
                        <v-btn class="popup" small icon target="_blank" :href="`/edit/video/${item.video_id}`">
                            <v-icon small>{{ icons.mdiPencil }}</v-icon>
                        </v-btn>
                    </template>
                </v-data-table>
                <v-row>
                    <v-spacer></v-spacer>
                    <paginate-load @paginate="songsByRecent" pageLess :identifier="currentOrg" />
                    <v-spacer></v-spacer>
                </v-row>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import backendApi from "@/utils/backend-api";
import SongItemCard from "@/components/media/SongItemCard";
import SongItem from "@/components/media/SongItem";
import Carousel from "@/components/common/Carousel";
import PaginateLoad from "@/components/common/PaginateLoad";
import { formatDistance, formatDuration } from "@/utils/time";
import { mapState } from "vuex";

const BREAKPOINTS = Object.freeze({
    xs: 1,
    sm: 2,
    md: 4,
    lg: 4,
    xl: 7,
});
const PER_PAGE_ITEMS = 20;
const RECENT_HEADER = [
    {
        text: "",
        value: "channel_id",
        width: "20px",
    },
    {
        text: "Title",
        align: "start",
        sortable: false,
        value: "name",
        cellClass: "text-subtitle-2",
    },
    { text: "Covered by", value: "channel.name" },
    { text: "Original Artist", value: "original_artist" },
    { text: "Duration", value: "start", align: "end" },
    { text: "Sang on", value: "available_at", align: "end" },
];

export default {
    components: { SongItem, SongItemCard, Carousel, PaginateLoad },
    name: "OrgMusic",
    data() {
        return {
            // recentOffset: 0,
            // recentLimit: 20,
            recentSongs: [],
            RECENT_HEADER,
            // popularOffset: 0,
            // popularLimit: 20,
            popularMonthlySongs: [],
            popularWeeklySongs: [],

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
        ...mapState(["currentOrg"]),
        ...mapState("settings", ["nameProperty"]),
    },
    watch: {
        currentOrg() {
            this.songsByPopular();
        },
    },
    methods: {
        async songsByRecent({ page, loaded, completed, error }) {
            console.log("fetching...", page);
            try {
                const { data } = await backendApi.songListByCondition(
                    { org: this.currentOrg },
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
        },
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
