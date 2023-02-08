<template>
  <div
    class="badge badge-lg border-bgColor-100 bg-bgColor-300 text-sm text-base-content"
    :class="{
      'pl-0': !tile,
    }"
  >
    <channel-img :channel="channel" :rounded="!tile" :size="24" class="mr-2" />
    {{ channelName }}
  </div>
</template>
<script lang="ts" setup>
import { useLangStore } from "@/stores/lang";

const props = defineProps<{ channel: ShortChannel; tile?: boolean }>();
const langPrefs = useLangStore();
const channelName = computed(
  () =>
    langPrefs.preferredLocaleFn(
      props.channel.english_name,
      props.channel.name
    ) || ""
);
</script>
