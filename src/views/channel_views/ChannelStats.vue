<template>
    <v-container class="pa-0">
        <v-card class="pa-0">
            <div class="graph-container">
                <canvas
                    id="subscriber-chart"
                    style="background: white"
                    class="graph"
                ></canvas>
            </div>
            <div class="graph-container">
                <canvas
                    id="view-chart"
                    style="background: white"
                    class="graph"
                ></canvas>
            </div>
        </v-card>
    </v-container>
</template>

<script>
// eslint-disable-next-line prettier/prettier
// eslint-disable-next-line no-unused-vars
import api from "@/utils/backend-api.js";
import dayjs from "dayjs";
import { formatCount } from "@/utils/image-utils";
import {
    Chart,
    LineController,
    Line,
    Point,
    LinearScale,
    CategoryScale,
    Title,
    ScatterController,
    Tooltip,
} from "chart.js";
Chart.register(
    LineController,
    Line,
    Point,
    LinearScale,
    CategoryScale,
    Title,
    ScatterController,
    Tooltip
);
export default {
    name: "ChannelStats",
    data() {
        return {
            timeLabels: [],
            subscriberData: [],
            viewData: [],
            stepSizes: [100, 5000, 10000, 25000, 50000, 100000, 500000],
        };
    },
    mounted() {
        api.channel_history(this.channel_id).then(res => {
            const allData = res.data;
            // .map(row => {
            //     row.label = dayjs(row.day).add(row.hour_6 * 6, "hour").format("M/D H:mm");
            // });
            console.log(res.data);
            this.timeLabels = allData.map(row =>
                dayjs(row.day)
                    // .add(row.hour_6 * 6, "hour")
                    .format("M/D")
            );
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
    },
    methods: {
        loadChart(type) {
            // const diff =
            //     (Math.max(...this.subscriberData) -
            //         Math.min(...this.subscriberData)) /
            //     this.subscriberData.length;
            // const stepSize = this.stepSizes[this.stepSizes.findIndex(value => value > diff)];
            var ctx = document.getElementById(`${type}-chart`);
            // eslint-disable-next-line no-unused-vars
            var myChart = new Chart(ctx, {
                type: "line",
                data: {
                    labels: this.timeLabels,
                    datasets: [
                        {
                            label: type,
                            borderColor: "#F08080",
                            borderWidth: 4,
                            backgroundColor: "#F08080",
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
                                },
                                maxTicksLimit: 6,
                            },
                        },
                        x: {
                            gridLines: {
                                display: false,
                            },
                            ticks: {
                                font: {
                                    size: 12,
                                },
                            },
                        },
                    },
                    layout: {},
                    responsive: true,
                    // title: {
                    //     display: true,
                    //     text: ""
                    // },
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
    min-height: 320px;
}
</style>
