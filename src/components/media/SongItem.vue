<template>
    <v-list-item @click="() => {}">
        <v-list-item-avatar tile>
            <v-img :src="song.art"></v-img>
        </v-list-item-avatar>
        <v-list-item-content class="py-1 pt-1">
            <v-list-item-subtitle class="text--primary text-subtitle-1">
                <span class="limit-width"> {{ song.name }} / {{ song.originalArtist }}</span>
            </v-list-item-subtitle>

            <v-list-item-subtitle class="text--caption">
                <div class="float-right">
                    [{{ Math.floor((song.end - song.start) / 60) }}:{{
                        (Math.round(song.end - song.start) % 60).toString().padStart(2, "0")
                    }}]
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
    },
    computed: {},
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
</style>
