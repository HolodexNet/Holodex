<template>
    <!-- Purpose of Component: to contain a youtube video, load it and handle several actions -->
    <div class="song-player-container">
        <div class="song-player">
            <youtube
                :key="'ytplayer' + videoId"
                v-if="videoId"
                :video-id="videoId"
                v-on="$listeners"
                @ready="ready"
                :playerVars="{
                    ...(start && { start }),
                    ...(end && { end }),
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
        videoId: {
            required: true,
        },
        start: {
            type: Number,
            required: true,
        },
        end: {
            type: Number,
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
    computed: {
        // shouldAutoPlay() {
        //     maybe $store.state.settings.autoplayVideo ? probably not.
        //     return this.$store.state.music.state === MUSIC_PLAYER_STATE.PLAYING ? 1 : 0;
        // }
    },
    methods: {
        ready(evt) {
            this.player = evt.target;
            this.setTimer();
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
