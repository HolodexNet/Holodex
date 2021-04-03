<template>
    <div>
        <div
            style="white-space: pre-wrap"
            :class="{ 'truncated-text': !expanded }"
            :style="`-webkit-line-clamp: ${lines}`"
        >
            <span v-if="html" v-html="html" v-linkified />
            <span v-else v-text="text" v-linkified />
        </div>
        <a @click="expanded = !expanded" v-if="newLineCount > lines">
            <slot name="button" v-bind:expanded="expanded">
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
    data() {
        return {
            expanded: false,
        };
    },
    props: {
        html: {
            type: String,
        },
        text: {
            type: String,
        },
        lines: {
            type: [Number, String],
            default: 5,
        },
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
