<template>
  <div v-if="channel" class="p-2 md:p-4">
    <div class="grid grid-flow-row-dense grid-cols-1 gap-4 md:grid-cols-3">
      <div class="card card-compact order-1 col-span-1 md:order-last">
        <div class="card-body gap-0 bg-bgColor shadow-xl md:gap-2">
          <strong class="card-title">{{
            $t("component.channelInfo.stats")
          }}</strong>
          <div class="divider"></div>
          {{ $t("component.channelInfo.videoCount", [channel?.video_count]) }}
          <br />
          <!-- {{ channel?.clip_count }} -->
          {{ $t("component.channelInfo.clipCount", channel?.clip_count) }}
          <br />
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
            attributes: {
              target: '_blank',
              class: 'link link-primary external-link',
            },
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
import { directive } from "@/setup/vue-3-linkify/linkify";

export default {
  name: "ChannelAbout",
  directives: {
    linkify: directive,
  },
  props: {},
  setup() {
    const route = useRoute();
    const id = computed(() => route.params.id as string);
    const channel = useChannel(id, true);

    return { channel: channel.data, isLoading: channel.isLoading };
  },
};
</script>

<style lang="css"></style>
