<template>
    <div style="width: 100%; height: 100%">
        <v-tabs v-model="currentTab" height="32">
            <v-tab v-for="(video, index) in activeVideos" :key="'wctabs' + index">
                {{ video.channel.name.split(" ")[0] }}
            </v-tab>
        </v-tabs>
        <template v-if="activeVideos.length && currentTab >= 0">
            <WatchLiveChat
                :video="activeVideos[currentTab || 0]"
                style="width: 100%; height: calc(100% - 32px)"
                :key="'wlc' + activeVideos[currentTab || 0].id"
                :showTL="showTL"
                :showTLFirstTime="showTLFirstTime"
                :showLiveChat="setShowChat"
                fluid
            />
        </template>
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
        setShowTL: {
            type: Boolean,
            default: false,
        },
        setShowChat: {
            type: Boolean,
            default: false,
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
        setShowTL(nw) {
            if (!this.showTLFirstTime) {
                this.showTLFirstTime = true;
                this.showTL = true;
                return;
            }
            this.showTL = nw;
        },
        activeVideos() {
            if (!this.activeVideos.length) {
                this.currentTab = 0;
            } else if (this.currentTab >= this.activeVideos.length) {
                this.currentTab = this.activeVideos.length - 1;
            }
        },
    },
};
</script>

<style></style>
