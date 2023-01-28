<template>
  <div
    class="flex flex-row"
    :class="{ 'with-author': !hideAuthor && !source.shouldHideAuthor }"
  >
    <div
      v-if="source.is_vtuber && source.channel_id"
      style="min-width: 28px"
      class="mr-2"
    >
      <channel-img
        v-if="!hideAuthor && !source.shouldHideAuthor"
        class="align-self-center"
        :channel="{ id: source.channel_id, name: source.name }"
        :size="28"
        rounded
        no-link
      />
    </div>
    <div style="flex-basis: 100%">
      <div
        v-if="!hideAuthor && !source.shouldHideAuthor"
        :class="{
          'tl-caption': true,
          'text-primary': source.is_owner,
          'text-secondary':
            !source.is_owner &&
            (source.is_verified || source.is_moderator || source.is_vtuber),
        }"
      >
        <span class="tl-name" @click="showBlockChannelDialog = true">
          <!-- <span v-if="source.is_owner">👑</span> -->
          <span v-if="source.is_vtuber">[Vtuber]</span>
          <span v-if="source.is_moderator">[Mod]</span>
          <span v-if="source.source">{{ source.source }} - </span>
          {{ source.name
          }}<span v-if="source.is_verified" style="font-weight: 800"> ✓</span>:
          <v-icon
            x-small
            style="margin-top: 2px; position: absolute; width: 11px"
            >{{ icons.mdiCog }}</v-icon
          >
        </span>
      </div>
      <a class="tl-message" :data-time="source.relativeMs / 1000">
        <span v-if="source.timestamp" class="tl-caption mr-1">
          {{ time }}
        </span>
        <span
          v-if="source.parsed"
          class="text-primary"
          v-html="source.parsed"
        />
        <span v-else class="text-primary">{{ source.message }}</span>
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
  },
  methods: {
    toggleBlockName(name: string) {
      this.tldexStore.toggleBlocked(name);
    },
  },
});
</script>

<style>
.theme--light .tl-caption {
  color: hsla(0, 0%, 30%, 0.7);
}
.theme--dark .tl-caption {
  color: hsla(0, 0%, 70%, 0.7);
}

.tl-body .tl-caption {
  letter-spacing: 0.0333333333em !important;
  font-size: 0.85em;
}

.tl-name,
.tl-message {
  word-break: break-word;
}

.tl-name {
  cursor: pointer;
}
.tl-name .v-icon {
  opacity: 0;
}

.tl-name:hover .v-icon {
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
</style>
