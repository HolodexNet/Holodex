<template>
  <v-card
    class="text-body-2 tl-overlay"
    tile
    flat
    style="width: 100%"
  >
    <LiveTL />
  <!--
    <v-card-subtitle class="py-1 d-flex justify-space-between">
      <div>TLdex [{{ liveTlLang }}]</div>
      <span>
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
        :data-sources="tlHistory"
        :item-height="20"
        :item-class-add="activeClass"
        :keeps="50"
        @click.native="handleClick"
      />
    </portal>
  -->
  </v-card>
</template>

<script lang="ts">
import { dayjs } from "@/utils/time";
// import VirtualList from "vue-virtual-scroll-list";
// import WatchLiveTranslationsSetting from "./LiveTranslationsSetting.vue";
import ChatMessage from "./ChatMessage.vue";
import chatMixin from "./chatMixin";
import LiveTL from "./LiveTL.vue";

export default {
    name: "ArchiveTranslations",
    components: {
        // WatchLiveTranslationsSetting,
        // VirtualList,
        LiveTL,
    },
    mixins: [chatMixin],
    props: {
        currentTime: {
            type: Number,
            default: 0,
        },
    },
    data() {
        return {
            ChatMessage,
            curIndex: 0,
        };
    },
    computed: {
        startTimeUnix() {
            return Number(dayjs(this.video.start_actual || this.video.start_scheduled));
        },
    },
    watch: {
        liveTlLang() {
            this.loadMessages(true, true);
        },
        liveTlShowVerified() {
            this.loadMessages(true, true);
        },
        liveTlShowModerator() {
            this.loadMessages(true, true);
        },
        currentTime(time) {
            if (!this.tlHistory.length) return;
            const cur = this.getRelativeSecs(this.curIndex);
            // time jumped forward too fast, or backwards. Exhaustive search for next spot

            const startIndex = time < cur ? 0 : this.curIndex;
            for (let i = startIndex; i < this.tlHistory.length; i += 1) {
                if (i === this.tlHistory.length - 1) {
                    this.curIndex = this.tlHistory.length - 1;
                    return;
                }
                if (time <= this.getRelativeSecs(i)) {
                    this.curIndex = Math.max(i - 1, 0);
                    return;
                }
            }
        },
        curIndex(idx) {
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
    created() {
        this.loadMessages(true, true);
    },
    methods: {
        getRelativeSecs(index) {
            return (this.tlHistory[index].timestamp - this.startTimeUnix) / 1000;
        },
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
    line-height: 1.25em;
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
    height: calc(100% + 5px);
    background-size: cover;
    position: absolute;
    top: -1px;
    left: 0;
    z-index: -1;
}
</style>
