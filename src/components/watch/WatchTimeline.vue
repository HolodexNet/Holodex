<template>
    <v-card class="summary">
        <div class="progress">
            <v-card-subtitle style="position: absolute">Translations in the next 4 minutes </v-card-subtitle>
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
        <div v-if="otherMessages" class="other-channels" style="height: 64px; width: 100%; position: relative">
            <template v-for="msg in otherMessages">
                <v-avatar
                    color="primary"
                    size="32"
                    :key="msg.author + ' ' + msg.time_secs"
                    style="position: absolute"
                    :style="{ left: 'calc(' + (100 / video.duration_secs) * msg.time_secs + '% - 16px)' }"
                    :title="msg.author"
                >
                    <img v-if="msg.channel" :src="msg.channel.photo" :alt="msg.author" />
                    <span class="white--text headline" v-else>CJ</span>
                </v-avatar>
            </template>
        </div>
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
</template>

<script>
import { CategoryScale, Chart, Line, LinearScale, LineController, Point, Tooltip } from "chart.js";

Chart.register(LineController, Line, Point, LinearScale, CategoryScale, Tooltip);

export default {
    name: "WatchTimeline",
    props: {
        video: {
            required: true,
            type: Object,
        },
        translations: {
            required: false,
            type: Array,
        },
        otherMessages: {
            required: false,
            type: Array,
        },
        currentTime: {
            required: true,
        },
    },
    data() {
        return {
            sliderTime: 0,
            bucketWidth: 60 * 4,
            chart: null,
        };
    },
    mounted() {},
    watch: {
        summary() {
            this.loadChart();
        },
    },
    computed: {
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

                buckets[index] += 1;
            });
            return buckets;
        },
    },
    methods: {
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
    },
};
</script>

<style>
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
