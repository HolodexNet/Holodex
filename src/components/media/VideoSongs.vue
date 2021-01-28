<template>
    <div>
        <song-search @input="processSearch"></song-search>
        <v-form>
            <v-row>
                <v-col cols="12" sm="6" md="4">
                    <v-text-field dense outlined label="Track Name"></v-text-field>
                </v-col>
                <v-col cols="6" sm="3" md="3">
                    <v-text-field dense outlined label="Start" placeholder="12:00"></v-text-field>
                </v-col>
                <v-col cols="6" sm="3" md="3">
                    <v-text-field dense outlined label="End / Duration" placeholder="3:40 or +312"></v-text-field>
                </v-col>
            </v-row>
        </v-form>
    </div>
</template>

<script>
import SongSearch from "./SongSearch";

export default {
    components: {
        SongSearch,
    },
    methods: {
        processSearch(item) {
            console.log(item);
        },
    },
};
</script>

<style></style>
SongSearch
