<template>
  <div
    class="badge badge-lg border-bgColor-100 text-sm text-base-content"
    :class="{
      'pl-0': !tile,
      'bg-bgColor-300': !color,
      [color!]: color,
    }"
  >
    <channel-img :channel="channel" :rounded="!tile" :size="24" class="mr-2" />
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
}>();
defineEmits(["close"]);

const { preferredName } = useChannelPreferredName(props.channel);
</script>
