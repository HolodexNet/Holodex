<template>
    <v-list-item v-if="verticalList">
        <v-list-item-avatar>
            <v-img :src="albumArt"></v-img>
        </v-list-item-avatar>
    </v-list-item>
</template>

<script>
const jsonp = require("jsonp-es6");

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
    mounted() {
        if (this.song.itunesid) {
            jsonp("https://itunes.apple.com/lookup", { upc: 720642462928 }).then((res) => {
                console.log(res);
                if (res && res[0] && res[0].artworkUrl100) {
                    this.albumArt = res[0].artworkUrl100.replace("100x100", "200x200");
                }
                // this.albumArt = res.
            });
        }
    },
};
</script>

<style></style>
