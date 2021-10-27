<template>
  <v-card max-height="75vh" class="overflow-y-auto">
    <v-card-title> Rearrange Videos </v-card-title>
    <v-card-text>
      <div class="layout-preview" :class="{ 'theme--light': !$vuetify.theme.dark }" :style="size">
        <template v-for="l in layout">
          <div
            :key="l.i"
            class="cell"
            :style="getStyle(l)"
            @dragover="onDragOver"
            @drop="onDrop($event, l.i)"
          >
            <div
              v-if="content && content[l.i]"
              draggable
              class="pa-3 grabbable"
              @dragstart="onDragStart($event, l.i)"
            >
              <span v-if="content[l.i].type === 'chat'">

                <v-icon>{{ icons.ytChat }}</v-icon>
              </span>
              <channel-img
                v-if="content[l.i].type === 'video'"
                :channel="content[l.i].video.channel"
                no-link
                rounded
              />
            </div>
          </div>
        </template>
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { mapState } from "vuex";
import ChannelImg from "../channel/ChannelImg.vue";

export default {
    name: "RearrangeVideos",
    components: { ChannelImg },
    computed: {
        ...mapState("multiview", ["layout"]),
        ...mapState("multiview", { content: "layoutContent" }),
        size() {
            // const width = this.scale * (this.mobile ? 108 : 192);
            // const height = this.scale * (this.mobile ? 192 : 108);
            const width = 192 * 2;
            const height = 108 * 2;
            return {
                width: `${width}px`,
                height: `${height}px`,
            };
        },
    },
    mounted() {

    },
    methods: {
        onDragStart(e, idx) {
            console.log(e, idx);
            e.dataTransfer.setData("index", idx);
        },
        onDragOver(e) {
            e.preventDefault();
        },
        onDrop(e, dropIdx) {
            e.preventDefault();
            const startIdx = e.dataTransfer.getData("index");
            console.log(dropIdx, +startIdx);
            this.$store.commit("multiview/swapGridPosition", { id1: startIdx, id2: dropIdx });
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
.grabbable *, .grabbable *:hover, .grabbable *:active {
    cursor: move !important; /* fallback if grab cursor is unsupported */
}
</style>
<style scoped>
.layout-preview {
    display: inline-block;
    border: 2px solid #424242;
    background-color: #424242;
    position: relative;
    overflow: hidden;
}

.cell {
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
