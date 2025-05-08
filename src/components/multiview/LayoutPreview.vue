<template>
  <div class="layout-preview" :class="{ 'theme--light': !$vuetify.theme.dark }" :style="size">
    <template v-for="l in layout">
      <div
        :key="l.i"
        class="layout-preview-cell flex-column"
        :style="getStyle(l)"
      >
        <template v-if="isChat(content, l)">
          <v-icon v-if="shouldShowTlIcon(content, l)" :small="!isXSmall(content, l)" :x-small="isXSmall(content, l)">
            {{ icons.tlChat }}
          </v-icon>
          <v-icon v-if="shouldShowYtIcon(content, l)" :small="!isXSmall(content, l)" :x-small="isXSmall(content, l)">
            {{ icons.ytChat }}
          </v-icon>
          <span v-if="shouldShowEmoji(content, l)" class="text-caption">💬</span>
        </template>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex';

const MIN_DOUBLE_ICON_HEIGHT = 8;
const MIN_XSMALL_ICON_HEIGHT = 5;
export default {
    name: "LayoutPreview",
    props: {
        layout: {
            type: Array,
            required: true,
        },
        content: {
            type: Object,
            required: false,
        },
        mobile: {
            type: Boolean,
            default: false,
        },
        scale: {
            type: Number,
            default: 1,
        },
    },
    computed: {
        ...mapState("multiview", ["defaultShowYtChat", "defaultShowTlChat"]),
        size() {
            const width = this.scale * (this.mobile ? 108 : 192);
            const height = this.scale * (this.mobile ? 192 : 108);
            return {
                width: `${width}px`,
                height: `${height}px`,
            };
        },
    },
    methods: {
        isChat(content, l) {
            return content && content[l.i] && content[l.i].type === "chat";
        },
        isXSmall(content, l) {
            if (l.h < MIN_DOUBLE_ICON_HEIGHT) {
                return l.h < MIN_XSMALL_ICON_HEIGHT;
            }
            if (this.showBothIcons(content, l)) {
                return l.h < (MIN_XSMALL_ICON_HEIGHT * 2);
            }
            return false;
        },
        shouldShowEmoji(content, l) {
            return l.h < MIN_DOUBLE_ICON_HEIGHT && this.showBothIcons(content, l);
        },
        showBothIcons(content, l) {
            return content[l.i].mode === 3
                || (content[l.i].mode === 0 && this.defaultShowYtChat && this.defaultShowTlChat);
        },
        shouldShowYtIcon(content, l) {
            return content[l.i].mode === 1
                || (content[l.i].mode === 0 && !this.defaultShowTlChat && this.defaultShowYtChat)
                || (this.showBothIcons(content, l) && l.h >= MIN_DOUBLE_ICON_HEIGHT);
        },
        shouldShowTlIcon(content, l) {
            return content[l.i].mode === 2
                || (content[l.i].mode === 0 && this.defaultShowTlChat && !this.defaultShowYtChat)
                || (this.showBothIcons(content, l) && l.h >= MIN_DOUBLE_ICON_HEIGHT);
        },
        getStyle(l) {
            // viewport is constricted to 24 cols and 24 rows
            // assuming nothing is off the screen, 0 < x < 24, 0 < y < 24
            // x/24 * 100 = percentage of the div
            function px(num) {
                return `${num * (100 / 24)}%`;
            }
            return {
                top: px(l.y),
                left: px(l.x),
                width: px(l.w),
                height: px(l.h),
                ...(this.content && this.content[l.i] && this.content[l.i].type === "chat"
                    ? { "background-color": `${this.$vuetify.theme.parsedTheme.warning.base}44` }
                    : { "background-color": `${this.$vuetify.theme.parsedTheme.info.base}44` }),
            };
        },
    },
};
</script>

<style>
.layout-preview {
    /* display: inline-block; */
    border: 2px solid #424242;
    background-color: #424242;
    position: relative;
    overflow: hidden;
}

.layout-preview-cell {
    position: absolute;
    border: 2px solid #424242;
    background-color: #9e9e9e;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
}

.layout-preview.theme--light > .cell > span {
    color: black;
}

.layout-preview.theme--light {
    border-color: #f5f5f5;
    background-color: #f5f5f5;
}
.layout-preview.theme--light > .cell {
    border-color: #f5f5f5;
    background-color: #e0e0e0;
}
</style>
