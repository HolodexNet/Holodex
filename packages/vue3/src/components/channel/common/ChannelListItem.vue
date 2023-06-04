<template>
  <component
    :is="noLink ? 'div' : 'router-link'"
    class="channel-card grid gap-0 overflow-hidden rounded-md"
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
        :size="36"
        class="m-2"
        :class="{
          'opacity-40': channel.inactive,
          'shadow-live ': live,
        }"
      />
    </div>
    <div
      class="justify-center pt-2"
      :class="{ 'opacity-40': channel.inactive }"
    >
      <span class="line-clamp-1 text-xs text-base-content opacity-75">
        {{
          channel.org ||
          (channel.type === "subber" && $t("views.channels.tabs.Subber")) ||
          "???"
        }}
        {{ group ? "/ " + group : "" }}
      </span>
      <span class="-mt-1 line-clamp-1 text-sm font-medium">
        {{ preferredName }}
      </span>
    </div>
  </component>
</template>
<script lang="ts">
import { useChannelPreferredName } from "@/hooks/common/useChannelService";
import { useLangStore } from "@/stores";
import { formatCount, formatTopic } from "@/utils/functions";
import { PropType } from "vue";

export default defineComponent({
  props: {
    channel: {
      type: Object as PropType<FullChannel>,
      required: true,
    },
    live: { type: Boolean, default: false },
    noLink: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const { preferredName } = useChannelPreferredName(props.channel);
    const lang = useLangStore();

    return { preferredName, lang };
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
