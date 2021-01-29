<template>
    <v-card color="indigo" dark>
        <v-list-item-avatar tile>
            <v-img :src="song.artworkUrl100"></v-img>
        </v-list-item-avatar>

        <v-list-item-content class="py-1 pt-1">
            <v-list-item-subtitle class="text--primary">
                🎵 {{ song.name }} [{{ Math.floor(song.duration / 1000 / 60) }}:{{
                    Math.round(song.duration / 1000) % 60
                }}]
            </v-list-item-subtitle>
            <v-list-item-subtitle class="text--caption"> 🎤 {{ song.originalArtist }} </v-list-item-subtitle>
        </v-list-item-content>
    </v-card>
</template>

<script>
// const jsonp = require("jsonp-es6");

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
    },
    computed: {},
    mounted() {},
};
</script>

<style></style>
