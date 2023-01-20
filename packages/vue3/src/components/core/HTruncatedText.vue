<template>
  <div class="h-truncated-text">
    <div
      class="whitespace-pre-wrap"
      :class="{ 'line-clamp-4': !expanded }"
      :style="`-webkit-line-clamp: ${lines}`"
      style="word-break: break-word"
    >
      <span v-if="html" v-html="html" />
      <span
        v-else
        v-linkify:options="{
          target: '_blank',
          attributes: {
            onclick: 'event.stopPropagation()',
          },
        }"
        class="text-sm"
        >{{ text }}</span
      >
    </div>
    <button
      v-if="newLineCount > lines"
      class="btn btn-sm bg-transparent hover:bg-transparent text-primary p-0"
      @click="expanded = !expanded"
    >
      <slot name="button" :expanded="expanded">
        {{
          expanded
            ? $t("component.description.showLess")
            : $t("component.description.showMore")
        }}
      </slot>
    </button>
  </div>
</template>

<script lang="ts">
export default {
  props: {
    html: {
      type: String,
      default: "",
    },
    text: {
      type: String,
      default: "",
    },
    lines: {
      type: [Number, String],
      default: 5,
    },
  },
  data() {
    return {
      expanded: false,
    };
  },
  computed: {
    newLineCount() {
      return this.html
        ? this.html.split(/\r\n|\r|\n/).length
        : this.text.split(/\r\n|\r|\n/).length;
    },
  },
};
</script>
<style>
.h-truncated-text a {
  @apply text-primary;
}
</style>
