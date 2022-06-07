<template>
  <div
    class="layout-btn pa-2"
    @click="
      (e) => {
        $emit('click', e);
      }
    "
  >
    <LayoutPreview
      :layout="preset.layout"
      :content="preset.content"
      :mobile="preset.portrait"
      :scale="scale"
    />
    <div class="text-body-1 text-center d-flex align-center justify-center" style="position: relative">
      <slot name="pre" />
      <span :class="{ 'flex-grow-1': custom, 'primary--text': active }">{{ preset.name }}</span>
      <slot name="post" />
    </div>
  </div>
</template>

<script>
import LayoutPreview from "./LayoutPreview.vue";

export default {
    name: "LayoutPreviewCard",
    components: {
        LayoutPreview,
    },
    props: {
        preset: {
            type: Object,
            default: null,
            required: true,
        },
        custom: {
            type: Boolean,
        },
        active: {
            type: Boolean,
        },
        scale: {
            type: Number,
            default: 1,
        },
    },
};
</script>

<style>
.layout-btn:hover {
    background-color: rgba(0, 0, 0, 0.1);
    cursor: pointer;
}
.layout-card-text {
  position: relative;
}
</style>
