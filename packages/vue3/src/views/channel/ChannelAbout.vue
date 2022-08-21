<template>
  <div v-if="channel" class="p-2 md:p-4">
    <div class="grid grid-flow-row-dense grid-cols-1 md:grid-cols-3 gap-4">
      <div class="col-span-1 order-1 md:order-last card card-compact">
        <div class="card-body bg-bgColor shadow-xl">
          <strong class="card-title">{{
            $t("component.channelInfo.stats")
          }}</strong>
          <v-divider class="m-2" />
          {{ $t("component.channelInfo.videoCount", [channel?.video_count]) }}
          <v-divider class="m-2" />
          {{ channel?.clip_count }}
          {{ $t("component.channelInfo.clipCount", [channel?.clip_count]) }}
          <v-divider class="m-2" />
          {{ channel?.view_count }}
          {{ $t("component.channelInfo.totalViews") }} <v-divider class="m-2" />
        </div>
      </div>
      <div style="white-space: pre-wrap" class="col-span-2 order-2">
        <strong>{{ $t("component.videoDescription.description") }}</strong>
        <br />
        <p
          v-linkify:options="{
            target: '_blank',
            className: 'link link-primary',
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

<style></style>
