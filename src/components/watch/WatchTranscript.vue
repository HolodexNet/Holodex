<template>
    <v-card dense>
        <v-card-text>Translations</v-card-text>
        <v-divider />
        <!-- <div style="max-height: 400px; overflow-y: auto;"> -->
        <!-- <div class="d-flex flex-column w-100">
                <div v-for="item in translations" :key="item.message" class="d-flex align-center">
                    <div class="transcript-time">
                        {{ formatDuration(item.time_secs * 1000) }}
                    </div>
                    <div grow class="transcript-message">
                        {{ item.message }}
                    </div>
                </div>
            </div> -->
        <!-- <v-row  v-for="item in translations" :key="item.message + item.time_secs ">
                <v-col class="transcript-time">
                    {{ formatDuration(item.time_secs * 1000) }}
                </v-col>
                <v-col grow class="transcript-message">
                    {{ item.message }}
                </v-col>
            </v-row>
        </div> -->
        <v-simple-table dense height="400">
            <template v-slot:default>
                <tbody>
                    <tr v-for="item in translations" :key="item.message">
                        <td class="transcript-time">{{ formatDuration(item.time_secs * 1000) }}</td>
                        <td class="transcript-message">{{ item.message }}</td>
                    </tr>
                </tbody>
            </template>
        </v-simple-table>
    </v-card>
</template>

<script>
import { formatDuration } from "@/utils/time";

export default {
    name: "WatchTranscript",
    methods: {
        formatDuration,
    },
    props: {
        translations: {},
        otherMessages: {},
    },
};
</script>

<style>
.transcript-message {
    font-size: 0.8125rem;
    word-wrap: break-word;
    /* line-height: 1.8rem; */
}
.transcript-time {
    white-space: nowrap;
}
</style>
