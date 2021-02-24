<template>
    <!-- Purpose of Component: to contain a youtube video, load it and handle several actions -->
    <div class="song-player-container">
        <div class="song-player">
            <youtube
                :key="'ytplayer' + videoId"
                v-if="videoId"
                :video-id="videoId"
                @ready="handlerGenerator('ready')"
                @playing="handlerGenerator('playing')"
                @progress="handlerGenerator('progress')"
                @pause="handlerGenerator('pause')"
                @play="handlerGenerator('play')"
                :playerVars="{
                    ...(start && { start: start }),
                    autoplay: $store.state.settings.autoplayVideo ? 1 : 0,
                    playsinline: 1,
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
        return {};
    },
    computed: {},
    methods: {
        handlerGenerator(event) {
            return (evt) => {
                console.log(event, evt);
            };
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
