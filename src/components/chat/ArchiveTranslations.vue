<template>
  <v-card
    class="text-body-2 tl-overlay"
    tile
    flat
    style="width: 100%"
  >
    <v-card-subtitle class="py-1 d-flex justify-space-between">
      <div>TLdex [{{ liveTlLang }}]</div>
      <span>
        <v-btn
          v-if="!hideSubtitleButton"
          icon
          x-small
          class="mr-1"
          title="Show Subtitle"
          @click="liveTlShowSubtitle = !liveTlShowSubtitle"
        >
          <v-icon :color="liveTlShowSubtitle && 'primary'">
            {{ mdiSubtitlesOutline }}
          </v-icon>
        </v-btn>
        <v-dialog v-model="expanded" width="800">
          <template #activator="{ on, attrs }">
            <v-btn
              icon
              x-small
              v-bind="attrs"
              v-on="on"
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
              <v-btn text color="red" @click="expanded = false">{{ $t("views.app.close_btn") }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <WatchLiveTranslationsSetting />
      </span>
    </v-card-subtitle>
    <v-divider />
    <portal to="expandedMessage" :disabled="!expanded" slim>
      <virtual-list
        ref="tlBody"
        class="archive tl-body px-1 py-0 px-lg-3"
        :style="{
          'font-size': liveTlFontSize + 'px',
        }"
        :data-component="ChatMessage"
        :data-key="getKey"
        :data-sources="dividedTLs"
        :item-height="20"
        :item-class-add="activeClass"
        :keeps="50"
        @click.native="handleClick"
      />
    </portal>
    <portal v-if="liveTlShowSubtitle" :to="`${video.id}-overlay`">
      <WatchSubtitleOverlay :messages="toDisplay" />
    </portal>
  </v-card>
</template>

<script lang="ts">
import VirtualList from "vue-virtual-scroll-list";
import WatchLiveTranslationsSetting from "./LiveTranslationsSetting.vue";
import ChatMessage from "./ChatMessage.vue";
import chatMixin from "./chatMixin";
import WatchSubtitleOverlay from "../watch/WatchSubtitleOverlay.vue";

export default {
    name: "ArchiveTranslations",
    components: {
        WatchLiveTranslationsSetting,
        VirtualList,
        WatchSubtitleOverlay,
    },
    mixins: [chatMixin],
    data() {
        return {
            ChatMessage,
            curIndex: 0,
        };
    },
    computed: {
        dividedTLs() {
            this.tlHistory.forEach((item, index, arr) => {
                item.shouldHideAuthor = index > 0 && (!(index === 0
                    || index === arr.length - 1
                    || item.name !== arr[index - 1].name
                    || !!item.breakpoint));
            });
            return this.tlHistory;
        },
        toDisplay() {
            if (!this.tlHistory.length || this.liveTlShowSubtitle) return [];
            const startIdx = Math.max(this.curIndex - 1, 0);
            // Grab previous and current message
            const buffer = this.tlHistory.slice(startIdx, startIdx + 2);
            return buffer.filter((m) => {
                const displayTime = (m.message.length * (65 / 1000)) + 1.8;
                return this.currentTime >= m.relativeSeconds && this.currentTime < m.relativeSeconds + displayTime;
            });
        },
    },
    watch: {
        liveTlLang() {
            this.loadMessages(true, true);
        },
        currentTime(time) {
            if (!this.tlHistory.length) return;
            const cur = this.tlHistory[this.curIndex].relativeSeconds;
            // time jumped forward too fast, or backwards. Exhaustive search for next spot

            const startIndex = time < cur ? 0 : this.curIndex;
            for (let i = startIndex; i < this.tlHistory.length; i += 1) {
                if (i === this.tlHistory.length - 1) {
                    this.curIndex = this.tlHistory.length - 1;
                    return;
                }
                if (time <= this.tlHistory[i].relativeSeconds) {
                    this.curIndex = Math.max(i - 1, 0);
                    return;
                }
            }
        },
        curIndex(idx) {
            this.scrollToIndex(idx);
        },
    },
    created() {
        this.loadMessages(true, true);
    },
    methods: {
        activeClass(index) {
            return index === this.curIndex ? "active-message" : "";
        },
        getKey(item) {
            return item.timestamp + item.message + item.name;
        },
        handleClick(e) {
            if (e.target.matches(".tl-message, .tl-message *")) {
                this.$emit("timeJump", +e.target.parentElement.getAttribute("data-time"), true, true);
                e.preventDefault();
            }
        },

        scrollToIndex(idx) {
            const ref = this.$refs.tlBody;
            const idxSize = ref.virtual.sizes.get(idx) ?? 50;
            const idxOffset = ref.virtual.getOffset(idx);
            const nearBottom = idxOffset + ref.getClientSize() > ref.getScrollSize();
            if (nearBottom) {
                ref.scrollToBottom();
            } else {
                ref.scrollToOffset(idxOffset - (ref.getClientSize() / 2) + idxSize);
            }
        },
    },
};
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
</style>
