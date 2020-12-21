<template>
    <!-- <div class="embedded-video" v-if="!redirectMode && video_src"> -->
    <!-- <iframe :src="video_src" frameborder="0" allowfullscreen></iframe> -->
    <div v-if="!redirectMode && video">
        <div class="video">
            <youtube
                class="embedded-video"
                :video-id="video.yt_video_key"
                @ready="ready"
                @playing="playing"
                @paused="paused"
                :playerVars="{ autoplay: 1 }"
            >
            </youtube>
            <div class="watch-overlay text-center">
                <template v-for="message in showMessages">
                    <div class="watch-translation" :key="message.message">
                        <div class="watch-translation-author">
                            <span style="background-color: rgba(0, 0, 0, 0.5)" class="pa-1 text-caption">
                                {{ message.author }}
                            </span>
                        </div>
                        <div class="watch-translation-message pa-2">
                            {{ message.message }}
                        </div>
                    </div>
                    <br :key="message.message + 'br'" />
                </template>
            </div>
        </div>
        <v-card class="summary">
            <div class="progress">
                <div class="progress-fill" :style="{ width: sliderValue + '%' }">
                    <div clsas="progress-fill-value">{{ summary[Math.floor(currentTime / bucketWidth)] }}</div>
                </div>
                <canvas id="chart" class="graph" style="height: 100px; position: relative"></canvas>
                <!-- <v-sparkline
                    :smooth="4"
                    :line-width="1"
                    :value="summary"
                    auto-draw
                    stroke-linecap="trend"
                    padding="3"
                    height="35"
                    width="400"
                    stlye="margin-bottom: -5px"
                ></v-sparkline> -->
            </div>
            <v-card-subtitle>Translations in the next 4 minutes </v-card-subtitle>
            <div></div>
            <!-- <v-slider
                v-model="sliderValue"
                :thumb-size="24"
                thumb-label="always"
                :step="100/video.duration_secs"
            >
                <template v-slot:thumb-label>
                    {{ summary[Math.floor(currentTime/bucketWidth)] }}
                </template>
            </v-slider> -->
        </v-card>
    </div>
    <!-- </div> -->
    <!-- <div
        id="player"
        class="embedded-video"
        v-if="!redirectMode && video_src"
    ></div> -->
    <div class="thumbnail" v-else>
        <v-img :aspect-ratio="16 / 9" :src="thumbnail_src" />
        <div class="thumbnail-overlay d-flex">
            <div class="text-h4 ma-auto">
                <a :href="`https://youtu.be/${video.yt_video_key}`"> Open on Youtube </a>
            </div>
        </div>
    </div>
</template>

<script>
import { getVideoThumbnails } from "@/utils/functions";
import api from "@/utils/backend-api";
import { CategoryScale, Chart, Line, LinearScale, LineController, Point, Tooltip } from "chart.js";

Chart.register(LineController, Line, Point, LinearScale, CategoryScale, Tooltip);

