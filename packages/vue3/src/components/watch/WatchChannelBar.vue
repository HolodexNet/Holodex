<template>
  <div class="px-4 py-2 bg-bgColor-400 flex flex-wrap">
    <div class="channel-bar-tab">
      <channel-img :channel="channel" :size="32" />
      <span class="ml-2">{{ channel.name }}</span>
    </div>
    <div class="channel-bar-tab md-hide">Videos</div>
    <div class="channel-bar-tab md-hide">Clips</div>
    <div class="channel-bar-tab sm-hide">
      Subscribers&nbsp;
      <span class="font-normal opacity-60">{{ subscribersFormatted }}</span>
    </div>
    <div class="channel-bar-tab">
      <div class="i-mdi:dots-horizontal w-4 text-xl" />
    </div>

    <div class="ml-auto items-center">
      <button class="btn btn-sm btn-outline btn-primary">
        <div class="i-mdi:heart text-xl" />
      </button>
      <button class="btn btn-sm btn-outline">
        <div class="i-mdi:arrow-collapse-right text-xl" />
      </button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useLangStore } from "@/stores";
import { formatCount } from "@/utils/functions";

const props = defineProps<{ video: ExtendedVideo }>();
const channel = computed(() => props.video.channel);
const { lang } = useLangStore();
const subscribersFormatted = computed(() =>
  formatCount(props.video.channel.subscriber_count || 0, lang)
);
console.log({ ...props.video });
</script>
<style>
.channel-bar-tab {
  @apply flex items-center border-r-2 border-bgColor-300 px-2 md:px-4;
}
.channel-bar-tab.md-hide {
  @apply md:flex hidden;
}

.channel-bar-tab.sm-hide {
  @apply sm:flex hidden;
}
.channel-bar-tab:first-of-type {
  padding-left: 0;
}
.channel-bar-tab:last-of-type {
  border: none;
}
</style>
