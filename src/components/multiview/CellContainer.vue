<template>
  <v-sheet
    class="mv-cell"
    rounded
    :class="{
      'edit-mode': editMode,
    }"
    @drop="drop"
    @dragover="allowDrop"
    @dragleave="dragLeave"
    @dragenter="dragEnter"
  >
    <!-- Drop Overlay -->
    <v-overlay absolute :value="showDropOverlay">
      <div>
        <v-icon x-large>
          {{ mdiSelectionEllipseArrowInside }}
        </v-icon>
      </div>
    </v-overlay>
    <!-- Actual cell content -->
    <slot />
    <!-- Edit mode size info -->
    <div v-if="editMode" class="dimensions text-body-1">
      {{ item.w }} x {{ item.h }}
    </div>
  </v-sheet>
</template>

<script lang="ts">
import { getVideoIDFromUrl } from "@/utils/functions";
import {
    mdiSelectionEllipseArrowInside,
} from "@mdi/js";

export default {
    props: {
        item: {
            type: Object,
            required: true,
        },
        index: {
            type: Number,
            default: -1,
        },
    },
    data() {
        return {
            showDropOverlay: false,
            enterTarget: null,
            mdiSelectionEllipseArrowInside,
        };
    },
    computed: {
        editMode() {
            return this.$store.state.multiview.layoutContent[this.item.i]?.editMode ?? true;
        },
    },
    watch: {
        editMode(newMode) {
            this.setLayoutFreeze(newMode);
        },
    },
    methods: {
        setLayoutFreeze(newMode = this.editMode) {
            if (newMode) this.$store.commit("multiview/unfreezeLayoutItem", this.item.i);
            else this.$store.commit("multiview/freezeLayoutItem", this.item.i);
        },
        dragEnter(ev) {
            this.enterTarget = ev.target;
            this.showDropOverlay = true;
        },
        dragLeave(ev) {
            if (this.enterTarget === ev.target) {
                this.showDropOverlay = false;
            }
        },
        allowDrop(ev) {
            ev.preventDefault();
        },
        drop(ev) {
            ev.preventDefault();
            this.showDropOverlay = false;
            // Parse content in dataTransfer object, and insert video
            const json: string = ev.dataTransfer.getData("application/json");
            if (json) {
                const video = JSON.parse(json);

                if (video.id.length === 11 && video.channel.name) {
                    this.$store.commit("multiview/setLayoutContentById", {
                        id: this.item.i,
                        content: {
                            type: "video",
                            id: video.id,
                            video: {
                                custom: true,
                                id: video.id,
                                channel: {
                                    name: video.channel.name,
                                    photo: video.channel.photo,
                                },
                            },
                        },
                    });
                }
                return;
            }

            const text: string = ev.dataTransfer.getData("text");
            const video = getVideoIDFromUrl(text);
            if (!video || !video.id) return;

            this.$store.commit("multiview/setLayoutContentById", {
                id: this.item.i,
                content: {
                    id: video.id,
                    type: "video",
                    video,
                },
            });
        },
    },
};
</script>

<style lang="scss">
.mv-cell {
    display: flex;
    background-size: contain;
    background-position: center;
    height: 100%;
    border: 1px solid #f0629118 !important;
    justify-content: flex-start;
    align-content: stretch;
    flex-direction: column;

    .cell-content {
        display: flex;
        flex-grow: 1;
        flex-basis: 100%;
        flex-shrink: 1;
        max-height: 100%;
        height: 100%;
        width: 100%;
        flex-direction: column;
    }

    .dimensions {
        position: absolute;
        bottom: 0;
        right: 18px;
    }
}

.mv-cell.edit-mode {
    border: 1px solid var(--v-secondary-base) !important;
    padding: 20px;
}

.vue-grid-item.vue-draggable-dragging .mv-cell,
.vue-grid-item.resizing .mv-cell {
    pointer-events: none;
}

</style>
