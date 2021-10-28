<template>
  <v-card v-if="isActive">
    <v-card-title> {{ $t("views.multiview.reorderLayout") }} </v-card-title>
    <v-card-text>
      {{ $t("views.multiview.reorderLayoutDetail") }}
      <div
        ref="container"
        class="layout-preview ma-auto mt-2"
        :class="{ 'theme--light': !$vuetify.theme.dark }"
        :style=" {
          width: `${size.width}px`,
          height: `${size.height}px`,
        }"
      >
        <template v-for="(l, idx) in layout">
          <div
            :key="l.i"
            class="layout-preview-cell"
            :style="getStyle(l)"
            @dragover="onDragOver"
            @drop="onDrop($event, l.i)"
          >
            <div
              v-if="content && content[l.i]"
              draggable
              class="pa-3 grabbable"
              :style="{
                opacity: draggingIdx !== idx ? 1 : 0
              }"
              @dragstart="onDragStart($event, idx)"
              @touchstart="onTouchStart($event, idx)"
              @touchend="onTouchEnd($event, idx)"
              @touchmove="onTouchMove($event, idx)"
              @touchcancel="draggingIdx = -1"
            >
              <v-icon v-if="content[l.i].type === 'chat'" large>
                {{ icons.ytChat }}
              </v-icon>
              <v-icon
                v-if="content[l.i].type === 'video' && content[l.i].video.type === 'twitch'"
                large
              >
                {{ mdiTwitch }}
              </v-icon>
              <channel-img
                v-else-if="content[l.i].type === 'video'"
                :channel="content[l.i].video.channel"
                no-link
                rounded
              />
            </div>
          </div>
        </template>
        <div
          v-if="draggingIdx >= 0"
          style="position: absolute; touch-action: none"
          :style="draggableIconPos"
        >
          <v-icon v-if="touchMoveContent.type === 'chat'" large>
            {{ icons.ytChat }}
          </v-icon>
          <v-icon
            v-if="touchMoveContent.type === 'video' && touchMoveContent.video.type === 'twitch'"
            large
          >
            {{ mdiTwitch }}
          </v-icon>
          <channel-img
            v-else-if="touchMoveContent.type === 'video'"
            :channel="touchMoveContent.video.channel"
            no-link
            rounded
          />
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { mapState } from "vuex";
import { mdiTwitch } from "@mdi/js";
import ChannelImg from "../channel/ChannelImg.vue";

export default {
    name: "RearrangeVideos",
    components: { ChannelImg },
    props: {
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            mdiTwitch,
            draggableIconPos: {
                left: 0,
                top: 0,
            },
            draggingIdx: -1,
        };
    },
    computed: {
        ...mapState("multiview", ["layout"]),
        ...mapState("multiview", { content: "layoutContent" }),
        touchMoveContent() {
            if (this.draggingIdx >= 0) return this.content[this.layout[this.draggingIdx].i];
            return null;
        },
        size() {
            const width = 2 * (this.$vuetify.breakpoint.xs ? 108 : 192);
            const height = 2 * (this.$vuetify.breakpoint.xs ? 192 : 108);
            return { width, height };
        },
    },
    methods: {
        onTouchStart(e, idx) {
            e.preventDefault();
            this.draggingIdx = idx;
            this.onTouchMove(e);
        },
        onTouchMove(e) {
            e.preventDefault();
            const { x, y } = this.getRelativePoint(e.changedTouches[0]);
            this.draggableIconPos.left = `${x}px`;
            this.draggableIconPos.top = `${y}px`;
        },
        onTouchEnd(e, startIdx) {
            e.preventDefault();
            // x & y are relative to the clicked element
            const { x, y } = this.getRelativePoint(e.changedTouches[0]);
            const { width, height } = this.size;
            // Scale to the 24x24 grid
            const unitX = x / (width / 24);
            const unitY = y / (height / 24);
            // Find intersecting cell
            const dropCell = this.layout.find((l) => unitX >= l.x && unitX < (l.x + l.w) && unitY >= l.y && unitY < (l.y + l.h));
            if (dropCell) {
                this.$store.commit("multiview/swapGridPosition", { id1: startIdx, id2: dropCell.i });
            }
            this.draggingIdx = -1;
        },
        onDragStart(e, idx) {
            e.dataTransfer.setData("index", idx);
        },
        onDragOver(e) {
            e.preventDefault();
        },
        onDrop(e, dropIdx) {
            e.preventDefault();
            const startIdx = e.dataTransfer.getData("index");
            this.$store.commit("multiview/swapGridPosition", { id1: startIdx, id2: dropIdx });
        },
        getRelativePoint(touch) {
            const br = this.$refs.container.getBoundingClientRect();
            // x & y are relative to the clicked element
            const x = touch.clientX - br.left;
            const y = touch.clientY - br.top;
            return { x, y };
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
.grabbable, .grabbable *, .grabbable *:hover, .grabbable *:active {
    cursor: move !important; /* fallback if grab cursor is unsupported */
}
</style>
