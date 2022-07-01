<template>
  <v-card class="text-body-2 tl-overlay" tile flat style="width: 100%">
    <v-card-subtitle class="py-1 flex justify-between">
      <div>TLdex [{{ tldex.liveTlLang }}]</div>
      <span>
        <v-btn
          icon
          x-small
          class="mr-1"
          title="-2s"
          @click="timeOffset -= 2000"
        >
          <v-icon>
            {{ mdiTransferLeft }}
          </v-icon>
        </v-btn>
        <code class="mr-1">{{
          `${timeOffset >= 0 ? "+" : ""}${timeOffset / 1000}s`
        }}</code>
        <v-btn
          icon
          x-small
          class="mr-1"
          title="+2s"
          @click="timeOffset += 2000"
        >
          <v-icon>
            {{ mdiTransferRight }}
          </v-icon>
        </v-btn>
        <v-btn
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
        <v-dialog v-model="expanded" width="800">
          <template #activator="{ props }">
            <v-btn
              icon
              x-small
              v-bind="props"
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
              <v-btn text color="red" @click="expanded = false">{{
                $t("views.app.close_btn")
              }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <WatchLiveTranslationsSetting />
      </span>
    </v-card-subtitle>
    <v-divider />
    <portal to="expandedMessage" :disabled="!expanded" slim>
      <!-- <virtual-list
        ref="tlBody"
        class="archive tl-body px-1 py-0 px-lg-3"
        :style="{
          'font-size': tldex.liveTlFontSize + 'px',
        }"
        :data-component="ChatMessage"
        :data-key="getKey"
        :data-sources="dividedTLs"
        :item-height="20"
        :item-class-add="addClass"
        :keeps="50"
        @click="handleClick"
      /> -->
      <message-v-renderer
        :messages="dividedTLs"
        @message-click="handleClick"
      ></message-v-renderer>
    </portal>
    <portal v-if="chatMixin.showSubtitle.value" :to="`${videoId}-overlay`">
      <WatchSubtitleOverlay :messages="toDisplay" />
    </portal>
  </v-card>
</template>

<script lang="ts">
import { mdiTransferRight, mdiTransferLeft } from "@mdi/js";
import {
  useChatMixin,
  parseMessage,
  MESSAGE_TYPES,
  Message,
} from "./chatMixin";
import { useSocket } from "@/stores/socket";
import { mdiArrowExpand, mdiSubtitlesOutline } from "@mdi/js";
import { PropType } from "vue";
import ChatMessage from "./ChatMessage.vue";

export default defineComponent({
  name: "ArchiveTranslations",
  props: {
    tlLang: {
      type: String,
      default: "",
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
  emits: ["timeJump"],
  setup(props) {
    const socket = useSocket();
    const chatMixin = useChatMixin(
      toRef(props, "videoId"),
      toRef(props, "tlLang"),
      toRef(props, "useLocalSubtitleToggle"),
      true
    );

    chatMixin.loadMessages(true);

    return { socket, chatMixin, tldex: chatMixin.tldex };
  },
  data() {
    return {
      expanded: false,
      ChatMessage,
      curIndex: 0,
      timeOffset: 0, // for offsetting archive TL
      mdiTransferRight,
      mdiTransferLeft,
      mdiSubtitlesOutline,
      mdiArrowExpand,
    };
  },
  computed: {
    dividedTLs() {
      const filtered = this.chatMixin.tlHistory.value.filter(
        (m) => !this.tldex.blockset.has(m.name)
      );
      return filtered.map((item, index, arr) => {
        const shouldHideAuthor =
          index > 0 &&
          !(
            index === 0 ||
            index === arr.length - 1 ||
            item.name !== arr[index - 1].name ||
            !!item.breakpoint
          );
        // timestamp is in milliseconds.
        const newtime = +item.timestamp + this.timeOffset;
        const relativeMs = (item.relativeMs || 0) + this.timeOffset;
        return { ...item, shouldHideAuthor, relativeMs, timestamp: newtime };
      });
    },
    toDisplay() {
      if (!this.dividedTLs.length || !this.chatMixin.showSubtitle.value) {
        return [];
      }
      const startIdx = Math.max(this.curIndex - 1, 0);
      // Grab previous and current message
      const buffer = this.dividedTLs.slice(startIdx, startIdx + 2);
      return buffer.filter((m) => {
        const displayTime = +(m.duration || m.message.length * 65 + 1800);
        return (
          this.currentTime * 1000 >= m.relativeMs &&
          this.currentTime * 1000 < m.relativeMs + displayTime
        );
      });
    },
  },
  watch: {
    liveTlLang() {
      this.chatMixin.loadMessages(true);
    },
    currentTime(time) {
      if (!this.dividedTLs.length) return;
      const msTime = time * 1000;
      const cur = this.dividedTLs[this.curIndex].relativeMs;
      // time jumped forward too fast, or backwards. Exhaustive search for next spot

      const startIndex = time < cur ? 0 : this.curIndex;
      for (
        let i = startIndex;
        i < this.chatMixin.tlHistory.value.length;
        i += 1
      ) {
        if (i === this.dividedTLs.length - 1) {
          this.curIndex = this.dividedTLs.length - 1;
          return;
        }
        if (msTime <= this.dividedTLs[i].relativeMs) {
          this.curIndex = Math.max(i - 1, 0);
          return;
        }
      }
    },
    curIndex(idx) {
      if (this.tldex.liveTlHideSpoiler) {
        this.$nextTick(() => {
          this.$refs.tlBody.scrollToBottom();
        });
      } else {
        this.scrollToIndex(idx);
      }
    },
  },
  methods: {
    addClass(index: number) {
      if (index === this.curIndex) {
        return "active-message";
      }
      if (this.tldex.liveTlHideSpoiler && index > this.curIndex) {
        return "hide-spoiler";
      }
      return "";
    },
    getKey(item: Message) {
      return item.timestamp + item.message + item.name;
    },
    handleClick(e: {
      target: {
        matches: (arg0: string) => any;
        parentElement: { getAttribute: (arg0: string) => string | number };
      };
      preventDefault: () => void;
    }) {
      if (e.target.matches(".tl-message, .tl-message *")) {
        this.$emit(
          "timeJump",
          +e.target.parentElement.getAttribute("data-time"),
          true,
          true
        );
        e.preventDefault();
      }
    },

    scrollToIndex(idx: any) {
      const ref: any = this.$refs.tlBody;
      const idxSize = ref.virtual.sizes.get(idx) ?? 50;
      const idxOffset = ref.virtual.getOffset(idx);
      const nearBottom = idxOffset + ref.getClientSize() > ref.getScrollSize();
      if (nearBottom) {
        ref.scrollToBottom();
      } else {
        ref.scrollToOffset(idxOffset - ref.getClientSize() / 2 + idxSize);
      }
    },
  },
});
</script>

<style>
.tl-body.archive {
  overflow-y: auto;
  position: relative;
  overscroll-behavior: contain;
  height: calc(100% - 32px);
  display: flex;
  flex-direction: column-reverse;
  flex-direction: column;
  line-height: 1.35;
  letter-spacing: 0.0178571429em !important;
}

.active-message {
  position: relative;
}
.active-message {
  z-index: 0;
}
.active-message .tl-message::before {
  content: "";
  background-color: var(--v-primary-base);
  opacity: 0.25;
  width: calc(100%);
  height: calc(100%);
  background-size: cover;
  position: absolute;
  top: -1px;
  left: 0;
  z-index: -1;
}
.hide-spoiler {
  display: none;
}
</style>
