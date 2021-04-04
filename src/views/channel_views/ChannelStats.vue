<template>
    <v-container class="pa-0">
        <v-row>
            <v-col xs="12" md="6">
                <v-card class="pa-0">
                    <v-card-title>Subscribers</v-card-title>
                    <div class="graph-container">
                        <canvas id="subscriber-chart" class="graph"></canvas>
                    </div>
                    <v-simple-table>
                        <template v-slot:default>
                            <thead>
                                <tr>
                                    <th class="text-left">Date</th>
                                    <th class="text-left">Subscribers</th>
                                    <th class="text-left">Gains</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(row, index) in allData" :key="index">
                                    <td>{{ formatDate(row.day) }}</td>
                                    <td>
                                        {{ formatCount(row.subscriber_count) }}
                                    </td>
                                    <td class="green--text">+{{ row.subscriber_diff }}</td>
                                </tr>
                            </tbody>
                        </template>
                    </v-simple-table>
                </v-card>
            </v-col>
            <v-col xs="12" md="6">
                <v-card class="pa-0">
                    <v-card-title>Total Video Views</v-card-title>
                    <div class="graph-container">
                        <canvas id="view-chart" class="graph"></canvas>
                    </div>
                    <v-simple-table>
                        <template v-slot:default>
                            <thead>
                                <tr>
                                    <th class="text-left">Date</th>
                                    <th class="text-left">Video Views</th>
                                    <th class="text-left">Gains</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(row, index) in allData" :key="`view-${index}`">
                                    <td>{{ formatDate(row.day) }}</td>
                                    <td>{{ formatCount(row.view_count) }}</td>
                                    <td class="green--text">+{{ row.view_diff }}</td>
                                </tr>
                            </tbody>
                        </template>
                    </v-simple-table>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import api from "@/utils/backend-api";
import { dayjs } from "@/utils/time";
import { formatCount } from "@/utils/functions";
// NOTE(jprochazk): this library is not in package.json, but the component isn't used anywhere.
// import { CategoryScale, Chart, Line, LinearScale, LineController, Point, Tooltip } from "chart.js";

// Chart.register(LineController, Line, Point, LinearScale, CategoryScale, Tooltip);
export default {
    name: "ChannelStats",
    data() {
        return {
            timeLabels: [],
            subscriberData: [],
            viewData: [],
            allData: [],
            charts: [],
        };
    },
    mounted() {
        // NOTE(jprochazk): this endpoint doesn't exist, but the component isn't used anywhere.
        // @ts-ignore
        api.channelStats(this.channel_id).then((res) => {
            this.allData = res.data.reverse();
            this.timeLabels = this.allData.map((row) => dayjs(row.day).format("M/D"));
            this.subscriberData = this.allData.map((row) => row.subscriber_count);
            this.viewData = this.allData.map((row) => row.view_count);
            this.loadChart("subscriber");
            this.loadChart("view");
        });
    },
    destroyed() {
        this.charts.map((chart) => chart.destroy());
    },
    computed: {
        channel_id() {
            return this.$route.params.id;
        },
        darkMode() {
            return this.$store.state.settings.darkMode;
        },
    },
    methods: {
        formatDate(date) {
            return dayjs(date).format("M/D");
        },
        formatCount,
        loadChart(/* type */) {
            /* const ctx = document.getElementById(`${type}-chart`);
            const gridLineColor = this.darkMode ? "rgba(255,255,255,0.2)" : "rgba(0, 0, 0, 0.1)";
            const fontColor = this.darkMode ? "white" : "black";
            this.charts.push(
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
                                    callback(value, index, values) {
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
                                label(tooltipItem) {
                                    return `${formatCount(tooltipItem.dataPoint.y)} ${tooltipItem.dataset.label}`;
                                },
                            },
                        },
                    },
                }),
            ); */
        },
    },
};
</script>

<style></style>
