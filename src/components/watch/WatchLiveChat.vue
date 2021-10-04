<template>
  <v-sheet
    class="watch-live-chat"
    :class="{
      'fixed-bottom': fixedBottom,
      'fixed-right': fixedRight,
      'show-tl-overlay': showTlChat,
      'fluid': fluid,
    }"
  >
    <span v-if="showYtChat" class="loading-text">{{ $t("views.watch.chat.loading") }}</span>
    <!-- Archive translations for videos not upcoming/live -->
    <ArchiveTranslations
      v-show="showTlChat"
      v-if="isArchived"
      :video="video"
      :class="{
        'chat-overlay': fixedBottom || fixedRight,
        'chat-overlay-stickbottom': $store.state.settings.liveTlStickBottom,
        'tl-full-height': !showYtChat,
      }"
      :style="{ height: tlChatHeight }"
      :current-time="currentTime"
      @timeJump="time => $emit('timeJump', time)"
    />
    <!-- Live translations for upcoming/live videos -->
    <LiveTranslations
      v-else-if="firstTlConnect"
      v-show="showTlChat"
      :video="video"
      :class="{
        'chat-overlay': fixedBottom || fixedRight,
        'chat-overlay-stickbottom': $store.state.settings.liveTlStickBottom,
        'tl-full-height': !showYtChat,
      }"
      :style="{ height: tlChatHeight }"
      @videoUpdate="handleVideoUpdate"
    />

    <!-- Youtube scalable embedded window -->
    <div
      v-if="showYtChat"
      class="embedded-chat"
      :style="{ height: ytChatHeight }"
    >
      <iframe
        ref="ytChat"
        :src="liveChatUrl"
        frameborder="0"
        :style="scaledStyle"
        @load="updateFrameTime()"
      />
    </div>
  </v-sheet>
</template>

<script lang="ts">
import LiveTranslations from "@/components/chat/LiveTranslations.vue";
import ArchiveTranslations from "@/components/chat/ArchiveTranslations.vue";

// Contains Live Chat iframe and Chat TLs, can show either one at both at the same time
export default {
    name: "WatchLiveChat",
    components: {
        LiveTranslations,
        ArchiveTranslations,
    },
    props: {
        video: {
            type: Object,
            default: null,
        },
        fixedBottom: {
            type: Boolean,
            default: false,
        },
        fixedRight: {
            type: Boolean,
            default: false,
        },
        fluid: {
            type: Boolean,
            default: false,
        },
        currentTime: {
            type: Number,
            default: 0,
        },
        scale: {
            type: Number,
            default: 1,
        },
        value: {
            type: Object,
            required: true,
            default: () => ({
                showTlChat: false,
                showYtChat: true,
            }),
        },
    },
    data() {
        return {
            firstTlConnect: false,
        };
    },
    computed: {
        showTlChat() {
            return this.value.showTlChat;
        },
        showYtChat() {
            return this.value.showYtChat;
        },
        liveChatUrl() {
            if (!this.video) return null;
            const query = {
                v: this.video.id,
                embed_domain: window.location.hostname,
                dark_theme: this.$vuetify.theme.dark ? "1" : "0",
                ...this.video.status === "past" && { c: this.video.channel.id },
            };
            const q = new URLSearchParams(query).toString();
            if (this.video.status === "past") {
                return `/live_chat_replay?${q}`;
            }
            return `https://www.youtube.com/live_chat?${q}`;
        },
        scaledStyle() {
            // Scale chat by scale %
            return this.scale !== 1 ? {
                transform: `scale(${this.scale})`,
                height: `${100 / this.scale}%`,
                width: `${100 / this.scale}%`,
                "transform-origin": "top left",
            } : {};
        },
        ytChatHeight() {
            // Set height of chat if setting exists
            return this.$store.state.settings.liveTlWindowSize > 0
                && this.showTlChat
                && !this.fixedBottom
                && !this.fixedRight
                ? `${(100 - this.$store.state.settings.liveTlWindowSize)}%`
                : "";
        },
        tlChatHeight() {
            // Opposite of above
            return this.showYtChat
                && this.$store.state.settings.liveTlWindowSize > 0
                ? `${this.$store.state.settings.liveTlWindowSize}%`
                : "";
        },
        isArchived() {
            return !["upcoming", "live"].includes(this.video.status);
        },
    },
    watch: {
        showTlChat() {
            // Lazy load socket before first v-show
            if (!this.firstTlConnect) this.firstTlConnect = true;
        },
        currentTime() {
            this.updateFrameTime();
        },
    },
    mounted() {
        if (this.showTlChat) this.firstTlConnect = true;
    },
    methods: {
        handleVideoUpdate(update) {
            // bubble event to Watch view
            this.$emit("videoUpdate", update);
        },
        handleHistoryLength(length) {
            // in this case, bubble the event
            this.$emit("historyLength", length);
        },
        updateFrameTime(t = this.currentTime) {
            if (this.video.status === "past") {
                this.$refs.ytChat?.contentWindow.postMessage({ "yt-player-video-progress": t }, "*");
            }
        },
    },
};
</script>

