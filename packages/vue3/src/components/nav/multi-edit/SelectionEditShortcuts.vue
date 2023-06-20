<template>
  <h-menu>
    <template #activator="{ props }">
      <h-btn
        class="btn-xs btn"
        no-color
        :class="
          !selection.selectedVideos.length ? 'btn-disabled' : 'btn-secondary'
        "
        v-bind="props"
      >
        <div class="i-fluent:connected-20-filled -ml-1 mr-1 text-lg" />
        <span class="mx-1">Intelligent Multi-Edit</span>
        <div class="i-bx:chevron-up" />
      </h-btn>
    </template>
    <div class="menu-group btn-group btn-group-vertical self-start">
      <div
        v-if="
          !selection.selectedVideos.find(
            (x) => x.type == 'clip' || x.type == 'placeholder'
          ) && selection.selectedVideos.length > 1
        "
        class="peer btn-outline btn-secondary btn-xs btn bg-bgColor-400"
      >
        Make Simulwatch
      </div>
      <div
        v-if="
          !selection.selectedVideos.find((x) => x.type == 'clip') &&
          selection.selectedVideos.length > 1
        "
        class="peer btn-outline btn-secondary btn-xs btn bg-bgColor-400"
      >
        Make Collab
      </div>
      <div
        v-if="
          selection.context.pageVideo && selection.selectedVideos.length > 0
        "
        class="peer btn-outline btn-secondary btn-xs btn bg-bgColor-400"
        @click="dissociateVideo"
      >
        Disassociate w/ Current Video
      </div>
      <div
        v-if="
          selection.context.pageChannel && selection.selectedVideos.length > 0
        "
        class="peer btn-outline btn-secondary btn-xs btn bg-bgColor-400"
      >
        Disassociate w/ Current Channel
      </div>
      <div
        v-if="
          selection.selectedVideos.length > 0 &&
          selection.selectedVideos.find((x) => x.mentions?.length)
        "
        class="peer btn-outline btn-secondary btn-xs btn bg-bgColor-400"
      >
        Remove all Mentions
      </div>
      <div
        class="btn-outline btn-disabled btn-secondary btn-xs btn hidden max-w-xs bg-bgColor-400 first:block"
      >
        No options available for selected videos.
      </div>
    </div>
  </h-menu>
</template>
<script lang="ts" setup>
import { useVideoSelection } from "@/stores/selection";
import { useToast, ToastType } from "vue-toast-notification";

const selection = useVideoSelection();
const { open: toast } = useToast();

function dissociateVideo() {
  const ok =
    confirm(`Are you sure you want to disassociate the selected video(s) with the current video?

    The current video is: [${selection.context.pageVideo?.title}] by [${selection.context.pageVideo?.channel.name}]

    The source would be removed, and mentioned vtubers will be recalculated/re-inferred. (Mentions added or removed by editors will not be changed.)`);

  if (!ok)
    return toast({
      position: "bottom-right",
      duration: 2000,
      message: "Cancelled",
      type: "info" satisfies ToastType,
    });

  // TODO do stuff here
}
</script>

<style>
.menu-group .btn {
  text-align: start;
  justify-content: start;
}
</style>
