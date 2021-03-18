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
            style="width: 100%; height: calc(100% - 48px)"
            :key="activeVideos[currentTab].id"
            fluid
        />
    </div>
</template>

<script>
import WatchLiveChat from "@/components/watch/WatchLiveChat";

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
    },
    data() {
        return {
            currentTab: 0,
        };
    },
};
</script>

<style></style>
