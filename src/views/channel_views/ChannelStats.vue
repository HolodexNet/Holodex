<template>
    <v-container class="pa-0">
        <v-row>
            <v-col xs="12" md="6">
                <v-card class="pa-0">
                    <v-card-title>Subscribers</v-card-title>
                    <div class="graph-container">
                        <canvas id="subscriber-chart" class="graph"></canvas>
                    </div>
                </v-card>
            </v-col>
            <v-col xs="12" md="6">
                <v-card class="pa-0">
                    <v-card-title>Total Video Views</v-card-title>
                    <div class="graph-container">
                        <canvas id="view-chart" class="graph"></canvas>
                    </div>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import api from "@/utils/backend-api.js";
import dayjs from "dayjs";
import { formatCount } from "@/utils/image-utils";
import {
    Chart,
    LineController,
    Line,
    Point,
    LinearScale,
    Tooltip,
} from "chart.js";
Chart.register(LineController, Line, Point, LinearScale, Tooltip);
export default {
    name: "ChannelStats",
    data() {
        return {
            timeLabels: [],
            subscriberData: [],
            viewData: [],
        };
    },
    mounted() {
        api.channel_history(this.channel_id).then(res => {
            const allData = res.data;
            this.timeLabels = allData.map(row => dayjs(row.day).format("M/D"));
            this.subscriberData = allData.map(row => row.subscriber_count);
            this.viewData = allData.map(row => row.view_count);
            this.loadChart("subscriber");
            this.loadChart("view");
        });
    },
    computed: {
        channel_id() {
            return this.$route.params.id;
        },
        darkMode() {
            return this.$store.state.darkMode;
        },
    },
    methods: {
        loadChart(type) {
            var ctx = document.getElementById(`${type}-chart`);
            const gridLineColor = this.darkMode
                ? "rgba(255,255,255,0.2)"
                : "rgba(0, 0, 0, 0.1)";
            const fontColor = this.darkMode ? "white" : "black";
            new Chart(ctx, {
                type: "line",
                data: {
                    labels: this.timeLabels,
                    datasets: [
                        {
                            label: type,
                            borderColor: "#2196F3",
                            borderWidth: 4,
                            backgroundColor: "#2196F3",
                            data: this[`${type}Data`],
                            pointRadius: 4,
                        },
                    ],
                },
                options: {
                    scales: {
                        y: {
                            ticks: {
                                // eslint-disable-next-line no-unused-vars
                                callback: function(value, index, values) {
                                    return formatCount(value);
                                },
                                font: {
                                    size: 12,
                                    color: fontColor,
                                },
                                maxTicksLimit: 6,
                            },
                            gridLines: {
                                color: gridLineColor,
                            },
                        },
                        x: {
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
                            left: 5,
                            right: 5,
                        },
                    },
                    responsive: true,
                    tooltips: {
                        mode: "index",
                        intersect: false,
                        callbacks: {
                            label: function(tooltipItem) {
                                return (
                                    formatCount(tooltipItem.dataPoint.y) +
                                    " " +
                                    tooltipItem.dataset.label
                                );
                            },
                        },
                    },
                },
            });
        },
    },
};
</script>

<style>
.graph-container {
    /* min-height: 320px; */
    /* padding: 10px 0; */
}
</style>
