<template>
  <div
    class="justify-start items-center flex-row flex shadow-md bg-base-200 hover:bg-base-100 w-80 h-50 overflow-hidden rounded-md"
    :class="channel.inactive ? 'opacity-40' : ''"
  >
    <channel-img
      :channel="channel"
      :size="100"
      class="m-2 mx-4 mask mask-squircle"
    />
    <div>
      <span class="line-clamp-1">
        {{ preferredName }}
      </span>
      <span class="line-clamp-1 text-sm text-neutral opacity-60">
        {{ subscribers }}
      </span>
      <span class="line-clamp-1 text-xs text-neutral opacity-60">
        {{ $t("component.channelInfo.videoCount", [channel.video_count]) }}
        {{ $t("component.channelInfo.clipCount", { n: channel.clip_count }) }}
      </span>
      <span class="line-clamp-1 text-sm text-neutral opacity-60">{{
        channel.group
      }}</span>
    </div>
  </div>
</template>
<script lang="ts">
import { useChannel } from "@/hooks/common/useChannelService";
import { useLangStore } from "@/stores";
import { formatCount } from "@/utils/functions";
import { PropType } from "vue";

export default defineComponent({
  props: {
    channel: {
      type: Object as PropType<FullChannel>,
      required: true,
    },
    variant: {
      type: String as PropType<"card" | "list">,
      default: "card",
    },
  },
  setup(props) {
    const { preferredName } = useChannel(props.channel);
    const lang = useLangStore();

    return { preferredName, lang };
  },
  computed: {
    rowStyle() {
      return "ok";
    },
    subscribers() {
      return formatCount(this.channel.subscriber_count, this.lang.lang);
    },
  },
});
</script>
