<template>
  <div v-if="'id' in video" class="live-chat">
    <YoutubeLiveChat
      :video-id="video.id"
      :archive="video.status === 'past'"
      :channel-id="video.channel?.id"
    />
  </div>
</template>
<script lang="ts">
import { PropType } from "vue";

interface YoutubeVideo {
  id: string;
  //   channel_id?: string;
  channel?: Pick<ShortChannel, "id">;
  status?: string;
}

interface PlaceholderVideo {
  type: "placeholder";
  link: string;
}
type VideoObj = YoutubeVideo | PlaceholderVideo;

export default defineComponent({
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
  height: 100%;
  width: 100%;
}
</style>
