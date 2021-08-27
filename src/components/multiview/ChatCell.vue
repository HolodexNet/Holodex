<template>
  <v-sheet class="cell-content flex-column">
    <TabbedLiveChat
      :id="item.i"
      :active-videos="activeVideos"
      :set-show-t-l="toggleTL"
      :set-show-chat="toggleChat"
      :scale="chatScale"
    />
    <v-sheet class="cell-control">
      <v-btn :x-small="toggleChat || toggleTL" width="50%" @click="editMode = !editMode">
        <v-icon small class="mr-1">
          {{ icons.mdiMenu }}
        </v-icon>{{ $t("component.videoCard.edit") }}
      </v-btn>
      <v-btn
        :x-small="toggleChat || toggleTL"
        width="25%"
        :color="toggleChat ? 'primary' : ''"
        @click="toggleChatHandle"
      >
        <v-icon small class="mr-1">
          {{ icons.ytChat }}
        </v-icon>
        <template v-if="cellWidth > 200">
          Chat
        </template>
      </v-btn>
      <v-btn
        :x-small="toggleChat || toggleTL"
        width="25%"
        :color="toggleTL ? 'primary' : ''"
        @click="toggleTLHandle"
      >
        <v-icon small class="mr-1">
          {{ icons.tlChat }}
        </v-icon>
        <template v-if="cellWidth > 200">
          TL
        </template>
      </v-btn>
    </v-sheet>
    <div v-if="!toggleChat && !toggleTL" style="height: 20%" />
  </v-sheet>
</template>

<script lang="ts">
import TabbedLiveChat from "@/components/multiview/TabbedLiveChat.vue";
import CellMixin from "./CellMixin";

export default {
    components: {
        TabbedLiveChat,
    },
    mixins: [CellMixin],
    props: {
        cellWidth: {
            type: Number,
            default: 0,
        },
    },
    data() {
        return {
            toggleTL: false,
            toggleChat: true,
            chatScale: 1,
        };
    },
    watch: {
        cellWidth() {
            this.checkScale();
        },
    },
    methods: {
        toggleChatHandle() {
            this.toggleChat = !this.toggleChat;
            if (!this.toggleChat && !this.toggleTL) this.toggleTL = true;
        },
        toggleTLHandle() {
            this.toggleTL = !this.toggleTL;
            if (!this.toggleChat && !this.toggleTL) this.toggleChat = true;
        },
        checkScale() {
            // width breakpoints where 150 < width < 200 => scale = 0.6
            const widths = [150, 200, 250, 300, 350];
            const scale = [0.5, 0.6, 0.75, 0.85, 1];
            const idx = widths.findIndex((w) => this.cellWidth < w);
            this.chatScale = idx >= 0 ? scale[idx] : 1;
        },
    },
};
</script>

<style>

</style>
