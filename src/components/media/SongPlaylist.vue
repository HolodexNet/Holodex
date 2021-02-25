<template>
    <v-list dense class="song-list">
        <song-item
            v-for="(song, idx) in songs"
            :song="song"
            :key="song.name + song.video_id"
            :class="{ active: idx === currentId }"
            @play="$store.commit('music/skipTo', idx)"
        ></song-item>
    </v-list>
</template>

<script>
import SongItem from "./SongItem";

export default {
    components: { SongItem },
    props: {
        songs: {
            type: Array,
            required: true,
        },
        currentId: {
            type: Number,
            required: true,
        },
    },
};
</script>

<style>
.song-list .active {
    /* box-shadow: inset 5px 0 0 0 #42f432; /* Border left */
    /* border-top: 1px solid #42f432; */
    /* border-bottom: 1px solid #42f432; */
    /* border-left: 4px solid #42f432; */
    animation: pulse-active-playing 2s infinite;
    text-rendering: geometricPrecision;
}

@keyframes pulse-active-playing {
    0% {
        transform: scale(1);
        box-shadow: 5px 0 0 0 #42f432;
    }

    70% {
        transform: scale(1);
        box-shadow: 0 0 0 4px rgba(0, 0, 0, 0);
    }

    100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
    }
}
</style>
