<template>
    <v-card tile class="mb-2">
        <v-card-subtitle>{{ $t("component.watch.nextUpInMugen") }} {{ nextUpTime }}</v-card-subtitle>
        <!-- <v-card-text> -->
        <v-progress-linear
            :color="countdownProgress > 0 ? 'primary' : 'grey'"
            :value="countdownProgress"
        ></v-progress-linear>
        <VideoCardList
            :videos="videos"
            v-if="playlist.length > 0"
            limitRows="2"
            :activeId="video.id"
            includeChannel
            horizontal
            :cols="{
                xs: 1,
                sm: 2,
                md: 3,
                lg: 5,
                xl: 5,
            }"
            dense
            ignoreBlock
        />
        <!-- </v-card-text> -->
    </v-card>
</template>

<script lang="ts">
import api from "@/utils/backend-api";
import VideoCardList from "@/components/video/VideoCardList.vue";
import { localizedDayjs } from "@/utils/time";

export default {
    name: "WatchMugen",
    components: {
        VideoCardList,
    },
    props: {},
    data() {
        return {
            currentTime: 0,
            nextCheck: 0,
            timer: null,
            playlist: [],
            timeOffset: 0,
            video: {},
            countdownProgress: 0,
            isLoading: true,
        };
    },
    mounted() {
        const vm = this;
        this.timer = setInterval(() => {
            vm.currentTime = Math.floor(new Date().getTime() / 1000);
        }, 1000);
        this.init();
    },
    beforeDestroy() {
        clearInterval(this.timer);
    },
    methods: {
        init() {
            api.rotation().then((res) => {
                this.playlist = res.data.sort((x, y) => +x.timestamp - y.timestamp);
                this.calculateVideo();
            });
        },
        calculateVideo() {
            const now = new Date().getTime() / 1000;
            this.playlist = this.playlist.filter((x) => +x.timestamp + x.video.duration > now);
            const toPlay = this.playlist[0];

            this.nextCheck = this.playlist[1].timestamp;
            api.video(toPlay.video.id).then((res) => {
                this.timeOffset = Math.floor(now - toPlay.timestamp);
                this.video = res.data;
                this.$emit("playNext", { video: this.video, timeOffset: this.timeOffset });
                // this.isLoading = false;
            });
        },
    },
    computed: {
        videos() {
            return this.playlist.map((p) => p.video);
        },
        nextUpTime() {
            if (!this.nextCheck || !this.currentTime) return "";
            const diff = this.nextCheck - this.currentTime;
            if (diff < 0 /* && this.isLoading */) {
                return "Loading...";
            }
            return localizedDayjs(new Date(this.nextCheck * 1000), this.$store.state.settings.lang).fromNow();
        },
    },
    watch: {
        currentTime() {
            if (this.currentTime > this.nextCheck) {
                this.calculateVideo();
                this.countdownPercentage = 0;
            }
            // if (this.nextCheck - this.currentTime < 10) {
            //     this.countdownPercentage = ((10.0 - (this.nextCheck - this.currentTime)) / 10.0) * 100;
            // }
            this.countdownProgress = (1 - (this.nextCheck - this.currentTime) / this.video.duration) * 100;
        },
        playlist() {
            // schedule became empty, or last start is ending within 30 minutes...
            if (!this.playlist) return;
            if (
                this.playlist === [] ||
                this.playlist[this.playlist.length - 1].timestamp +
                    this.playlist[this.playlist.length - 1].video.duration <
                    new Date().getTime() / 1000 + 1800
            ) {
                this.init();
            }
        },
    },
};
</script>

<style></style>
