<template>
    <div style="width: 100%; height: 100%">
        <v-tabs v-model="currentTab" height="32">
            <v-tab v-for="(video, index) in activeVideos" :key="'wctabs' + index">
                {{ video.channel.name.split(" ")[0] }}
            </v-tab>
        </v-tabs>
        <template v-if="activeVideos.length && currentTab >= 0">
            <iframe
                :src="twitchChatLink"
                v-if="activeVideos[currentTab || 0].cellVideoType === 'twitch'"
                style="width: 100%; height: calc(100% - 32px)"
            >
            </iframe>
            <WatchLiveChat
                v-else
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
        id: {
            type: [String, Number],
            required: true,
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
    mounted() {
        this.currentTab = this.savedTab;
    },
    computed: {
        savedTab: {
            get() {
                if (
                    !this.$store.state.multiview.layoutContent[this.id] ||
                    !this.$store.state.multiview.layoutContent[this.id].currentTab
                ) {
                    return 0;
                }
                return this.$store.state.multiview.layoutContent[this.id].currentTab;
            },
            set(val) {
                const obj = this.$store.state.multiview.layoutContent[this.id];
                obj.currentTab = val;
                return this.$store.commit("multiview/setLayoutContentById", {
                    id: this.id,
                    content: obj,
                });
            },
        },
        twitchChatLink() {
            return `https://www.twitch.tv/embed/${this.activeVideos[this.currentTab || 0].id}/chat?parent=${
                window.location.hostname
            }`;
        },
    },
    watch: {
        currentTab() {
            this.showTLFirstTime = false;
            this.savedTab = this.currentTab;
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
