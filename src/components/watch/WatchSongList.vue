<template>
    <v-list dense>
        <song-item
            v-for="(song, idx) in songs"
            :song="song"
            :key="song.name + song.video_id + idx"
            @play="$emit('timeJump', song.start)"
            @playNow="$store.commit('music/skipTo', idx)"
            :hoverIcon="icons.mdiPlay"
        ></song-item>
    </v-list>
</template>

<script>
import backendApi from "@/utils/backend-api";
import { mapState } from "vuex";
import SongItem from "@/components/media/SongItem";

export default {
    components: {
        SongItem,
    },
    data() {
        return {
            currentVideoId: null,
            songs: [],
        };
    },
    computed: {
        ...mapState("watch", ["video", "comments", "isLoading", "hasError"]),
    },
    mounted() {
        this.$nextTick(this.updateSongs);
    },
    watch: {
        async video() {
            if (this.video.id !== this.currentVideoId) {
                this.updateSongs();
            }
        },
    },
    methods: {
        async updateSongs() {
            console.log("fetching songs...");
            this.songs = (
                await backendApi.songListByVideo(this.video.channel_id || this.video.channel.id, this.video.id, true)
            ).data;
            this.currentVideoId = this.video.id;
        },
    },
};
</script>

<style></style>
