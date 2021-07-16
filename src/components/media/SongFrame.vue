<template>
    <!-- Purpose of Component: to contain a youtube video, load it and handle several actions -->
    <div class="song-player-container">
        <div class="song-player">
            <!--                 :key="'ytplayer' + videoId" -->
            <youtube
                v-if="playback.song.video_id"
                :video-id="playback.song.video_id"
                v-on="$listeners"
                @ready="ready"
                :playerVars="{
                    ...(playback.song.start && { start: playback.song.start }),
                    ...(playback.song.end && { end: playback.song.end }),
                    autoplay: 1,
                    playsinline: 1,
                    controls: 1,
                    disablekb: 1,
                }"
            >
            </youtube>
        </div>
    </div>
</template>

<script lang="ts">
// import { MUSIC_PLAYER_STATE } from "@/utils/consts";

export default {
    name: "SongFrame",
    components: {},
    props: {
        playback: {
            required: true,
        },
    },
    data() {
        return {
            timer: null,
            player: null,
            // currentTime: 0,
        };
    },
    watch: {
        // shouldAutoPlay() {
        //     maybe $store.state.settings.autoplayVideo ? probably not.
        //     return this.$store.state.music.state === MUSIC_PLAYER_STATE.PLAYING ? 1 : 0;
        // }
        playback: {
            deep: true,
            handler: "nextSong",
        },
    },
    methods: {
        nextSong(n, o) {
            console.log("Next song engaged:", o.song.video_id, "->", n.song.video_id);
            console.log("Next song engaged:", o.song.start, "->", n.song.start);
            // if the video ID changes, the youtube wrapper will take care of it, but
            // if the playId changes, we need to hook up a nextSong functionality.
            if (n.playId !== o.playId) {
                if (o.song.video_id === n.song.video_id && o.song.start === n.song.video_id) {
                    // same video, same track.
                    console.log("The songs are the same, but playback ID is probably different:");
                    this.player.loadVideoById({
                        startSeconds: n.song.start,
                        endSeconds: n.song.end,
                        videoId: n.song.video_id,
                    });
                } else if (o.song.start !== n.song.start && o.song.video_id === n.song.video_id) {
                    // same video, different track.
                    this.player.seekTo(n.song.start);
                }
            }
            // different videos should be handled by the vue-youtube system.
        },
        ready(evt) {
            this.player = evt;
            this.setTimer();
            console.log(evt);
        },
        setTimer() {
            if (this.timer) clearInterval(this.timer);
            if (this.player) {
                this.timer = setInterval(() => {
                    const currentTime = this.player.getCurrentTime();
                    this.$emit("progress", currentTime);
                    // if (this.currentTime >= this.end) this.$emit("done");
                }, 1000);
            }
        },
    },
};
</script>

<style>
.song-player {
    position: relative;
    padding-bottom: 56.25%;
    /* padding-bottom: min(56.25%, calc(100vh - 120px)); */
    width: 100%;
}

.song-player iframe {
    position: absolute;
    width: 100%;
    height: 100%;
}
</style>
