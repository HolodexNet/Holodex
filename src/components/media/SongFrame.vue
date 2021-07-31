<template>
    <!-- Purpose of Component: to contain a youtube video, load it and handle several actions -->
    <div :class="containerClass">
        <div class="song-player">
            <!--                 :key="'ytplayer' + videoId" -->
            <!-- https://developers.google.com/youtube/player_parameters -->
            <youtube
                v-if="playback.song.video_id"
                :video-id="playback.song.video_id"
                :player-vars="{
                    ...(playback.song.start && { start: playback.song.start }),
                    ...(playback.song.end && { end: playback.song.end }),
                    autoplay: 1,
                    playsinline: 1,
                    controls: 1,
                    disablekb: 1,
                    fs: 0,
                    modestbranding: 1,
                    rel: 0,
                    cc_load_policy: 0,
                    iv_load_policy: 3,
                }"
                v-on="$listeners"
                @ready="ready"
            >
            </youtube>
        </div>
    </div>
</template>

<script lang="ts">
export default {
    name: "SongFrame",
    components: {},
    props: {
        playback: {
            required: true,
        },
        isBackground: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            timer: null,
            player: null,
            // currentTime: 0,
        };
    },
    computed: {
        containerClass() {
            return this.isBackground ? "song-player-container-background" : "song-player-container";
        },
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
                if (o.song.video_id === n.song.video_id && o.song.start === n.song.start) {
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

<style lang="scss">
.song-player-container {
    width: 356px;
    position: fixed;
    top: 80px;
    right: 0;
    margin: 0 10px 10px 0;
    border-radius: 4px;
    overflow: hidden;
    z-index: 1000;

    .song-player {
        position: relative;
        padding-bottom: 56.25%;
        /* padding-bottom: min(56.25%, calc(100vh - 120px)); */
        /* width: 100%; */
    }
}

.song-player-container-background {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    opacity: 0.3;
    height: 100vh;
}

.song-player iframe {
    position: absolute;
    width: 100%;
    height: 100%;
}
</style>
