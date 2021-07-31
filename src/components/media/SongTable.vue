<template>
    <v-data-table
        id="songSearchTable"
        :headers="RECENT_HEADER"
        :items="songs"
        :item-class="() => 'selectable'"
        item-key="id"
        class="elevation-1 recent-table"
        :class="{ 'recent-table-small': $vuetify.breakpoint.smAndDown }"
        :search="search"
        hide-default-footer
        :items-per-page="perPageItems"
        disable-sort
        :loading="loading"
        :dense="$vuetify.breakpoint.smAndDown"
        @click:row="
            (item) => {
                $store.commit('music/addSong', item);
            }
        "
    >
        <template v-if="$vuetify.breakpoint.smAndDown" #item="{ item }">
            <tr>
                <td :key="item.name + item.video_id + 'cell'" colspan="5">
                    <song-item
                        :song="item"
                        :class="{
                            active: item.name === currentSong.song.name && item.video_id === currentSong.song.video_id,
                        }"
                        :hover-icon="icons.mdiPlay"
                        class="mx-0 px-0"
                        @play="$store.dispatch('music/skipToSong', item)"
                    />
                </td>
            </tr>
        </template>
        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template v-if="!$vuetify.breakpoint.smAndDown" #item.channel_id="{ item }">
            <v-btn small class="hoverable" icon outlined @click.stop="() => $store.dispatch('music/skipToSong', item)">
                <v-icon>{{ icons.mdiPlay }}</v-icon>
            </v-btn>
        </template>
        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template v-if="!$vuetify.breakpoint.smAndDown" #item.channel.name="{ item, value }">
            <span>{{ item.channel[nameProperty] || value }}</span>
            <v-btn
                v-if="channelLink"
                class="popup"
                icon
                target="_blank"
                :to="`/channel/${item.channel_id}/music`"
                @click.stop
            >
                <v-icon small>
                    {{ icons.mdiLoginVariant }}
                </v-icon>
            </v-btn>
        </template>
        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template v-if="!$vuetify.breakpoint.smAndDown" #item.start="{ item }">
            <span>{{ formatDuration(item.end * 1000 - item.start * 1000) }}</span>
        </template>
        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template v-if="!$vuetify.breakpoint.smAndDown" #item.available_at="{ item }">
            <span v-if="$vuetify.breakpoint.xs || $vuetify.breakpoint.mdAndUp" class="blue-grey--text">{{
                formatDate(item.available_at)
            }}</span>
            <v-btn
                class="popup"
                icon
                small
                target="_blank"
                :href="`/watch/${item.video_id}?t=${item.start}`"
                @click.stop
            >
                <v-icon small>
                    {{ icons.mdiLoginVariant }}
                </v-icon>
            </v-btn>
            <v-btn class="popup" small icon target="_blank" :href="`/edit/video/${item.video_id}/music`" @click.stop>
                <v-icon small>
                    {{ icons.mdiPencil }}
                </v-icon>
            </v-btn>
        </template>
    </v-data-table>
</template>

<script lang="ts">
import { formatDistance, formatDuration, localizedDayjs } from "@/utils/time";
import { mapState, mapGetters } from "vuex";
import SongItem from "./SongItem.vue";

export default {
    name: "ChannelMusic",
    components: { SongItem },
    props: {
        search: {
            type: String,
            default: null,
            required: false,
        },
        perPageItems: {
            type: Number,
            default: 20,
            required: false,
        },
        songs: {
            type: Array,
            required: true,
        },
        channelLink: {
            type: Boolean,
            default: false,
            required: false,
        },
        loading: {
            type: Boolean,
            default: false,
            required: false,
        },
    },
    data() {
        return {};
    },
    computed: {
        RECENT_HEADER() {
            // const breakpoint = $vuetify.breakpoint.name

            const datewidth = this.$vuetify.breakpoint.xlAndUp ? "190px" : "180px";
            if (this.$vuetify.breakpoint.smAndDown) {
                return [
                    {
                        text: "",
                        value: "channel_id",
                        width: "20px",
                    },
                    { text: this.$t("editor.music.trackNameInput"), sortable: false },
                    {
                        text: this.$t("component.songList.songDuration"),
                        value: "start",
                        width: "100px",
                        align: "end",
                    },
                ];
            }
            return [
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
                { text: this.$t("component.songList.songCoveredBy"), width: "25%", value: "channel.name" },
                ...(this.$vuetify.breakpoint.mdAndUp
                    ? [{ text: this.$t("editor.music.originalArtistInput"), width: "20%", value: "original_artist" }]
                    : []),
                {
                    text: this.$t("component.songList.songDuration"),
                    value: "start",
                    width: "100px",
                    align: "end",
                },
                {
                    text: this.$t("component.songList.sangOnTime"),
                    value: "available_at",
                    align: "end",
                    width: this.$vuetify.breakpoint.mdAndUp ? datewidth : "90px",
                },
            ];
        },
        ...mapState("settings", ["nameProperty"]),
        ...mapGetters("music", ["currentSong"]),
    },
    methods: {
        formatDistance,
        formatDuration,
        formatDate(dt) {
            return localizedDayjs(dt, this.$store.state.settings.lang).format("l");
        },
    },
};
</script>

<style>
.recent-table.theme--dark {
    background: #1e1e1eeb;
}

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
    color: var(--v-secondary-base);
    border-color: var(--v-secondary-base);
    background-color: rgba(134, 134, 134, 0.3);
}

.recent-table .clamp-2 {
    -webkit-line-clamp: 2;
    display: -webkit-box;
    -webkit-box-orient: horizontal;
    overflow: hidden;
}

.recent-table-small .active {
    border-left: 40px solid var(--v-primary-darken2);
    margin-left: -40px !important;
}
</style>
