<template>
  <div
    class="flex flex-row items-center overflow-hidden rounded-md shadow-md channel-card justify-self-auto bg-base-200 hover:bg-base-100"
    :class="slim ? '' : 'h-50'"
  >
    <div class="flex-shrink-0 indicator">
      <span
        v-if="live"
        class="mb-4 mr-4 indicator-item indicator-bottom live-indicator"
      ></span>
      <span
        v-else-if="$slots.default"
        class="mb-3 text-white right-5 indicator-item live-indicator indicator-bottom bg-slate-500 text-2xs"
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
        ><b>{{
          channel.org ||
          (channel.type === "subber" && $t("views.channels.tabs.Subber")) ||
          "???"
        }}</b>
        {{ channel.group ? "/ " + channel.group : "" }}
      </span>
      <span class="-mt-1 line-clamp-1" :class="{ 'text-lg': !slim }">
        {{ preferredName }}
      </span>
      <span v-if="!slim" class="text-sm line-clamp-1 text-neutral">
        {{ subscribers }} •
        {{ $t("component.channelInfo.videoCount", [channel.video_count]) }}
        {{
          channel.clip_count &&
          " • " +
            $t("component.channelInfo.clipCount", { n: channel.clip_count })
        }}
      </span>
      <span
        v-if="channel.top_topics && !slim"
        class="opacity-60 hover:opacity-100"
      >
        <div class="inline-block text-lg align-middle i-uil:award"></div>
        <div
          v-for="t in channel.top_topics"
          :key="channel.id + 't' + t"
          class="inline-block ml-1 font-bold leading-3 align-middle rounded cursor-pointer text-bold badge badge-sm badge-outline border-slate-600 hover:badge-accent hover:badge-outline"
        >
          {{ formatTopic(t) }}
        </div>
      </span>
    </div>
    <div v-if="!slim" class="flex flex-col h-full gap-1">
      <a
        class="c-card-icon hover:text-red-500"
        :href="`https://youtube.com/channel/${channel.id}`"
        target="_blank"
        title="Youtube"
      >
        <div class="i-carbon:logo-youtube"></div>
      </a>
      <a
        class="c-card-icon hover:text-cyan-500"
        :class="{ 'btn-disabled bg-inherit opacity-20': !channel.twitter }"
        :href="channel.twitter ? `https://twitter.com/${channel.twitter}` : '#'"
        target="_blank"
        title="Twitter"
      >
        <div class="i-carbon:logo-twitter"></div>
      </a>
      <button
        class="c-card-icon"
        :title="
          isFav
            ? $t('component.channelSocials.removeFromFavorites')
            : $t('component.channelSocials.addToFavorites')
        "
      >
        <div
          :class="isFav ? 'i-mdi:heart text-red-500' : 'i-mdi:heart-outline'"
        ></div>
      </button>
      <!-- <div class="c-card-icon">
        <div class="i-mdi:cancel"></div>
      </div> -->
    </div>
  </div>
</template>
<script lang="ts">
import { useChannel } from "@/hooks/common/useChannelService";
import { useFavoritesListByID } from "@/services/favorites";
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
    const fav = useFavoritesListByID();

    const isFav = computed(() => fav.value?.has(props.channel.id));

    return { preferredName, lang, isFav };
  },
  computed: {
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
