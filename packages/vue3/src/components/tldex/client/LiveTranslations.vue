<template>
  <v-card class="text-body-2 tl-overlay" tile flat style="width: 100%">
    <v-overlay
      absolute
      :value="showOverlay || (!forceCloseOverlay && !socket.connected)"
      opacity="0.8"
    >
      <div v-if="!socket.connected">
        {{ $t("views.watch.chat.loading") }}
      </div>
      <div v-else class="pa-3">
        {{ overlayMessage }}
      </div>
      <v-btn v-if="!socket.connected" class="mr-2" @click="tlJoin()">
        {{ $t("views.watch.chat.retryBtn") }}
      </v-btn>
      <v-btn
        @click="
          () => {
            forceCloseOverlay = true;
            showOverlay = false;
          }
        "
      >
        {{ $t("views.app.close_btn") }}
      </v-btn>
    </v-overlay>
    <v-card-subtitle class="py-1 flex justify-between">
      <div :class="success ? 'text-success' : 'text-error'">
        TLdex [{{ tlLang }}]
      </div>
      <span>
        <v-btn
          v-if="!tlClient"
          icon
          x-small
          class="mr-1"
          :title="$t('views.watch.chat.showSubtitle')"
          @click="chatMixin.showSubtitle.value = !chatMixin.showSubtitle.value"
        >
          <v-icon :color="chatMixin.showSubtitle.value ? 'primary' : ''">
            {{ mdiSubtitlesOutline }}
          </v-icon>
        </v-btn>
        <v-dialog v-if="!tlClient" v-model="expanded" width="800">
          <template #activator="{ props }">
            <v-btn
              icon
              x-small
              v-bind="props"
              class="mr-1"
              :title="$t('views.watch.chat.expandTL')"
            >
              <v-icon>
                {{ mdiArrowExpand }}
              </v-icon>
            </v-btn>
          </template>

          <v-card>
            <portal-target name="expandedMessage" class="d-flex tl-expanded" />
            <v-divider />
            <v-card-actions>
              <v-spacer />
              <v-btn text color="red" @click="expanded = false">
                {{ $t("views.app.close_btn") }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <WatchLiveTranslationsSetting />
      </span>
    </v-card-subtitle>
    <v-divider />
    <portal to="expandedMessage" :disabled="!expanded" slim>
      <message-renderer
        ref="tlBody"
        :tl-history="filteredMessages"
        :font-size="tldex.liveTlFontSize"
      >
        <v-btn
          v-if="!chatMixin.tlHistoryLoading"
          text
          color="primary"
          :disabled="chatMixin.tlHistoryCompleted.value"
          @click="chatMixin.loadMessages(false, tlClient)"
        >
          {{
            chatMixin.tlHistoryCompleted
              ? $t("views.watch.chat.tlStart")
              : $t("component.description.showMore")
          }}
        </v-btn>
        <div
          v-if="chatMixin.tlHistory.value.length - filteredMessages.length > 0"
          class="text-caption"
        >
          {{ chatMixin.tlHistory.value.length - filteredMessages.length }}
          Blocked Messages
        </div>
        <v-btn
          v-if="
            !chatMixin.tlHistoryCompleted.value &&
            !chatMixin.tlHistoryLoading &&
            expanded
          "
          text
          color="primary"
          @click="chatMixin.loadMessages(true, tlClient)"
        >
          Load All
        </v-btn>
      </message-renderer>
    </portal>

    <portal v-if="chatMixin.showSubtitle" :to="`${videoId}-overlay`">
      <WatchSubtitleOverlay :messages="toDisplay" />
    </portal>
  </v-card>
</template>

<script lang="ts">
import { dayjs } from "@/utils/time";
import {
  useChatMixin,
  parseMessage,
  MESSAGE_TYPES,
  Message,
} from "./chatMixin";
import { useSocket } from "@/stores/socket";
import { mdiArrowExpand, mdiSubtitlesOutline } from "@mdi/js";
import { PropType } from "vue";

const socketEvents = [
  "reconnect_attempt",
  "reconnect_failed",
  "connect_error",
  "connect",
  "disconnect",
  "subscribeSuccess",
  "subscribeError",
] as const;

export default defineComponent({
  name: "LiveTranslations",
  components: {},
  props: {
    tlLang: {
      type: String,
      default: "",
    },
    tlClient: {
      type: Boolean,
      default: false,
    },
    videoId: {
      type: String,
      required: true,
    },
    video: {
      type: Object as PropType<Video>,
      required: false,
      default: undefined,
    },
    videoStartTimestamp: {
      type: Number,
      default: 0,
    },
    useLocalSubtitleToggle: {
      type: Boolean,
      default: false,
    },
    currentTime: {
      type: Number,
      default: 0,
    },
  },
  emits: ["videoUpdate"],
  setup(props) {
    const socket = useSocket();
    const chatMixin = useChatMixin(
      toRef(props, "videoId"),
      toRef(props, "tlLang"),
      toRef(props, "useLocalSubtitleToggle"),
      !props.tlClient
    );

    return { socket, chatMixin, tldex: chatMixin.tldex };
  },
  data() {
    return {
      overlayMessage: this.$t("views.watch.chat.loading"),
      showOverlay: false,
      forceCloseOverlay: false,
      isLoading: true,
      success: false,
      selectedChannel: "",
      expanded: false,

      mdiArrowExpand,
      mdiSubtitlesOutline,
    };
  },
  //   sockets: {
  //     reconnect_attempt(attempt) {
  //       console.log("[TLdex] Reconnecting...");
  //       const vm = this as any;
  //       vm.overlayMessage = `${this.$t(
  //         "views.watch.chat.status.reconnecting"
  //       )} ${attempt}/10`;
  //     },
  //     reconnect_failed() {
  //       const vm = this as any;
  //       vm.overlayMessage = this.$t("views.watch.chat.status.reconnectFailed");
  //     },
  //     connect_error() {
  //       console.error("[TLdex] Connect Errored...");
  //       const vm = this as any;
  //       vm.overlayMessage = this.$t("views.watch.chat.status.reconnectFailed");
  //     },
  //     connect() {
  //       console.log("[TLdex] Connected...");
  //       const vm = this as any;
  //       vm.tlJoin();
  //     },
  //     disconnect() {
  //       console.log("[TLdex] Disconnected...");
  //       const vm = this as any;
  //       vm.tlLeave();
  //     },
  //     // Sucessfully connected to live stream chat
  //     subscribeSuccess(obj) {
  //       const vm = this as any;
  //       // make sure to not listen to duplicate events of the same id (i.e. same chat room open in mv)
  //       if (obj.id === vm.video.id && !vm.success) {
  //         console.log("Subbed to", vm.liveTlLang, obj.id);
  //         vm.success = true;
  //         vm.registerListener();
  //         vm.$store.commit("incrementActiveSockets");
  //       }
  //       this.$emit("videoUpdate", obj);
  //       vm.showOverlay = false;
  //       vm.isLoading = false;
  //     },
  //     // Failed to join the chat room
  //     subscribeError(obj) {
  //       const vm = this as any;
  //       if (obj.id === vm.video.id) {
  //         vm.overlayMessage = obj.message;
  //         vm.isLoading = false;
  //         vm.showOverlay = true;
  //       }
  //     },
  //   },
  computed: {
    toDisplay() {
      if (!this.filteredMessages.length || !this.chatMixin.showSubtitle)
        return [];
      const buffer = this.filteredMessages.slice(-2);
      return buffer.filter((m) => {
        const displayTime = +(m.duration || m.message.length * 65 + 1800);
        // Use receivedAt and Date.now for consistency, since live streams can have many forms of delay
        // We just want to display messages for a certain period of time after they are received
        const receivedRelativeSec = m.receivedAt
          ? m.receivedAt - this.videoStartTimestamp
          : m.relativeMs ?? 0;
        const curTime = Date.now() - this.videoStartTimestamp;
        // Bind updates to currentTime (pausing video will pause overlay)
        return (
          this.currentTime &&
          curTime >= receivedRelativeSec &&
          curTime < receivedRelativeSec + displayTime
        );
      });
    },
    blockedNames() {
      return new Set(this.tldex.liveTlBlocked);
    },
    filteredMessages() {
      return this.chatMixin.tlHistory.value.filter(
        (m) => !this.blockedNames.has(m.name)
      );
    },
  },
  watch: {
    tlLang(nw, old) {
      this.switchLanguage(nw, old);
    },
    tlHistory() {
      this.$nextTick(() => {
        (this.$refs.tlBody as any).scrollToBottom();
      });
    },
  },
  mounted() {
    console.debug("Mounted");
    socketEvents.forEach((e) => {
      this.socket.socket.on(e, this[e]);
    });
    if (this.socket.connected) {
      this.tlJoin();
    } else {
      this.initSocket();
    }
  },
  beforeUnmount() {
    socketEvents.forEach((e) => {
      this.socket.socket.off(e, this[e]);
    });
    this.tlLeave();
  },
  methods: {
    toggleBlockName(name: string) {
      this.tldex.blockUser(name);
    },
    registerListener() {
      this.socket.socket.on(
        `${this.videoId}/${this.tlLang}`,
        this.handleMessage
      );
    },
    unregisterListener() {
      this.socket.socket.off(
        `${this.videoId}/${this.tlLang}`,
        this.handleMessage
      );
    },
    handleMessage(msg: Message) {
      // if no type, process as regular message
      if (!msg.type) {
        // ignore blocked channels, moderator and verified messages if disabled
        if (this.blockedNames.has(msg.name)) return;

        if (this.tlClient) {
          if (
            msg.is_tl ||
            msg.is_owner ||
            (msg.is_vtuber && this.tldex.liveTlShowVtuber) ||
            (msg.is_moderator && this.tldex.liveTlShowModerator) ||
            (msg.is_verified && this.tldex.liveTlShowVerified)
          ) {
            const parsedMessage = parseMessage(msg);
            parsedMessage.receivedAt = Date.now();
            this.chatMixin.tlHistory.value.push(parsedMessage);
          }
        } else if (
          msg.is_tl ||
          msg.is_owner ||
          (msg.is_vtuber && this.tldex.liveTlShowVtuber) ||
          (msg.is_moderator && this.tldex.liveTlShowModerator) ||
          (msg.is_verified && this.tldex.liveTlShowVerified)
        ) {
          const parsedMessage = parseMessage(msg);
          parsedMessage.receivedAt = Date.now();
          this.chatMixin.tlHistory.value.push(parsedMessage);
        }
        return;
      }
      switch (msg.type) {
        case MESSAGE_TYPES.UPDATE:
          this.$emit("videoUpdate", msg);
          break;
        case MESSAGE_TYPES.END:
          this.overlayMessage = msg.message;
          this.tlLeave();
          break;
        case MESSAGE_TYPES.ERROR:
          this.overlayMessage = "An unexpected error occured";
          this.tlLeave();
          break;
        default:
          break;
      }
    },
    tlJoin() {
      if (!this.initSocket()) return;

      console.log("TL JOIN()");
      // Grab first load chat history
      this.chatMixin.loadMessages(false, this.tlClient);

      // Another instance has already subscribed to this chat, just register listener
      if (
        this.socket.socket.listeners(`${this.videoId}/${this.tlLang}`).length >
        0
      ) {
        console.log("REGISTER TO LISTENER");
        this.registerListener();
        this.success = true;
        this.socket.activeSockets += 1;
      } else {
        // Try to join chat room with specified language
        console.log("EMIT: SUBSCRIBE to video");
        this.socket.socket.emit("subscribe", {
          video_id: this.videoId,
          lang: this.tlLang,
        });
      }
    },
    tlLeave() {
      const vm = this as any;
      // only disconnect and derement socket if it succeeded
      if (vm.success) {
        this.socket.activeSockets -= 1;
        console.log("[TLdex] Decrement sockets...");
        // Check if there's another listener depending on this subscription, unsub if not
        if (
          vm.socket.socket.listeners(`${this.videoId}/${this.tlLang}`).length <=
          1
        ) {
          console.log(
            `[TLdex] Trying to unsubscribe from chat ${vm.video.id} ${vm.liveTlLang}...`
          );
          vm.socket.socket.emit("unsubscribe", {
            video_id: vm.video.id,
            lang: vm.liveTlLang,
          });
        }
        vm.unregisterListener();
        console.log(
          `[TLdex] Unregistered listeners for ${vm.video.id} ${vm.liveTlLang}...`
        );
        // Reset for immediate reconnects
        setTimeout(() => {
          if (this.socket.activeSockets === 0) {
            this.socket.socket.disconnect();
          }
        }, 5000);
        vm.success = false;
      }
    },
    switchLanguage(newLang: string, oldLang: string) {
      // unsub from old langauge
      this.socket.socket.emit("unsubscribe", {
        video_id: this.videoId,
        lang: oldLang,
      });
      this.socket.socket.off(`${this.videoId}/${oldLang}`, this.handleMessage);
      this.success = false;
      this.tlJoin();
    },
    initSocket() {
      console.log("INIT SOCKET ENTER");
      // Disallow users from joining a chat room that doesn't exist yet
      // Backend will create a chatroom when it's 15 minutes before a stream
      if (
        this.video?.status !== "live" &&
        !dayjs().isAfter(
          dayjs(this.video?.start_scheduled).subtract(15, "minutes")
        )
      ) {
        this.overlayMessage = this.$t("views.watch.chat.status.notLive");
        this.showOverlay = true;
        console.log("INIT SOCKET EXIT  - STREAM NOT LIVE YET");

        return false;
      }

      // Start the unified socket if it isn't already
      if (!this.socket.connected) {
        console.log("INIT SOCKET ASK FOR CONNECT()");
        this.socket.socket.connect();
      }
      return true;
    },
    reconnect_attempt(attempt) {
      console.log("[TLdex] Reconnecting...");
      const vm = this as any;
      vm.overlayMessage = `${this.$t(
        "views.watch.chat.status.reconnecting"
      )} ${attempt}/10`;
    },
    reconnect_failed() {
      const vm = this as any;
      vm.overlayMessage = this.$t("views.watch.chat.status.reconnectFailed");
    },
    connect_error(e: any) {
      console.error(e);
      console.error("[TLdex] Connect Errored...");
      const vm = this as any;
      vm.overlayMessage = this.$t("views.watch.chat.status.reconnectFailed");
    },
    connect() {
      console.log("[TLdex] Connected...");
      const vm = this as any;
      vm.tlJoin();
    },
    disconnect() {
      console.log("[TLdex] Disconnected...");
      const vm = this as any;
      vm.tlLeave();
    },
    subscribeSuccess(obj: any) {
      // make sure to not listen to duplicate events of the same id (i.e. same chat room open in mv)
      if (obj.id === this.videoId && !this.success) {
        console.log("Subbed to", this.tlLang, obj?.id);
        this.success = true;
        this.registerListener();
        this.socket.activeSockets += 1;
      }
      this.$emit("videoUpdate", obj);
      this.showOverlay = false;
    },
    // Failed to join the chat room
    subscribeError(obj: any) {
      if (obj.id === this.videoId) {
        this.overlayMessage = obj.message;
        this.showOverlay = true;
      }
    },
  },
});
</script>

<style>
.v-overlay__content {
  text-align: center;
}

.tl-body {
  overflow-y: auto;
  overscroll-behavior: contain;
  height: calc(100% - 32px);
  display: flex;
  flex-direction: column-reverse;
  line-height: 1.35;
  letter-spacing: 0.0178571429em !important;
}

.tl-expanded {
  overscroll-behavior: auto !important;
  height: 75vh;
}

.tl-expanded > .tl-body {
  height: 75vh;
  width: 100%;
}

.tl-overlay {
  border: 1px solid rgba(65, 65, 65, 0.2) !important;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
</style>
