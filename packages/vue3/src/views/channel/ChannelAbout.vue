<template>
  <div v-if="channel" class="p-2 md:p-4">
    <div class="grid grid-flow-row-dense grid-cols-1 gap-4 md:grid-cols-3">
      <div class="order-1 col-span-1 md:order-last card card-compact">
        <div class="gap-0 shadow-xl card-body bg-bgColor md:gap-2">
          <strong class="card-title">{{
            $t("component.channelInfo.stats")
          }}</strong>
          <v-divider class="m-1" />
          {{ $t("component.channelInfo.videoCount", [channel?.video_count]) }}
          <br />
          <!-- <v-divider class="m-1" /> -->
          <!-- {{ channel?.clip_count }} -->
          {{ $t("component.channelInfo.clipCount", channel?.clip_count) }}
          <br />
          <!-- <v-divider class="m-1" /> -->
          {{ channel?.view_count }}
          {{ $t("component.channelInfo.totalViews") }}
        </div>
      </div>
      <div style="white-space: pre-wrap" class="order-2 col-span-2">
        <!-- <strong class="mb-3 card-title">{{
          $t("component.videoDescription.description")
        }}</strong> -->
        <p
          v-linkify:options="{
            target: '_blank',
            className: 'link link-primary ext-link',
          }"
        >
          {{ channel?.description }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useChannel } from "@/services/channel";
import { PropType } from "vue";

export default {
  name: "ChannelAbout",
  props: {},
  setup() {
    const route = useRoute();
    const id = computed(() => route.params.id as string);
    const channel = useChannel(id, true);

    return { channel: channel.data, isLoading: channel.isLoading };
  },
};
</script>

<style lang="css">
.ext-link {
  @apply after:content-['↗'] after:ml-[2px];
  text-decoration: none;
}
</style>
