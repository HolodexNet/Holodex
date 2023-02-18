<template>
  <div v-if="'id' in video" class="live-chat flex flex-col">
    <div class="flex h-10 items-center bg-bgColor-400 px-2">
      <slot name="top-bar">
        <button class="btn-icon btn-sm btn mx-1">
          <div class="i-mdi:arrow-collapse-right text-xl" />
        </button>
      </slot>
      <div class="btn-group ml-auto">
        <button
          class="btn-outline btn btn-primary btn-xs"
          :class="{ 'border-primary-600 bg-primary ': showTl }"
          @click="
            showTl = !showTl;
            showYt = showYt || (!showYt && !showTl);
          "
        >
          TL
        </button>
        <button
          class="btn-outline btn btn-primary btn-xs"
          :class="{ 'border-primary-600 bg-primary': showYt }"
          @click="
            showYt = !showYt;
            showTl = showTl || (!showYt && !showTl);
          "
        >
          YT
        </button>
      </div>
      <button class="btn-icon btn btn-sm mx-1">
        <div class="i-mdi:dots-vertical text-xl" />
      </button>
    </div>
    <TldexChat
      v-if="showTl"
      :video-id="video.id"
      :lang="'en'"
      :style="
        showYt
          ? `height: ${tldex.liveTlWindowSize * 100}%; resize: vertical`
          : ''
      "
      :start-time="
        video.available_at ? new Date(video.available_at) : undefined
      "
      :archive="!video.status || !['live', 'upcoming'].includes(video.status)"
    />
    <youtube-live-chat
      v-if="showYt"
      :video-id="video.id"
      :archive="video.status === 'past'"
      :channel-id="video.channel?.id"
      class="flex flex-grow"
    />
  </div>
</template>
<script lang="ts">
import { PropType } from "vue";
import TldexChat from "../tldex/client/TldexChat.vue";
import { useTLStore } from "@/stores/tldex";

interface YoutubeVideo {
  id: string;
  //   channel_id?: string;
  available_at?: Date | string;
  channel?: Pick<ShortChannel, "id">;
  status?: VIDEO_STATUSES;
}

interface PlaceholderVideo {
  type: "placeholder";
  link: string;
}
type VideoObj = YoutubeVideo | PlaceholderVideo;

export default defineComponent({
  components: { TldexChat },
  props: {
    video: {
      type: Object as PropType<VideoObj>,
      required: true,
    },
  },
  setup() {
    const tldex = useTLStore();

    return {
      tldex,
    };
  },
  data() {
    return {
      showTl: true,
      showYt: true,
    };
  },
});
</script>
<style>
.live-chat {
  @apply border-l border-bgColor-200;
}
.live-chat iframe {
  /* height: 100%; */
  width: 100%;
}
</style>
