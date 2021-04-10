<template>
    <div style="width: 100%; height: 100%">
        <v-tabs v-model="currentTab" height="32">
            <v-tab v-for="(video, index) in activeVideos" :key="index">
                {{ video.channel.name.split(" ")[0] }}
            </v-tab>
        </v-tabs>
        <WatchLiveChat
            v-if="activeVideos.length"
            :video="activeVideos[currentTab]"
            style="width: 100%; height: calc(100% - 32px)"
            :key="activeVideos[currentTab].id"
            :showTL="showTL"
            :showTLFirstTime="showTLFirstTime"
            :showLiveChat="toggleChat"
            fluid
        />
    </div>
</template>

<script lang="ts">
import WatchLiveChat from "@/components/watch/WatchLiveChat.vue";

export default {
    name: "TabbedLiveChat",
    components: {
        WatchLiveChat,
    },
    props: {
        activeVideos: {
            type: Array,
            required: true,
        },
        toggleTL: {
            type: Boolean,
            default: false,
        },
        toggleChat: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            currentTab: 0,
            showTL: false,
            showTLFirstTime: false,
            newTL: 0,

            // showLiveChat: true,
        };
    },
    watch: {
        currentTab() {
            this.showTLFirstTime = true;
        },
        toggleTL() {
            if (!this.showTLFirstTime) {
                this.showTLFirstTime = true;
                this.showTL = true;
                return;
            }
            this.showTL = !this.showTL;
        },
        toggleChat() {},
    },
};
</script>

<style></style>
