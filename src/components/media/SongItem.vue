<template>
    <v-list-item @click.stop="$emit('play', song)">
        <v-list-item-avatar tile>
            <v-img lazy-src :src="song.art"></v-img>
        </v-list-item-avatar>
        <v-list-item-content class="py-1 pt-1">
            <v-list-item-subtitle class="text--primary text-subtitle-1">
                <a
                    class="text-caption error--text float-right ml-1 song-clickable"
                    v-if="alwaysShowDeletion || (detailed && $listeners.remove && userCanDelete)"
                    @click.stop="$emit('remove', song)"
                >
                    Remove
                </a>
                <div v-if="detailed" class="float-right text-caption">[{{ song.start }} - {{ song.end }}]s</div>

                <span class="limit-width">
                    {{ song.name }} /
                    <span class="primary--text text--lighten-2">{{ song.original_artist }}</span></span
                >
            </v-list-item-subtitle>

            <v-list-item-subtitle
                class="text--caption song-clickable"
                v-if="$listeners.channel"
                @click.stop="$emit('channel', song)"
            >
                <div class="float-right">
                    {{ Math.floor((song.end - song.start) / 60) }}:{{
                        (Math.round(song.end - song.start) % 60).toString().padStart(2, "0")
                    }}
                </div>

                {{ song.channel.name }}
            </v-list-item-subtitle>
            <!-- Else: -->
            <v-list-item-subtitle class="text--caption" v-else>
                <div class="float-right">
                    {{ Math.floor((song.end - song.start) / 60) }}:{{
                        (Math.round(song.end - song.start) % 60).toString().padStart(2, "0")
                    }}
                </div>

                {{ song.channel.name }}
            </v-list-item-subtitle>
        </v-list-item-content>
    </v-list-item>
</template>

<script>
// const jsonp = require("jsonp-es6");

import { mdiMusicBoxOutline } from "@mdi/js";

export default {
    name: "SongItem",
    data() {
        return {
            albumArt: null,
            mdiMusicBoxOutline,
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
    },
    computed: {
        userCanDelete() {
            const u = this.$store.state.userdata;
            return u && u.user && u.user.role && u.user.role !== "user";
        },
    },
    mounted() {},
};
</script>

<style scoped>
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
    line-clamp: 1;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;

    justify-content: left;
    text-align: left;
}
.song-clickable {
    text-decoration: none;
}
.song-clickable:hover {
    text-decoration: underline;
}
</style>