<style lang="scss">
.watch-live-chat {
    position: relative;
}

.watch-live-chat.mobile-live-chat {
    margin-right: 0px; /*calc(env(safe-area-inset-right) - 15px)*/
    margin-right: calc(env(safe-area-inset-right) / 2);
}

/* center pre loading text */
.watch-live-chat .loading-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

/* iframe size is same as container */
.embedded-chat > iframe {
    position: absolute;
    width: 100%;
    height: 100%;
}

/* Desktop */
.watch-live-chat {
    height: 600px;
    min-height: calc((75vw - 24px) * 0.5625);
    min-height: min(calc((75vw - 24px) * 0.5625), calc(100vh - 120px));
    border: solid 1px rgba(255, 255, 255, 0.1);
}

.watch-live-chat.fluid {
    width: 100%;
    height: 100%;
    min-height: 0px !important;
}

.embedded-chat {
    position: relative;
    width: 100%;
    height: 100%;
}

/* tl box static size of 200 px */
.watch-live-chat.show-tl-overlay .embedded-chat {
    height: calc(100% - 250px);
}

.watch-live-chat.show-tl-overlay .tl-overlay {
    height: 250px;

    &.tl-full-height {
        position: absolute;
        height: 100%;
        max-height: 100%;
        padding-bottom: 0;
        padding-bottom: calc(env(safe-area-inset-bottom) / 1.75);
    }
}

/* Fixed Bottom */
.watch-live-chat.fixed-bottom {
    position: fixed;
    bottom: 0px;
    width: 100%;
    z-index: 2;
    height: calc(100% - 36px - 100vw * 0.5625);
    padding-bottom: 0;
    /* pre-iOS 11.2 */
    height: calc((100% - 36px - 100vw * 0.5625) - constant(safe-area-inset-top));
    padding-bottom: calc(constant(safe-area-inset-bottom) / 1.75);
    /* iOS 11.2 and later */
    height: calc((100% - 36px - 100vw * 0.5625) - env(safe-area-inset-top, 0px));
    padding-bottom: calc(env(safe-area-inset-bottom) / 1.75);
}

.watch-live-chat.fixed-bottom > .embedded-chat {
    position: relative;
    height: 100%;
}

.watch-live-chat.fixed-right > .tl-overlay,
.watch-live-chat.fixed-bottom > .tl-overlay {
    height: 45%;
}

/* Fixed Right */
.watch-live-chat.fixed-right {
    position: fixed;
    right: 0px;
    top: 0px;
    width: 220px;
    height: 100%;
}

.watch-live-chat.fixed-right > .embedded-chat {
    width: 100%;
    height: 100%;
}

.watch-live-chat.fixed-right > .embedded-chat > iframe {
    transform: scale(0.75);
    transform-origin: top left;
    height: 133%;
    width: 133%;
}

.chat-overlay {
    width: 100%;
    position: absolute;
    z-index: 3;
    top: 0;
}

.chat-overlay-stickbottom {
    bottom: 0;
    top: initial;
}
</style>
