<template>
  <div v-if="'id' in video" class="live-chat">
    <TldexChat
      :video-id="video.id"
      :lang="'en'"
      style="height: 50%"
      :start-time="
        video.available_at ? new Date(video.available_at) : undefined
      "
    />
    <youtube-live-chat
      :video-id="video.id"
      :archive="video.status === 'past'"
      :channel-id="video.channel?.id"
    />
  </div>
</template>
<script lang="ts">
import { PropType } from "vue";
import TldexChat from "../tldex/client/TldexChat.vue";

interface YoutubeVideo {
  id: string;
  //   channel_id?: string;
  available_at?: string;
  channel?: Pick<ShortChannel, "id">;
  status?: string;
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
    // videoId: {
    //   type: String,
    //   required: true,
    // },
    // archive: Boolean,
    // channelId: {
    //   type: String,
    //   default: "",
    // },
  },
});
</script>
<style>
.live-chat {
  @apply border-l border-bgColor-200;
}
.live-chat iframe {
  height: 50%;
  width: 100%;
}
</style>
