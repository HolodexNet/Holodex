<template>
  <!-- <div class="video-card-list"> -->
  <div v-bind="containerProps" style="height: 100%">
    <div v-bind="wrapperProps">
      <video-card
        v-for="item in list"
        :key="'_' + idx + 'vl' + item.index"
        style="height: 100px"
        horizontal
        :video="item.data"
        hide-channel-image
        :size="'default'"
      >
        <template v-if="$slots.default" #default="{ video }">
          <slot :video="video"></slot>
        </template>
      </video-card>
    </div>
  </div>
  <!-- </div> -->
</template>
<script lang="ts" setup>
import { useSettingsStore } from "@/stores/settings";
import { useVirtualList } from "@vueuse/core";
import { PropType } from "vue";

const props = defineProps({
  videos: { type: Object as PropType<VideoRef[]>, required: true },
});

const videoRef = ref(props.videos);
watchEffect(() => (videoRef.value = props.videos));

const idx = Date.now() % 100000;

const settings = useSettingsStore();

const { list, containerProps, wrapperProps } = useVirtualList(videoRef, {
  itemHeight: 100,
  overscan: 5,
});
</script>
<style lang="scss"></style>
