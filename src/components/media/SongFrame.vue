<template>
    <!-- Purpose of Component: to contain a youtube video, load it and handle several actions -->
    <div class="song-player-container">
        <div class="song-player">
            <youtube
                :key="'ytplayer' + videoId"
                v-if="videoId"
                :video-id="videoId"
                @ready="ready"
                @playing="(x) => handlerGenerator('playing')(x)"
                @progress="(x) => handlerGenerator('progress')(x)"
                @paused="(x) => handlerGenerator('paused')(x)"
                @buffering="(x) => handlerGenerator('buffering')(x)"
                :playerVars="{
                    ...(start && { start }),
                    ...(end && { end }),
                    autoplay: $store.state.settings.autoplayVideo ? 1 : 0,
                    playsinline: 1,
                    controls: 1,
                    disablekb: 1,
                }"
            >
            </youtube>
        </div>
    </div>
</template>

<script>
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
            currentTime: 0,
        };
    },
    computed: {},
    methods: {
        handlerGenerator(event) {
            return (evt) => {
                console.log(event, evt);
            };
        },
        ready(evt) {
            this.player = evt.target;
        },
        setTimer() {
            if (this.timer) clearInterval(this.timer);
            if (this.player) {
                this.timer = setInterval(() => {
                    this.currentTime = this.player.getCurrentTime();
                    if (this.currentTime >= this.end) this.$emit("done");
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
    padding-bottom: min(56.25%, calc(100vh - 120px));
    width: 100%;
}

.song-player iframe {
    position: absolute;
    width: 100%;
    height: 100%;
}
</style>
