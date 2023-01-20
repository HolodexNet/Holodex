<template>
  <div
    class="badge badge-lg pl-0 text-sm text-base-content bg-bgColor-300 border-bgColor-100"
  >
    <channel-img :channel="channel" rounded :size="24" class="pr-2" />
    {{ channelName }}
  </div>
</template>
<script lang="ts" setup>
import { useLangStore } from "@/stores/lang";

const props = defineProps<{ channel: ShortChannel }>();
const langPrefs = useLangStore();
const channelName = computed(
  () =>
    langPrefs.preferredLocaleFn(
      props.channel.english_name,
      props.channel.name
    ) || ""
);
</script>
