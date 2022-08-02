<template>
  <div
    class="flex flex-row items-center overflow-hidden rounded-md shadow-md channel-card justify-self-auto bg-base-200 hover:bg-base-100 h-50"
  >
    <channel-img
      :channel="channel"
      :size="100"
      rounded
      class="m-2"
      :class="channel.inactive ? 'opacity-40' : ''"
    />
    <div class="flex-grow ml-2" :class="channel.inactive ? 'opacity-40' : ''">
      <span class="text-xs text-neutral opacity-60"
        ><b>{{ channel.org }}</b>
        {{ channel.group ? "/ " + channel.group : "" }}
      </span>
      <span class="-mt-1 text-lg line-clamp-1">
        {{ preferredName }}
      </span>
      <span class="text-xs line-clamp-1 text-neutral opacity-60">
        {{ subscribers }}
      </span>
      <span class="text-xs line-clamp-1 text-neutral opacity-60">
        {{ $t("component.channelInfo.videoCount", [channel.video_count]) }}
        {{ $t("component.channelInfo.clipCount", { n: channel.clip_count }) }}
      </span>
      <span v-if="channel.top_topics" class="opacity-60 hover:opacity-100">
        <div class="inline-block text-lg align-middle i-uil:award"></div>
        <div
          v-for="t in channel.top_topics"
          :key="channel.id + 't' + t"
          class="inline-block ml-1 font-bold align-middle rounded cursor-pointer text-bold badge badge-xs badge-outline border-slate-600 hover:badge-accent hover:badge-outline"
        >
          {{ formatTopic(t) }}
        </div>
      </span>
    </div>
    <div class="flex flex-col h-full gap-1">
      <div class="c-card-icon">
        <div class="i-carbon:logo-youtube"></div>
      </div>
      <div class="c-card-icon">
        <div class="i-carbon:logo-twitter"></div>
      </div>
      <div class="c-card-icon">
        <div class="i-mdi:heart-outline"></div>
      </div>
      <!-- <div class="c-card-icon">
        <div class="i-mdi:cancel"></div>
      </div> -->
    </div>
  </div>
</template>
<script lang="ts">
import { useChannel } from "@/hooks/common/useChannelService";
import { useLangStore } from "@/stores";
import { formatCount, formatTopic } from "@/utils/functions";
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
  methods: {
    formatTopic,
  },
});
</script>
<style lang="scss">
.c-card-icon {
  @apply pr-2 btn btn-ghost rounded-sm flex-grow;

  width: 2.5rem;
  min-height: 20px;
  height: auto;
  padding: 0;
  line-height: 1.4em;
  font-weight: 600;
  font-size: 1.4rem;
  opacity: 0.5;
}

.channel-card:hover {
  .c-card-icon {
    opacity: 1;
  }
}
</style>
