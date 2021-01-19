<template>
    <v-card color="indigo" dark>
        <div class="d-flex flex-no-wrap justify-space-between">
            <div>
                <v-card-title class="headline"> Some Title </v-card-title>

                <v-card-subtitle>Some Artist</v-card-subtitle>

                <v-card-actions>
                    <v-btn class="ml-2 mt-3" fab icon height="40px" right width="40px">
                        <v-icon>mdi-play</v-icon>
                    </v-btn>

                    <v-btn class="ml-2 mt-5" outlined rounded small> START RADIO </v-btn>
                </v-card-actions>
            </div>

            <v-avatar class="ma-3" size="125" tile>
                <v-img :src="albumArt"></v-img>
            </v-avatar>
        </div>
    </v-card>
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
                if (res.results && res.results[0] && res.results[0].artworkUrl100) {
                    this.albumArt = res.results[0].artworkUrl100.replace("100x100", "200x200");
                }
                // this.albumArt = res.
            });
        }
    },
};
</script>

<style></style>
