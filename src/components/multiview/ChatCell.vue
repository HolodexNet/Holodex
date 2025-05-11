<template>
  <div class="cell-content">
    <!-- Top channel switch select -->
    <div class="d-flex flex-row align-center py-1">
      <v-btn
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
        icon
        small
        class="mx-1"
        :disabled="currentTab >= activeVideos.length - 1"
        @click="currentTab += 1"
      >
        <v-icon>{{ icons.mdiChevronRight }}</v-icon>
      </v-btn>
    </div>
    <!-- Yt/Twitch Chat window -->
    <template v-if="currentVideo && currentTab >= 0">
      <iframe
        v-if="currentVideo.type === 'twitch'"
        :src="twitchChatLink"
        style="width: 100%; height: calc(100% - 32px)"
        frameborder="0"
      />
      <WatchLiveChat
        v-else
        :key="'wlc' + currentVideo.id"
        v-model="chatStatus"
        :video="currentVideo"
        fluid
        :scale="scale"
        :current-time="currentTime"
        :use-local-subtitle-toggle="true"
        @videoUpdate="handleVideoUpdate"
      />
    </template>
    <div v-else style="height: 100%" />
    <!-- Bottom tl/chat toggle controls -->
    <div v-if="!editMode" class="d-flex">
      <v-btn
        x-small
        width="50%"
        class="flex-shrink-1"
        @click="editMode = !editMode"
      >
        <v-icon small class="mr-1">
          {{ icons.mdiPencil }}
        </v-icon>
        <template v-if="cellWidth > 200">
          {{ $t("component.videoCard.edit") }}
        </template>
      </v-btn>
      <v-btn
        width="25%"
        :color="showYtChat ? 'primary' : ''"
        x-small
        @click="toggleYtChat"
      >
        <v-icon small class="mr-1">
          {{ icons.ytChat }}
        </v-icon>
        <template v-if="cellWidth > 200">
          Chat
        </template>
      </v-btn>
      <v-btn
        width="25%"
        :color="showTlChat ? 'primary' : ''"
        x-small
        @click="toggleTlChat"
      >
        <v-icon small class="mr-1">
          {{ icons.tlChat }}
        </v-icon>
        <template v-if="cellWidth > 200">
          TL
        </template>
      </v-btn>
    </div>
    <!-- Edit mode cell controls -->
    <CellControl
      v-else
      :play-icon="icons.mdiCheck"
      @playpause="editMode = false"
      @back="resetCell"
      @delete="deleteCell"
    />
  </div>
</template>

<script lang="ts">
import WatchLiveChat from "@/components/watch/WatchLiveChat.vue";
import { mapState } from "vuex";
import CellMixin from "./CellMixin";
import CellControl from "./CellControl.vue";

export default {
    name: "ChatCell",
    components: {
        WatchLiveChat,
        CellControl,
    },
    mixins: [CellMixin],
    props: {
        item: {
            type: Object,
            required: true,
        },
        cellWidth: {
            type: Number,
            default: 0,
        },
        mode: {
            // 0: auto, 1: yt, 2: tl, 3: both
            type: Number,
            required: false,
            default: 0,
        },
    },
    data() {
        return {
            showTlChat: this.mode === 3 || this.mode === 2 || (this.mode === 0 && this.$store.state.multiview.defaultShowTlChat),
            showYtChat: this.mode === 3 || this.mode === 1 || (this.mode === 0 && this.$store.state.multiview.defaultShowYtChat),
            scale: 1,
        };
    },
    computed: {
        chatStatus: {
            get() {
                return {
                    showTlChat: this.showTlChat,
                    showYtChat: this.showYtChat,
                };
            },
            set(val: any) {
                this.showTlChat = val.showTlChat;
                this.showYtChat = val.showYtChat;
            },
        },
        ...mapState("multiview", ["layoutContent"]),
        currentVideo() {
            if (!this.activeVideos.length || this.currentTab >= this.activeVideos.length) return null;
            return this.activeVideos[this.currentTab] || this.activeVideos[0];
        },
        currentTab: {
            get() {
                return this.layoutContent[this.item.i].currentTab ?? 0;
            },
            set(value) {
                this.$store.commit("multiview/setLayoutContentWithKey", {
                    id: this.item.i,
                    key: "currentTab",
                    value,
                });
            },
        },
        twitchChatLink() {
            return `https://www.twitch.tv/embed/${this.currentVideo.id}/chat?parent=${
                window.location.hostname
            }${this.darkMode ? "&darkpopout" : ""}`;
        },
        darkMode() {
            return this.$store.state.settings.darkMode;
        },
        channels() {
            return this.activeVideos.map((video, index) => ({
                text: video.channel[this.$store.state.settings.nameProperty] || video.channel.name,
                value: index,
            }));
        },
        videoCellId() {
            return Object.keys(this.layoutContent).find((key) => this.layoutContent[key].video === this.currentVideo);
        },
        currentTime() {
            return this.layoutContent[this.videoCellId].currentTime || 0;
        },
    },
    watch: {
        cellWidth() {
            // Scale chat based on cell size
            this.checkScale();
        },
        cellContent(nw) {
            if (nw.type === "chat") {
                this.editMode = false;
            }
        },
    },
    created() {
        // Chat is non paused by default
        this.editMode = false;
        this.checkScale();
    },
    methods: {
        checkScale() {
            // width breakpoints where 150 < width < 200 => scale = 0.6
            const widths = [150, 200, 250, 300, 350];
            const scale = [0.5, 0.6, 0.75, 0.85, 1];
            const idx = widths.findIndex((w) => this.cellWidth < w);
            this.scale = idx >= 0 ? scale[idx] : 1;
        },
        toggleYtChat() {
            this.showYtChat = !this.showYtChat;
            if (!this.showYtChat) this.showTlChat = true;
            this.$store.commit("multiview/setLayoutContentWithKey", {
                id: this.item.i,
                key: "mode",
                value: (this.showYtChat ? 1 : 0) + (this.showTlChat ? 2 : 0),
            });
        },
        toggleTlChat() {
            this.showTlChat = !this.showTlChat;
            if (!this.showTlChat) this.showYtChat = true;
            this.$store.commit("multiview/setLayoutContentWithKey", {
                id: this.item.i,
                key: "mode",
                value: (this.showYtChat ? 1 : 0) + (this.showTlChat ? 2 : 0),
            });
        },
        handleVideoUpdate(update) {
            const v = this.layoutContent[this.videoCellId].video;
            if (v.id !== update.id || !update?.status || !update?.start_actual) return;
            if (v.status !== update.status || v.start_actual !== update.start_actual) {
                this.$store.commit("multiview/setLayoutContentWithKey", {
                    id: this.videoCellId,
                    key: "video",
                    value: { ...v, ...update },
                });
            }
        },
    },
};
</script>

<style>
.tabbed-chat-select {
  min-width: 0;
}
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

.chat-btns {
  display: flex;
}
</style>
