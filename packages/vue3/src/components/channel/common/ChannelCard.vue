<template>
  <div
    class="flex flex-row items-center overflow-hidden rounded-md shadow-md channel-card justify-self-auto bg-base-200 hover:bg-base-100 h-50"
    :class="slim ? '' : 'h-50'"
  >
    <div class="flex-shrink-0 indicator">
      <span
        v-if="live"
        class="mb-4 mr-4 indicator-item indicator-bottom live-indicator"
      ></span>
      <span
        v-else-if="$slots.default"
        class="mb-3 right-5 indicator-item live-indicator indicator-bottom bg-slate-500 text-white text-2xs"
        ><slot></slot
      ></span>

      <channel-img
        :channel="channel"
        :size="slim ? 44 : 100"
        class="m-2"
        :class="imgClass"
      />
    </div>
    <div
      class="flex-grow"
      :class="{ 'opacity-40': channel.inactive, 'ml-2': !slim }"
    >
      <span class="text-xs text-neutral opacity-60"
        ><b>{{ channel.org || "???" }}</b>
        {{ channel.group ? "/ " + channel.group : "" }}
      </span>
      <span class="-mt-1 line-clamp-1" :class="{ 'text-lg': !slim }">
        {{ preferredName }}
      </span>
      <span v-if="!slim" class="text-xs line-clamp-1 text-neutral opacity-60">
        {{ subscribers }}
      </span>
      <span v-if="!slim" class="text-xs line-clamp-1 text-neutral opacity-60">
        {{ $t("component.channelInfo.videoCount", [channel.video_count]) }}
        {{ $t("component.channelInfo.clipCount", { n: channel.clip_count }) }}
      </span>
      <span
        v-if="channel.top_topics && !slim"
        class="opacity-60 hover:opacity-100"
      >
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
    <div v-if="!slim" class="flex flex-col h-full gap-1">
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
    live: Boolean,
    slim: Boolean,
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
    imgClass() {
      return {
        "opacity-40": this.channel.inactive,
      };
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
  height: 1.5em;
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

.live-indicator {
  @apply bg-red-500 border-transparent badge badge-xs outline outline-4 outline-base-300;
}
</style>
