<template>
  <!-- <div class="video-card-list"> -->
  <DynamicScroller
    :items="_videos"
    :min-item-size="54"
    class="scroller"
    style="height: 100%"
  >
    <template #default="{ item, index, active }">
      <DynamicScrollerItem
        :item="item"
        :active="active"
        :size-dependencies="[item.mentions]"
        :data-index="index"
      >
        <video-card
          horizontal
          :video="item"
          :size="'default'"
          class="px-1 py-2"
        >
          <!-- <template v-if="$slots.default" #default="{ video }">
            <slot :video="video" />
          </template> -->
        </video-card>
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>
  <!-- </div> -->
</template>
<script lang="ts" setup>
import { DynamicScroller, DynamicScrollerItem } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";

import { PropType } from "vue";

defineComponent(DynamicScroller);
defineComponent(DynamicScrollerItem);

const props = defineProps({
  videos: { type: Object as PropType<VideoRef[]>, required: true },
});

const _videos = ref(props.videos);
watchEffect(() => (_videos.value = props.videos));
</script>
<style lang="scss"></style>
