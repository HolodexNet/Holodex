<template>
  <div class="flex flex-row" :class="{ 'with-author': !hideAuthor }">
    <div
      v-if="source.is_vtuber && source.channel_id"
      style="min-width: 28px"
      class="mr-2"
    >
      <channel-img
        v-if="!hideAuthor"
        :channel="{ id: source.channel_id, name: source.name }"
        :size="28"
        rounded
        no-link
      />
    </div>
    <div style="flex-basis: 100%">
      <div v-if="!hideAuthor" :class="nameClass">
        <span class="tl-name tl-caption" @click="showBlockChannelDialog = true">
          <span v-if="source.is_vtuber">[Vt]</span>
          <div
            v-if="source.is_moderator"
            class="i-mdi:wrench font-sm mb-[-2px] inline-block"
          ></div>
          {{ source.name }}
          <span v-if="source.is_verified" style="font-weight: 800"> ✓</span>:
          <div class="i-mdi:cog font-sm tl-cog mb-[-2px] inline-block"></div>
        </span>
      </div>
      <a class="tl-message" :data-time="source.relativeMs / 1000">
        <span v-if="source.timestamp" class="tl-caption mr-1 opacity-75">
          {{ time }}
        </span>
        <!-- eslint-disable-next-line vue/no-v-html !-->
        <span v-if="source.parsed" v-html="source.parsed" />
        <span v-else>{{ source.message }}</span>
      </a>
    </div>
    <h-dialog v-model="showBlockChannelDialog">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">{{ source.name }}</h2>
          <div class="card-actions">
            <button
              v-if="source.channel_id"
              class="btn-md btn mr-1 bg-red-500 text-white"
              :href="`https://youtube.com/channel/${source.channel_id}`"
              target="_blank"
            >
              <div class="i-mdi:youtube text-xl" />
              Youtube
            </button>
            <button
              v-if="source.channel_id && source.is_vtuber"
              :href="`https://holodex.net/channel/${source.channel_id}`"
              target="_blank"
              class="btn mr-1 bg-secondary-400 text-white"
            >
              Holodex
            </button>
            <button
              class="btn-warning btn mr-1"
              @click="toggleBlockName(source.name)"
            >
              {{ !tldexStore.blockset.has(source.name) ? "Block" : "Unblock" }}
            </button>
          </div>
        </div>
      </div>
    </h-dialog>
  </div>
</template>

<script lang="ts">
import { dayjs, formatDuration } from "@/utils/time";
import { useTLStore } from "@/stores/tldex";

function realTimestamp(utc: any) {
  return dayjs(utc).format("LTS"); // localizedFormat
}

export default defineComponent({
  name: "ChatMessage",
  components: {},
  props: {
    source: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      default: 0,
    },
    hideAuthor: {
      type: Boolean,
    },
  },
  setup() {
    const tldexStore = useTLStore();

    return { tldexStore };
  },
  data() {
    return {
      showBlockChannelDialog: false,
    };
  },
  computed: {
    time() {
      return this.tldexStore.liveTlShowLocalTime || !this.source.relativeMs
        ? realTimestamp(this.source.timestamp)
        : (Math.sign(this.source.relativeMs) < 0 ? "-" : "") +
            formatDuration(Math.abs(this.source.relativeMs));
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
  },
  methods: {
    toggleBlockName(name: string) {
      this.tldexStore.toggleBlocked(name);
    },
  },
});
</script>

<style>
.tl-name,
.tl-message {
  word-break: break-word;
}

.tl-name {
  cursor: pointer;
  vertical-align: middle;
}
.tl-name .tl-cog {
  opacity: 0;
}

.tl-name:hover .tl-cog {
  opacity: 1;
}

.with-author {
  border-top: 1px solid #ffffff1f;
  margin-top: 4px;
  padding-top: 4px;
}

/* Emojis */
.tl-message img {
  width: auto;
  height: 1.3em;
  vertical-align: middle;
}

.tl-caption {
  letter-spacing: 0.0333333333em !important;
  font-size: 0.85em;
}
</style>
