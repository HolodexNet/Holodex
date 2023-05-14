<template>
  <div
    class="flex flex-row"
    :class="{
      'with-author': !hideAuthor,
    }"
  >
    <div
      v-if="source.is_vtuber && source.channel_id"
      style="min-width: 28px"
      class="mr-2"
    >
      <channel-img
        v-if="!hideAuthor"
        :channel="{ id: source.channel_id, name: source.name }"
        :size="28"
        no-link
      />
    </div>
    <div class="basis-full">
      <div v-if="!hideAuthor" :class="nameClass">
        <span
          class="chat-name chat-caption relative"
          @click="
            openBlockDialog(source.name, source.channel_id, source.is_vtuber)
          "
        >
          <h-icon
            v-if="isFavorited"
            class="i-mdi:heart mb-[-2px] mr-1 text-red-500"
          />
          <span v-if="source.is_vtuber">[Vt]</span>
          <div
            v-if="source.is_moderator"
            class="i-mdi:wrench font-sm mb-[-2px] inline-block"
          />
          {{ source.name }}
          <span v-if="source.is_verified" style="font-weight: 800">✓</span>
          :
          <div class="i-mdi:cog font-sm chat-cog absolute mt-1 inline-block" />
        </span>
      </div>
      <a
        class="chat-message timestamp-link"
        :data-time="source.video_offset"
        :data-video="source.video_id"
      >
        <span
          v-if="source.timestamp"
          class="chat-caption chat-time mr-1 opacity-75"
        >
          {{ time }}
        </span>
        <!-- eslint-disable-next-line vue/no-v-html !-->
        <span v-if="source.parsed" v-html="source.parsed" />
        <span v-else>{{ source.message }}</span>
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { dayjs, formatDuration } from "@/utils/time";
import { useTLStore } from "@/stores/tldex";
import { useFavoritesIDSet } from "@/services/favorites";
import type { ParsedMessage } from "@/stores/socket_types";
function realTimestamp(utc: any) {
  return dayjs(utc).format("LTS"); // localizedFormat
}

export default defineComponent({
  name: "ChatMessage",
  components: {},
  props: {
    source: {
      type: Object as PropType<ParsedMessage>,
      required: true,
    },
    index: {
      type: Number,
      default: 0,
    },
    hideAuthor: {
      type: Boolean,
    },
    highlightedIndexes: {
      type: Object as PropType<number[]>,
      default: undefined,
    },
  },
  setup() {
    const tldexStore = useTLStore();
    const favList = useFavoritesIDSet();

    const { openBlockDialog } = inject("showChannelBlockDialog") as any;
    return { tldexStore, favList, openBlockDialog };
  },
  computed: {
    time() {
      return this.tldexStore.liveTlShowLocalTime || !this.source.video_offset
        ? realTimestamp(this.source.timestamp)
        : (Math.sign(this.source.video_offset) < 0 ? "-" : "") +
            formatDuration(Math.abs(this.source.video_offset * 1000));
    },
    nameClass() {
      const { is_owner, is_verified, is_vtuber, is_moderator } = this.source;
      switch (true) {
        case is_owner:
          return "text-primary";
        case is_verified || is_moderator || is_vtuber:
          return "text-secondary";
        default:
          return "opacity-75";
      }
    },
    isFavorited() {
      return this.favList?.has(this.source.channel_id || "_");
    },
  },
});
</script>

<style>
.chat-name,
.chat-message {
  cursor: pointer;
  word-break: break-word;
  @apply block;
}

.chat-name {
  cursor: pointer;
  vertical-align: middle;
}
.chat-name .chat-cog {
  opacity: 0;
}

.chat-name:hover .chat-cog {
  opacity: 1;
}

.with-author {
  border-top: 1px solid #ffffff1f;
  margin-top: 4px;
  padding-top: 4px;
}

/* Emojis */
.chat-message img {
  width: auto;
  height: 1.3em;
  vertical-align: middle;
  display: inline;
}

.chat-caption {
  /* letter-spacing: 0.0333333333em !important; */
  font-size: 0.75rem;
}

.highlighted .chat-message {
  @apply bg-primary-800 bg-opacity-30 text-primary-focus;
}
/* .chat-time {
  display: inline-block;
  width: 45px;
  text-align: end;
} */
</style>
