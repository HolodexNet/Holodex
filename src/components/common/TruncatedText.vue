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
        <a @click="expanded = !expanded">
            <slot name="button">
                <span class="text-button">{{
                    expanded ? $t("component.description.showLess") : $t("component.description.showMore")
                }}</span>
            </slot>
        </a>
    </div>
</template>

<script>
export default {
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
            default: 3,
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
