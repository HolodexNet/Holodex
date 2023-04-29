<template>
  <component
    :is="noLink ? 'div' : 'router-link'"
    class="channel-card grid gap-0 overflow-hidden rounded-md"
    :class="[slim ? '' : 'h-50 flex-wrap']"
    :to="`/channel/${channel.id}`"
  >
    <div class="indicator">
      <span
        v-if="live"
        class="live-indicator indicator-bottom indicator-item mb-3 mr-3 box-border aspect-square"
        style="background-color: rgb(239 68 68)"
      />
      <span
        v-else-if="$slots.default"
        class="live-indicator text-2xs indicator-bottom indicator-item right-5 mb-3 text-white"
      >
        <slot />
      </span>

      <channel-img
        :channel="channel"
        :size="slim ? 36 : 100"
        class="m-2"
        :class="{
          'opacity-40': channel.inactive,
          'shadow-live ': live,
        }"
      />
    </div>
    <div
      class="justify-center pt-2"
      :class="{ 'opacity-40': channel.inactive, 'ml-1': !slim }"
    >
      <span class="line-clamp-1 text-xs text-base-content opacity-75">
        {{
          channel.org ||
          (channel.type === "subber" && $t("views.channels.tabs.Subber")) ||
          "???"
        }}
        {{ group ? "/ " + group : "" }}
      </span>
      <span
        class="-mt-1 line-clamp-1 font-medium"
        :class="{ 'text-lg': !slim, 'text-sm': slim }"
      >
        {{ preferredName }}
      </span>
      <span
        v-if="!slim"
        class="line-clamp-1 text-sm text-base-content opacity-75"
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
        <div class="i-uil:award inline-block align-middle text-lg" />
        <div
          v-for="t in channel.top_topics"
          :key="channel.id + 't' + t"
          class="text-bold badge-outline badge badge-sm ml-1 inline-block h-[1.1rem] cursor-pointer rounded border-slate-600 align-middle font-bold leading-4 hover:badge-accent hover:badge-outline"
        >
          {{ formatTopic(t) }}
        </div>
      </div>
    </div>
    <slot name="buttons" :is-fav="isFav" :toggle-fav="favChannel" />
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

.channel-card {
  grid-template-columns: min-content 1fr min-content;
  // grid-template-rows: repeat(2, 1fr);
}
.channel-card:hover {
  .c-card-icon {
    opacity: 1;
  }
}

.live-indicator {
  @apply badge badge-xs border-transparent outline outline-4 outline-bgColor;
}
.shadow-live > * {
  @apply ring-2 ring-red-800;
}
</style>
