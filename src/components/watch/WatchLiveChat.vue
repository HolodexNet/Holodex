<template>
  <v-sheet
    class="watch-live-chat"
    :class="{
      'show-tl-overlay': showTlChat,
      'fluid': fluid,
      'mobile-live-chat': $store.state.isMobile,
    }"
  >
    <span v-if="showYtChat && !needExtension" class="loading-text">
      {{ $t("views.watch.chat.loading") }}
    </span>
    <!-- Archive translations for videos not upcoming/live -->
    <!-- 'chat-overlay': fixedBottom || fixedRight, -->
    <template v-if="canShowTLChat && showTlChat">
      <ArchiveTranslations
        v-show="showTlChat"
        v-if="isArchived && showTlChat"
        :video="video"
        :class="{
          'stick-bottom': $store.state.settings.liveTlStickBottom,
          'tl-full-height': !showYtChat,
        }"
        :style="{ height: tlChatHeight }"
        :current-time="currentTime"
        :use-local-subtitle-toggle="useLocalSubtitleToggle"
        @timeJump="time => $emit('timeJump', time)"
      />
      <!-- Live translations for upcoming/live videos -->
      <!-- 'chat-overlay': fixedBottom || fixedRight, -->
      <LiveTranslations
        v-else-if="firstTlConnect"
        v-show="showTlChat"
        :video="video"
        :class="{
          'stick-bottom': $store.state.settings.liveTlStickBottom,
          'tl-full-height': !showYtChat,
        }"
        :style="{ height: tlChatHeight }"
        :current-time="currentTime"
        :use-local-subtitle-toggle="useLocalSubtitleToggle"
        @videoUpdate="handleVideoUpdate"
      />
    </template>
    <template v-else-if="showTlChat">
      <div class="pa-2">
        This video is members only, please play the video to see TLdex and translations.
      </div>
    </template>
    <!--  -->
    <!-- Youtube scalable embedded window -->
    <div
      v-if="showYtChat && !needExtension"
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
    <div v-if="needExtension" class="pa-5">
      <i18n path="views.watch.chat.archiveNeedExtension" :tag="false">
        <template #0>
          <router-link to="/extension">
            Holodex+
          </router-link>
        </template>
      </i18n>
    </div>
  </v-sheet>
</template>

<script lang="ts">
import LiveTranslations from "@/components/chat/LiveTranslations.vue";

// Contains Live Chat iframe and Chat TLs, can show either one at both at the same time
export default {
    name: "WatchLiveChat",
    components: {
        LiveTranslations,
        ArchiveTranslations: () => import("@/components/chat/ArchiveTranslations.vue"),
    },
    props: {
        video: {
            type: Object,
            default: null,
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
        useLocalSubtitleToggle: Boolean,
    },
    data() {
        return {
            firstTlConnect: false,
            // @ts-ignore
            needExtension: !window.ARCHIVE_CHAT_OVERRIDE && this.video.status === "past",
        };
    },
    computed: {
        canShowTLChat() {
            console.log(this.currentTime, this.video.topic_id);
            return (this.video.topic_id === "membersonly" && this.currentTime > 0) || (this.video.topic_id !== "membersonly");
        },
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
                ...this.video.status === "past" && { c: this.video.channel?.id },
            };
            const q = new URLSearchParams(query).toString();
            if (this.video.status === "past") {
                return `https://www.youtube.com/redirect_replay_chat?${q}`;
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
        updateFrameTime(t = this.currentTime) {
            if (this.video.status === "past") {
                this.$refs.ytChat?.contentWindow.postMessage({ "yt-player-video-progress": t }, "*");
            }
        },
    },
};
</script>

<style lang="scss">
.watch-live-chat.mobile-live-chat {
    margin-right: 0px; /*calc(env(safe-area-inset-right) - 15px)*/
    // margin-right: calc(env(safe-area-inset-right) / 2);
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
    z-index: 3;
}

/* Desktop */
.watch-live-chat {
    // height: 600px;
    min-height: calc((75vw - 24px) * 0.5625);
    min-height: min(calc((75vw - 24px) * 0.5625), calc(100vh - 120px));
    border: solid 1px rgba(255, 255, 255, 0.1);
    position: relative;
    display: flex;
    flex-direction: column;
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
        height: 100% !important;
        max-height: 100%;
        padding-bottom: 0;
        padding-bottom: calc(env(safe-area-inset-bottom) / 1.75);
    }
}

.stick-bottom {
    order: 2;
}
</style>
