<template>
  <component
    :is="noLink ? 'div' : 'router-link'"
    class="channel-card flex flex-row items-center justify-self-auto overflow-hidden rounded-md"
    :class="slim ? '' : 'h-50'"
    :to="`/channel/${channel.id}`"
  >
    <div class="indicator flex-shrink-0">
      <span
        v-if="live"
        class="live-indicator indicator-bottom indicator-item mb-4 mr-4"
      />
      <span
        v-else-if="$slots.default"
        class="live-indicator text-2xs indicator-bottom indicator-item right-5 mb-3 bg-slate-500 text-white"
      >
        <slot/>
      </span>

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
      <span class="text-xs text-base-content opacity-75 line-clamp-1">
        <b>
          {{
            channel.org ||
            (channel.type === "subber" && $t("views.channels.tabs.Subber")) ||
            "???"
          }}
        </b>
        {{ group ? "/ " + group : "" }}
      </span>
      <span class="-mt-1 line-clamp-1" :class="{ 'text-lg': !slim }">
        {{ preferredName }}
      </span>
      <span
        v-if="!slim"
        class="text-sm text-base-content opacity-75 line-clamp-1"
      >
        {{ subscribers }} •
        {{ $t("component.channelInfo.videoCount", [channel.video_count]) }}
        {{
          channel.clip_count &&
          " • " +
            $t("component.channelInfo.clipCount", { n: channel.clip_count })
        }}
      </span>
      <div
        v-if="channel.top_topics && !slim"
        class="opacity-60 hover:opacity-100"
      >
        <div class="i-uil:award inline-block align-middle text-lg"/>
        <div
          v-for="t in channel.top_topics"
          :key="channel.id + 't' + t"
          class="text-bold badge-outline badge badge-sm ml-1 inline-block h-[1.1rem] cursor-pointer rounded border-slate-600 align-middle font-bold leading-4 hover:badge-accent hover:badge-outline"
        >
          {{ formatTopic(t) }}
        </div>
      </div>
    </div>
    <slot name="buttons"/>
    <div v-if="!slim && !$slots.buttons" class="flex h-full flex-col gap-1">
      <a
        class="c-card-icon hover:text-red-500"
        :href="`https://youtube.com/channel/${channel.id}`"
        target="_blank"
        title="Youtube"
      >
        <div :class="icons.youtube"/>
      </a>
      <a
        class="c-card-icon hover:text-cyan-500"
        :class="{ 'btn-disabled bg-inherit opacity-20': !channel.twitter }"
        :href="channel.twitter ? `https://twitter.com/${channel.twitter}` : '#'"
        target="_blank"
        title="Twitter"
      >
        <div :class="icons.twitter"/>
      </a>
      <button
        class="c-card-icon"
        :title="
          isFav
            ? $t('component.channelSocials.removeFromFavorites')
            : $t('component.channelSocials.addToFavorites')
        "
        @click.prevent.stop="favChannel"
      >
        <div
          :class="isFav ? 'i-mdi:heart text-red-500' : 'i-mdi:heart-outline'"
        />
      </button>
    </div>
  </component>
</template>
<script lang="ts">
import { useChannelPreferredName } from "@/hooks/common/useChannelService";
import { useFavoritesIDSet, useFavoritesPatcher } from "@/services/favorites";
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
    noLink: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const { preferredName } = useChannelPreferredName(props.channel);
    const lang = useLangStore();
    const fav = useFavoritesIDSet();

    const isFav = computed(() => fav.value?.has(props.channel.id));
    const favPatcher = useFavoritesPatcher();
    return { preferredName, lang, isFav, favPatcher };
  },
  computed: {
    subscribers() {
      return this.channel.subscriber_count
        ? formatCount(this.channel.subscriber_count, this.lang.lang)
        : "";
    },
    imgClass() {
      return {
        "opacity-40": this.channel.inactive,
      };
    },
    group() {
      return this.channel.group || this.channel.suborg?.slice(2);
    },
  },
  methods: {
    formatTopic,
    favChannel() {
      this.favPatcher.mutateAsync([
        {
          op: this.isFav ? "remove" : "add",
          channel_id: this.channel.id,
          channelTemp: this.channel,
        },
      ]);
    },
  },
});
</script>
<style lang="scss">
.c-card-icon {
  @apply btn-ghost btn flex-grow rounded-sm pr-2;

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
  @apply badge badge-xs border-transparent bg-red-500 outline outline-4 outline-bgColor;
}
</style>
