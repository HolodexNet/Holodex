<template>
  <div>
    <div
      style="white-space: pre-wrap; word-break: break-word"
      :class="{ 'truncated-text': !expanded }"
      :style="`-webkit-line-clamp: ${lines}`"
    >
      <span v-if="html" v-linkified v-html="html" />
      <span v-else v-linkified v-text="text" />
    </div>
    <a v-if="newLineCount > lines" @click="expanded = !expanded">
      <slot name="button" :expanded="expanded">
        <span class="text-button">{{
          expanded ? $t("component.description.showLess") : $t("component.description.showMore")
        }}</span>
      </slot>
    </a>
  </div>
</template>

<script lang="ts">
// TODO(jprochazk): type declarations for this module
import linkify from "vue-linkify";

export default {
    directives: {
        linkified: linkify,
    },
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
            return this.html.split(/\r\n|\r|\n/).length || this.text.split(/\r\n|\r|\n/).length;
        },
    },
};
</script>

<style>
.truncated-text {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
