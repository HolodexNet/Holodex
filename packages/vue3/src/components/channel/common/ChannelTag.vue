<template>
  <div
    class="badge badge-lg border-bgColor-100 pl-0 text-sm text-base-content"
    :class="{
      'bg-bgColor-300': !color,
      'rounded-md': tile,
      [color!]: color,
    }"
  >
    <channel-img :channel="channel" :size="24" class="mr-2" :no-link="noLink" />
    {{ preferredName }}
    <div
      v-if="closeable"
      class="ml-2 hover:text-warning"
      :class="icons.close"
      @click="$emit('close')"
    />
  </div>
</template>
<script lang="ts" setup>
import { useChannelPreferredName } from "@/hooks/common/useChannelService";

const props = defineProps<{
  channel: ShortChannel;
  tile?: boolean;
  color?: string;
  closeable?: boolean;
  noLink?: boolean;
}>();
defineEmits(["close"]);

const { preferredName } = useChannelPreferredName(props.channel);
</script>
