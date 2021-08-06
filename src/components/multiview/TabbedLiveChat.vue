<template>
  <div style="width: 100%; height: 100%">
    <div class="d-flex flex-row align-center py-1">
      <v-btn
        v-if="setShowChat"
        icon
        small
        class="mx-1"
        :disabled="currentTab <= 0"
        @click="currentTab -= 1"
      >
        <v-icon>{{ icons.mdiChevronLeft }}</v-icon>
      </v-btn>
      <v-select
        v-model="currentTab"
        :items="channels"
        outlined
        hide-details
        class="tabbed-chat-select mx-1"
      />
      <v-btn
        v-if="setShowChat"
        icon
        small
        class="mx-1"
        :disabled="currentTab >= activeVideos.length - 1"
        @click="currentTab += 1"
      >
        <v-icon>{{ icons.mdiChevronRight }}</v-icon>
      </v-btn>
    </div>
    <template v-if="activeVideos.length && currentTab >= 0">
      <iframe
        v-if="activeVideos[currentTab || 0].type === 'twitch'"
        :src="twitchChatLink"
        style="width: 100%; height: calc(100% - 32px)"
        frameborder="0"
      />
      <WatchLiveChat
        v-else
        :key="'wlc' + activeVideos[currentTab || 0].id"
        :video="activeVideos[currentTab || 0]"
        style="width: 100%; height: calc(100% - 32px)"
        :show-t-l="showTL"
        :hint-connect-live-t-l="hintConnectLiveTL"
        :show-live-chat="setShowChat"
        fluid
        :scale="scale"
        :current-time="currentTime"
      />
    </template>
  </div>
</template>

<script lang="ts">
import WatchLiveChat from "@/components/watch/WatchLiveChat.vue";
import { Content } from "@/utils/mv-utils";
import { mapState } from "vuex";

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
        scale: {
            type: Number,
            default: 1,
        },
    },
    data() {
        return {
            // currentTab: 0,
            showTL: false,
            hintConnectLiveTL: false,
            newTL: 0,

            currentTime: 0,
            // timer: null,
            // showLiveChat: true,
        };
    },
    computed: {
        ...mapState("multiview", ["layoutContent"]),
        currentContent() {
            if (!this.activeVideos[this.currentTab]) return null;
            return Object.values(this.layoutContent).find(
                (x: Content) => x.id === this.activeVideos[this.currentTab].id,
            );
        },
        currentTab: {
            get() {
                return this.layoutContent[this.id].currentTab ?? 0;
            },
            set(value) {
                // const obj = this.layoutContent[this.id];
                // obj.currentTab = val;
                this.$store.commit("multiview/setLayoutContentWithKey", {
                    id: this.id,
                    key: "currentTab",
                    value,
                });
            },
        },
        twitchChatLink() {
            return `https://www.twitch.tv/embed/${this.activeVideos[this.currentTab || 0].id}/chat?parent=${
                window.location.hostname
            }${this.darkMode ? "&darkpopout" : ""}`;
        },
        darkMode() {
            return this.$store.state.settings.darkMode;
        },
        channels() {
            return this.activeVideos.map((video, index) => ({
                text: video.channel.name.split(" ")[0],
                value: index,
            }));
        },
    },
    watch: {
        currentTab() {
            // this.hintConnectLiveTL = false;
            this.savedTab = this.currentTab;
        },
        setShowTL(nw) {
            if (!this.hintConnectLiveTL) {
                this.hintConnectLiveTL = true;
                this.showTL = true;
                return;
            }
            this.showTL = nw;
        },
        activeVideos() {
            if (this.currentTab >= this.activeVideos.length) {
                this.currentTab = 0;
            }
        },
    },
    mounted() {
        this.currentTab = this.savedTab;
        // this.timer = setInterval(() => {
        //     // check if timer is needed for current video
        //     if (this.currentContent?.video?.status === "past") {
        //         this.currentTime = this.currentContent?.playerControls?.getCurrentTime();
        //     }
        // }, 1000);

        if (this.activeVideos.length > 1) {
            const curTabs = Object.values(this.layoutContent)
                .filter((l: Content) => l.type === "chat")
                .map((l: Content) => l.currentTab ?? 0);
            const newTab = curTabs.findIndex((current, index) => !curTabs.includes(index));
            this.currentTab = newTab > 0 ? newTab : 0;
        }
    },
    beforeDestroy() {
        if (this.timer) clearInterval(this.timer);
    },
};
</script>

<style>
/* Jank shrink select to 28px height */
.tabbed-chat-select.v-text-field--outlined > .v-input__control > .v-input__slot {
    min-height: 28px !important;
}
.tabbed-chat-select.v-text-field--outlined:not(.v-text-field--single-line) .v-select__selections {
    padding: 0;
}

.tabbed-chat-select .v-select__selections input {
    height: 28px;
}
.tabbed-chat-select .v-select__selections .v-select__selection--comma {
    margin: 0;
}
.tabbed-chat-select .v-input__append-inner {
    margin: 0px;
    margin-top: 2px;
}
</style>
