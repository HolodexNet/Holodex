<template>
    <v-list dense>
        <song-item
            v-for="(song, idx) in songList"
            :song="song"
            :key="song.name + song.video_id + idx"
            @play="$emit('timeJump', song.start)"
            @playNow="$store.commit('music/skipTo', idx)"
            :hoverIcon="icons.mdiPlay"
        ></song-item>
    </v-list>
</template>

<script>
import { mapState } from "vuex";
import SongItem from "@/components/media/SongItem";

export default {
    components: {
        SongItem,
    },
    computed: {
        songList() {
            if (this.video && this.video.songs) {
                return this.video.songs.map((song) => {
                    return {
                        ...song,
                        video_id: this.video.id,
                        channel_id: this.video.channel.id,
                        channel: this.video.channel,
                    };
                });
            }
            return [];
        },
        ...mapState("watch", ["video"]),
    },
    mounted() {
        this.$nextTick(this.updateSongs);
    },
};
</script>

<style></style>
