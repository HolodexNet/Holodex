<template>
    <!-- <v-container> -->
    <v-row>
        <v-col sm="12" md="6">
            <v-card elevation="5">
                <v-card-subtitle>
                    Most recent songs ({{ recentOffset + 1 }} - {{ recentOffset + recentLimit }})
                </v-card-subtitle>
                <v-list>
                    <v-divider></v-divider>
                    <song-item
                        v-for="(song, idx) in recentSongs"
                        :song="song"
                        :key="'clist' + song.name + song.video_id + idx"
                        @play="$store.commit('music/addSong', song)"
                        @playNow="skipToSong"
                        showTime
                        :hoverIcon="icons.mdiPlaylistMusic"
                        :artworkHoverIcon="icons.mdiPlay"
                    ></song-item>
                    <v-divider></v-divider>
                    <v-list-item class="d-flex">
                        <v-btn class="flex-grow-1" @click="recentOffset = Math.max(0, recentOffset - recentLimit)"
                            >Newer</v-btn
                        >
                        <v-btn class="flex-grow-1" @click="recentOffset += recentLimit">Older</v-btn>
                    </v-list-item>
                </v-list>
            </v-card>
        </v-col>
        <v-col sm="12" md="6">
            <v-card elevation="5">
                <v-card-subtitle> By popularity on Holodex </v-card-subtitle>
                <v-list>
                    <v-divider></v-divider>
                    <v-list-item>This feature is currently not implemented</v-list-item>
                    <song-item
                        v-for="(song, idx) in popularSongs"
                        :song="song"
                        :key="song.name + song.video_id + idx"
                        @play="$store.commit('music/addSong', song)"
                        showTime
                    ></song-item>
                </v-list>
            </v-card>
        </v-col>
    </v-row>
    <!-- </v-container> -->
</template>

<script>
import backendApi from "@/utils/backend-api";

const { default: SongItem } = require("@/components/media/SongItem");

export default {
    components: { SongItem },
    name: "ChannelMusic",
    data() {
        return {
            recentOffset: 0,
            recentLimit: 20,
            recentSongs: [],

            popularOffset: 0,
            popularLimit: 20,
            popularSongs: [],
        };
    },
    mounted() {
        this.songsByRecent();
        this.songsByPopular();
    },
    computed: {
        channel() {
            return this.$store.state.channel.channel;
        },
    },
    watch: {
        recentOffset() {
            this.songsByRecent();
        },
        popularOffset() {
            this.songsByPopular();
        },
    },
    methods: {
        async songsByRecent() {
            console.log("fetching...");
            const { data } = await backendApi.songListByCondition(
                { channel_id: this.channel.id },
                this.recentOffset,
                this.recentLimit,
            );
            this.recentSongs = data;
        },
        async songsByPopular() {
            console.log("tbd");
            // const { data } = await backendApi.songListByCondition(
            //     { channel_id: this.channel.id },
            //     this.recentOffset,
            //     this.recentLimit,
            // );
            // this.recentSongs = data;
        },
        skipToSong(song) {
            console.log("skipping: ", this.$store.state.music.playlist.length - 1);
            this.$store.commit("music/addSong", song);
            this.$store.commit("music/skipTo", this.$store.state.music.playlist.length - 1);
        },
    },
};
</script>

<style></style>