export default {
    name: "WatchFrame",
    props: {
        video: {
            required: true,
        },
    },
    data() {
        return {
            translations: [],
            other: [],
            sub_offset: 8, // offset by 4 seconds
            currentTime: 0,
            sliderTime: 0,
            bucketWidth: 60 * 4,
            timer: null,
            chart: null,
            darkMode: true,
        };
    },
    destroyed() {
        if (this.timer) this.stopSync();
    },
    created() {
        // api.videoLiveChatSummary(this.video.id).then(res => {
        //     if (res) this.summary = res.data.summary;
        // });
    },
    methods: {
        ready(event) {
            this.player = event.target;
        },
        startSync() {
            const vm = this;
            this.timer = setInterval(() => {
                vm.currentTime = vm.player.getCurrentTime();
            }, 1000);
        },
        stopSync() {
            clearInterval(this.timer);
            this.timer = null;
        },
        setTime(time) {
            this.player.seekTo(time);
        },
        playing(event) {
            console.log(event.target.getCurrentTime());
            this.startSync();
            // this.updateMessages(this.player.getCurrentTime());
        },
        paused(event) {
            console.log(event);
            this.stopSync();
        },
        cleanMessages() {
            const curTime = this.player.getCurrentTime();
            this.translations = this.translations.filter((m) => m.time_secs - this.sub_offset > curTime);
        },
        updateMessages(time) {
            this.cleanMessages();
            console.log("Grabbing new messages");
            Math.floor(time);
            return api.videoLiveChat(this.video.id, "translation", 0).then((res) => {
                // const curTime = this.player.getCurrentTime();
                if (res) {
                    // this.messages.push(...res.data.messages);
                    res.data.messages.forEach((msg) => {
                        msg.type === "translation" ? this.translations.push(msg) : this.other.push(msg);
                    });
                    this.loadChart();
                }
            });
        },
        loadChart() {
            const ctx = document.getElementById("chart");
            const gridLineColor = this.darkMode ? "rgba(255,255,255,0.2)" : "rgba(0, 0, 0, 0.1)";
            const fontColor = this.darkMode ? "white" : "black";
            console.log(this.summary);
            this.chart = new Chart(ctx, {
                type: "line",
                data: {
                    labels: this.summary,
                    datasets: [
                        {
                            // label: type,
                            borderColor: "#2196F3",
                            borderWidth: 4,
                            backgroundColor: "#2196F3",
                            data: this.summary,
                            pointRadius: 1,
                        },
                    ],
                },
                options: {
                    scales: {
                        y: {
                            display: false,
                            ticks: {
                                // eslint-disable-next-line no-unused-vars
                                // callback(value, index, values) {
                                //     return formatCount(value);
                                // },
                                font: {
                                    size: 12,
                                    color: fontColor,
                                },
                            },
                            gridLines: {
                                display: false,
                                color: gridLineColor,
                            },
                        },
                        x: {
                            display: false,
                            gridLines: {
                                display: false,
                                color: gridLineColor,
                            },
                            ticks: {
                                font: {
                                    size: 12,
                                    color: fontColor,
                                },
                            },
                        },
                    },
                    layout: {
                        padding: {
                            top: 10,
                            bottom: 10,
                            left: 10,
                            right: 10,
                        },
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                    hover: {
                        mode: "nearest",
                        intersect: false,
                    },
                    tooltips: {
                        mode: "index",
                        intersect: false,
                    },
                    // tooltips: {
                    //     mode: "index",
                    //     intersect: false,
                    //     callbacks: {
                    //         label(tooltipItem) {
                    //             return `${formatCount(tooltipItem.dataPoint.y)} ${tooltipItem.dataset.label}`;
                    //         },
                    //     },
                    // },
                },
            });
        },
        // getLabel(value) {
        //     return this.summary.find(
        //         s =>
        //             s.bin >= (value / 100) * this.video.duration_secs &&
        //             s.bin < (value / 100) * this.video.duration_secs + 240 &&
        //             s.type === "translation"
        //     ).count;
        // },
    },
    watch: {
        currentTime() {
            // console.log(this.currentTime);
            const lastMessage = this.translations[this.translations.length - 1];

            // check if player skipped ahead
            if (!lastMessage || this.currentTime > lastMessage.time_secs) {
                this.updateMessages(this.currentTime);
                return;
            }

            // load new messages if last message is about to be shown
            if (this.currentTime > lastMessage.time_secs - 30) {
                this.updateMessages(lastMessage.time_secs + 1);
            }
        },
    },
    computed: {
        video_src() {
            return `https://www.youtube.com/embed/${this.video.yt_video_key}?autoplay=1&rel=0&widget_referrer=${window.location.hostname}`;
        },
        thumbnail_src() {
            return getVideoThumbnails(this.video.yt_video_key).medium;
        },
        redirectMode() {
            return this.$store.state.redirectMode;
        },
        translationsWithDuration() {
            return this.translations.map((m) => {
                m.endTime = m.time_secs + m.message.length / 12 + 1;
                return m;
            });
        },
        showMessages() {
            return this.translationsWithDuration.filter(
                (m) =>
                    this.currentTime >= m.time_secs - this.sub_offset &&
                    this.currentTime <= m.endTime - this.sub_offset,
            );
        },
        lastMessage() {
            return this.translations[this.translations.length - 1];
        },
        sliderValue: {
            get() {
                return (this.currentTime / this.video.duration_secs) * 100;
            },
            set() {
                // const time = (100 / this.video.duration_secs) * val;
                // // this.currentTime = time;
                // this.setTime(time);
            },
        },
        summary() {
            if (!this.translations) return null;

            const buckets = [];
            buckets[0] = 0;
            // secs
            let index = 0;
            this.translations.forEach((msg) => {
                while (msg.time_secs > this.bucketWidth * index) {
                    index += 1;
                    buckets[index] = 0;
                }
                // if(!buckets[index])
                //     buckets[index] = 0;

                buckets[index] += 1;
            });
            return buckets;
        },
    },
};
</script>

<style>
.video {
    position: relative;
}
.watch-overlay {
    position: absolute;
    width: 100%;
    bottom: 5%;
    margin: 10px;
}
.watch-translation {
    display: inline-block;
    font-size: 1.85rem;
    line-height: 1;
}
.watch-translation-message {
    white-space: pre-wrap;
    background: rgba(8, 8, 8, 0.75);
}
.watch-translation-author {
    text-align: start;
}
.embedded-video {
    position: relative;
    padding-bottom: 56.25%;
}
.embedded-video > iframe {
    position: absolute;
    width: 100%;
    height: 100%;
}

.progress {
    position: relative;
}
.progress-fill {
    position: absolute;
    top: 0;
    height: 100%;
    background: rgba(61, 61, 61, 0.5);
    display: flex;
    align-items: center;
    justify-content: flex-end;
}

.progress-fill-value {
    margin-right: -18px;
}

.graph {
    width: 100%;
    height: 100%;
}
</style>
