<template>
  <div
    class="badge badge-lg border-bgColor-100 bg-bgColor-300 pl-0 text-sm text-base-content"
  >
    <channel-img :channel="channel" rounded :size="24" class="mr-2" />
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
