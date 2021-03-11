<template>
    <v-hover v-slot="{ hover }">
        <v-card @click.stop="$emit('play', song)" elevation="0" style="max-width: 200px" color="transparent">
            <v-sheet class="song-card-artwork rounded" :elevation="hover ? 6 : 3">
                <!-- actual artwork -->
                <div class="song-card-data mx-1">
                    <!-- <span class="muted" v-if="showTime">{{ formattedTime }}</span> -->
                    {{ Math.floor((song.end - song.start) / 60) }}:{{
                        (Math.round(song.end - song.start) % 60).toString().padStart(2, "0")
                    }}
                </div>

                <v-img
                    v-if="song.art"
                    lazy-src
                    :src="song.art.replace('100x100', '200x200')"
                    width="200px"
                    aspect-ratio="1"
                    class="rounded"
                ></v-img>
                <!-- artwork not available, have a stand-in -->
                <v-sheet v-else width="100%" height="100%" color="grey darken-1" class="d-flex pa-1 rounded">
                    <v-btn x-large icon class="ma-auto" outlined disabled>
                        <v-icon x-large>{{ icons.mdiMusic }}</v-icon>
                    </v-btn>
                </v-sheet>
                <!-- Queue up button or default item click button -->
                <v-sheet
                    v-if="hover"
                    width="100%"
                    height="100%"
                    color="transparent"
                    class="d-flex pa-1 hover-item rounded"
                    style="position: absolute; left: 0px"
                >
                    <v-btn x-small fab class="ma-auto" color="blue lighten-3" elevation="2">
                        <v-icon small>{{ hoverIcon }}</v-icon>
                    </v-btn>
                    <v-btn
                        v-if="$listeners.playNow"
                        x-small
                        fab
                        class="ma-auto"
                        color="blue lighten-3"
                        elevation="2"
                        @click.stop.prevent="$emit('playNow', song)"
                    >
                        <v-icon small>{{ artworkHoverIcon }}</v-icon>
                    </v-btn>
                </v-sheet>
                <!-- Play immediately button over the artwork -->
            </v-sheet>

            <v-list-item three-line class="pa-0">
                <v-list-item-content class="px-1">
                    <v-list-item-title class="limit-width" :title="song.name">
                        {{ song.name }}
                    </v-list-item-title>
                    <v-list-item-subtitle class="text--caption">
                        <span class="song-clickable" v-if="$listeners.channel" @click.stop="$emit('channel', song)">
                            {{ song.channel.name }}
                        </span>
                        <span v-else> {{ song.channel.name }} </span> <br />
                        <span class="primary--text"> / {{ song.original_artist }}</span>
                    </v-list-item-subtitle>
                </v-list-item-content>
            </v-list-item>
        </v-card>
    </v-hover>
</template>

<script>
// const jsonp = require("jsonp-es6");

import { formatDistance } from "@/utils/time";

export default {
    name: "SongItem",
    data() {
        return {
            albumArt: null,
        };
    },
    props: {
        song: {
            type: Object,
            required: true,
        },
        showArtist: {
            type: Boolean,
            default: true,
        },
        showSongArt: {
            type: Boolean,
            default: true,
        },
        verticalList: {
            type: Boolean,
            default: true,
        },
        detailed: {
            type: Boolean,
            default: false,
        },
        alwaysShowDeletion: {
            type: Boolean,
            default: false,
        },
        showTime: {
            type: Boolean,
            default: false,
        },
        hoverIcon: {
            default: null,
        },
        artworkHoverIcon: {
            default: null,
        },
    },
    computed: {
        userCanDelete() {
            const u = this.$store.state.userdata;
            return u && u.user && u.user.role && u.user.role !== "user";
        },
        formattedTime() {
            return formatDistance(this.song.available_at, this.$store.state.settings.lang, this.$t.bind(this));
        },
    },
    mounted() {},
};
</script>

<style scoped>
.song-card-artwork {
    width: 200px;
    height: 200px;
    position: relative;
    display: flex;
}
.song-card-data {
    position: absolute;
    bottom: 0px;
    right: 0px;
    z-index: 30;
}
.limit-width {
    white-space: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    /* https://css-tricks.com/almanac/properties/w/word-break/ */
    word-break: break-all;
    word-break: break-word;

    -webkit-hyphens: auto;
    -moz-hyphens: auto;
    hyphens: auto;

    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;

    justify-content: left;
    text-align: left;
}
.song-clickable {
    text-decoration: none;
}
.song-clickable:hover {
    text-decoration: underline;
    background-color: rgba(120, 120, 120, 0.4);
}
.text--caption .muted {
    opacity: 0.4;
}
</style>
