<template>
  <div
    ref="fullscreen-content"
    :class="{ 'mobile-helpers': $store.state.isMobile }"
    class="d-flex flex-column multiview"
  >
    <!-- Hidden div for autohiding the Toolbar -->
    <div
      v-if="collapseToolbar && autoHideToolbar"
      class="flex-grow-0 toolbar-placeholder"
      style="position: absolute; opacity: 0; right: 0; z-index: 1; width: 100%; height: 64px;"
      @mouseenter="collapseToolbar = false"
    />
    <!-- Floating tool bar -->
    <transition name="slide">
      <MultiviewToolbar
        v-show="!collapseToolbar"
        v-model="collapseToolbar"
        :buttons="buttons"
        @update:autoHideToolbar="autoHideToolbar = $event"
      >
        <template #left>
          <VideoSelector v-if="!$vuetify.breakpoint.xs" horizontal @videoClicked="handleToolbarClick" />
          <!-- Single Button video selector for xs displays -->
          <v-btn
            icon
            large
            class="d-flex"
            @click="handleToolbarShowSelector"
          >
            <v-icon style="border-radius: 0 position: relative; margin-right: 3px; cursor: pointer" large>
              {{ mdiCardPlus }}
            </v-icon>
          </v-btn>
        </template>
        <template #buttons>
          <v-menu offset-y>
            <template #activator="{ on, attrs }">
              <v-btn
                color="primary"
                dark
                v-bind="attrs"
                icon
                v-on="on"
              >
                <v-icon>{{ icons.mdiGridLarge }}</v-icon>
              </v-btn>
            </template>
            <portal to="preset-dialog" :disabled="!showPresetSelector">
              <preset-selector
                :slim="!showPresetSelector"
                @selected="handlePresetClicked"
                @showAll="showPresetSelector = true"
              />
            </portal>
          </v-menu>
        </template>
      </MultiviewToolbar>
    </transition>
    <!-- Multiview Cell Area Background -->
    <multiview-background
      :show-tips="layout.length === 0"
      :column-width="columnWidth"
      :row-height="rowHeight"
      :collapse-toolbar="collapseToolbar"
      :style="{
        'background-size': `${columnWidth}px ${rowHeight}px`,
        height: `calc(100% - ${collapseToolbar ? 0 : 64}px - ${showSyncBar ? 100 : 0}px)`,
        top: `${collapseToolbar ? 0 : 64}px`,
      }"
    />
    <!-- Floating button to open toolbar when collapsed -->
    <v-btn
      v-if="collapseToolbar"
      class="open-mv-toolbar-btn"
      tile
      small
      color="secondary"
      @click="collapseToolbar = false"
    >
      <v-icon>{{ icons.mdiChevronDown }}</v-icon>
    </v-btn>

    <!-- Grid Layout -->
    <!-- rowHeight = 100vh/colNum, makes layout consistent across different heights -->
    <grid-layout
      :layout="layout"
      :col-num="24"
      :row-height="rowHeight - 26.0 / 24.0"
      :col-width="30"
      is-draggable
      is-resizable
      :vertical-compact="false"
      :prevent-collision="true"
      :margin="[1, 1]"
      @layout-updated="onLayoutUpdated"
    >
      <!-- This tells Vue not to try to re-order the elements but instead to create/delete them as required -->
      <TransitionGroup>
        <grid-item
          v-for="item in layout"
          :key="'mvitem' + item.i"
          :static="item.static"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :h="item.h"
          :i="item.i"
          :is-draggable="item.isDraggable !== false"
          :is-resizable="item.isResizable !== false"
          :style="showReorderLayout && {'pointer-events': 'none'}"
        >
          <cell-container :item="item">
            <ChatCell
              v-if="layoutContent[item.i] && layoutContent[item.i].type === 'chat'"
              :item="item"
              :tl="layoutContent[item.i].initAsTL"
              :cell-width="columnWidth * item.w"
              @delete="handleDelete"
            />
            <VideoCell
              v-else-if="layoutContent[item.i] && layoutContent[item.i].type === 'video'"
              ref="videoCell"
              :item="item"
              @delete="handleDelete"
            />
            <EmptyCell
              v-else
              :item="item"
              @showSelector="showSelectorForId = item.i"
              @delete="handleDelete"
            />
          </cell-container>
        </grid-item>
      </TransitionGroup>
    </grid-layout>

    <!-- Video Selector -->
    <v-dialog v-model="showVideoSelector" min-width="75vw" scrollable>
      <VideoSelector :is-active="showVideoSelector" @videoClicked="handleVideoClicked" />
    </v-dialog>

    <!-- Preset Selector -->
    <v-dialog v-model="showPresetSelector" width="1000" scrollable>
      <portal-target name="preset-dialog" />
    </v-dialog>

    <!-- Preset Editor -->
    <v-dialog v-model="showPresetEditor" scrollable>
      <PresetEditor
        v-if="showPresetEditor"
        :layout="layout"
        :content="layoutContent"
        @close="showPresetEditor = false"
      />
    </v-dialog>

    <LayoutChangePrompt
      v-model="overwriteDialog"
      :cancel-fn="overwriteCancel"
      :confirm-fn="overwriteConfirm"
      :default-overwrite="overwriteMerge"
      :layout-preview="overwriteLayoutPreview"
    />

    <v-dialog v-model="showReorderLayout" width="500" scrollable>
      <ReorderLayout :is-active="showReorderLayout" />
    </v-dialog>

    <media-controls v-model="showMediaControls" />
    <MultiviewSyncBar v-if="showSyncBar" class="mt-auto" />
  </div>
</template>

<script lang="ts">
import { GridLayout, GridItem } from "@/external/vue-grid-layout/src/components/index";
import MediaControls from "@/components/multiview/MediaControls.vue";
import EmptyCell from "@/components/multiview/EmptyCell.vue";
import VideoCell from "@/components/multiview/VideoCell.vue";
import ChatCell from "@/components/multiview/ChatCell.vue";
import CellContainer from "@/components/multiview/CellContainer.vue";
import PresetEditor from "@/components/multiview/PresetEditor.vue";
import PresetSelector from "@/components/multiview/PresetSelector.vue";
import MultiviewToolbar from "@/components/multiview/MultiviewToolbar.vue";
import MultiviewLayoutMixin from "@/components/multiview/MultiviewLayoutMixin";
import LayoutChangePrompt from "@/components/multiview/LayoutChangePrompt.vue";
import VideoSelector from "@/components/multiview/VideoSelector.vue";
import MultiviewBackground from "@/components/multiview/MultiviewBackground.vue";
import ReorderLayout from "@/components/multiview/ReorderLayout.vue";
import {
    mdiViewGridPlus, mdiCardPlus, mdiContentSave, mdiTuneVertical, mdiSync,
} from "@mdi/js";
import { decodeLayout } from "@/utils/mv-utils";
import { mapState, mapGetters } from "vuex";
import api from "@/utils/backend-api";
import { TWITCH_VIDEO_URL_REGEX } from "@/utils/consts";

export const reorderIcon = "M2 2h8.8v8.8H2V2Zm11.3 11.3H22V22h-8.8v-8.8Zm4.6-10.9a.6.6 0 0 0-1 0l-3.9 4a.6.6 0 1 0 .9.9l3.5-3.6L21 7.3a.6.6 0 0 0 .8-1l-4-4Zm.1 10V2.8h-1.2v9.6H18ZM5.7 21.6c.3.3.7.3 1 0l3.9-4a.6.6 0 1 0-.9-.9l-3.5 3.6-3.6-3.6a.6.6 0 1 0-.9 1l4 4Zm-.2-10v9.6h1.3v-9.6H5.5Z";

export default {
    name: "MultiView",
    components: {
        GridLayout,
        GridItem,
        VideoSelector,
        PresetSelector,
        VideoCell,
        EmptyCell,
        ChatCell,
        PresetEditor,
        MultiviewToolbar,
        LayoutChangePrompt,
        CellContainer,
        MediaControls,
        MultiviewBackground,
        MultiviewSyncBar: () => import("@/components/multiview/MultiviewSyncBar.vue"),
        ReorderLayout,
    },
    mixins: [MultiviewLayoutMixin],
    metaInfo() {
        const vm = this;
        return {
            get title() {
                return `${vm.$t("component.mainNav.multiview")} - Holodex`;
            },
        };
    },
    data() {
        return {
            mdiCardPlus,
            mdiTuneVertical,
            mdiContentSave,

            showSelectorForId: -1,
            showSyncBar: false,
            showReorderLayout: false,
            overwriteDialog: false, // whether to show the overwrite dialog.
            overwriteCancel: null, // callbacks that will be generated when needed.
            overwriteConfirm: null, // callbacks to be generated when needed.
            overwriteMerge: false, // if the layout will be merged.
            overwriteLayoutPreview: {},

            collapseToolbar: false,

            showPresetSelectorMenu: false,
            showPresetSelector: false,
            showPresetEditor: false,
            showMediaControls: false,
        };
    },
    computed: {
        buttons() {
            return Object.freeze([
                {
                    icon: mdiViewGridPlus,
                    tooltip: this.$t("views.multiview.addframe"),
                    onClick: this.addCellAutoLayout,
                    color: "green",
                },
                {
                    icon: mdiTuneVertical,
                    tooltip: this.$t("views.multiview.mediaControls"),
                    color: "orange",
                    onClick: () => {
                        this.showMediaControls = !this.showMediaControls;
                    },
                },
                {
                    icon: reorderIcon,
                    onClick: () => {
                        this.showReorderLayout = !this.showReorderLayout;
                    },
                    color: "indigo lighten-1",
                    tooltip: this.$t("views.multiview.reorderLayout"),
                },
                {
                    icon: mdiSync,
                    onClick: this.toggleSyncBar,
                    color: "deep-purple lighten-2",
                    tooltip: this.$t("views.multiview.archiveSync"),
                    collapse: this.$vuetify.breakpoint.xs,
                },
                {
                    icon: mdiContentSave,
                    onClick: () => {
                        this.showPresetEditor = true;
                    },
                    tooltip: this.$t("views.multiview.presetEditor.title"),
                    color: "secondary",
                    collapse: this.$vuetify.breakpoint.mdAndDown,
                },
                {
                    icon: this.icons.mdiDelete,
                    tooltip: this.$t("component.music.clearPlaylist"),
                    onClick: this.clearAllItems,
                    color: "red",
                    collapse: this.$vuetify.breakpoint.smAndDown,
                },
                {
                    icon: this.icons.mdiFullscreen,
                    onClick: this.toggleFullScreen,
                    tooltip: this.$t("views.multiview.fullScreen"),
                    collapse: this.$vuetify.breakpoint.mdAndDown,
                },
            ]);
        },
        ...mapState("multiview", ["layout", "layoutContent", "presetLayout", "autoLayout"]),
        ...mapGetters("multiview", ["activeVideos"]),
        // Return true if there's an id requesting, setting false is setting id to -1
        showVideoSelector: {
            get() {
                return this.showSelectorForId !== -1;
            },
            set(open) {
                if (!open) this.showSelectorForId = -1;
            },
        },
        isMobile() {
            return this.$store.state.isMobile;
        },
        rowHeight() {
            return (this.$vuetify.breakpoint.height
                - (this.collapseToolbar ? 0 : 64)
                - (this.showSyncBar ? 100 : 0)) / 24.0;
        },
        columnWidth() {
            return this.$vuetify.breakpoint.width / 24.0;
        },
        videoRefs() {
            return this.$refs.videoCell;
        },
    },
    async mounted() {
        // Check if permalink layout is empty
        if (this.$route.params.layout) {
            // TODO: verify layout
            try {
                const parsed = decodeLayout(this.$route.params.layout);
                if (parsed.layout && parsed.content) {
                    try {
                        // Record link open for popularity metrics
                        api.trackMultiviewLink(this.$route.params.layout).then(console.log).catch(console.error);
                        // eslint-disable-next-line no-empty
                    } catch {}

                    // prompt overwrite with permalink, remove permalink if cancelled, use history.pushState for silent update
                    // eslint-disable-next-line no-restricted-globals
                    this.promptLayoutChange(parsed, null, () => history.pushState({}, "", "/multiview"));
                }
            } catch (e) {
                console.error(e);
                console.log("invalid layout");
            }

            // Show sync bar if query contains t= or offsets=
            if (this.$route.query.t || this.$route.query.offsets) {
                this.showSyncBar = true;
            }
        } else {
            this.$store.dispatch("multiview/fetchVideoData", { refreshLive: true });
        }
    },
    methods: {
        // prompt user for layout change
        promptLayoutChange(layoutWithContent, confirmFunction, cancelFunction) {
            // a dialog is already active
            if (this.overwriteDialog) {
                return;
            }
            // no layout, overwrite without asking
            if (!this.layout || Object.keys(this.layout).length === 0) {
                this.setMultiview(layoutWithContent);
                return;
            }
            // show dialog with confirm or cancel functions
            this.overwriteLayoutPreview = layoutWithContent;
            this.overwriteConfirm = () => {
                // hide dialog
                this.overwriteDialog = false;
                this.setMultiview({
                    ...layoutWithContent,
                    mergeContent: this.overwriteMerge,
                });
                // call any extra functions
                confirmFunction && confirmFunction();
            };
            this.overwriteCancel = () => {
                this.overwriteDialog = false;
                cancelFunction && cancelFunction();
            };

            // show the dialog
            this.overwriteDialog = true;
        },
        handleToolbarClick(v) {
            const video = this.checkStreamType(v);
            if (!video) return;
            const hasEmptyCell = this.findEmptyCell();
            // more cells needed, increment to next preset with space
            if (!hasEmptyCell) {
                // Find new layout and set/prompt layout
                this.addVideoAutoLayout(video, (newLayout) => {
                    // User made edits to a preset, prompt them to overwrite
                    this.overwriteMerge = true;
                    this.promptLayoutChange(
                        newLayout,
                        // set new layout, and try to fill with video
                        () => {
                            this.tryFillVideo(video);
                        },
                    );
                });
            } else {
                // autolayout is not on, or there is an empty cell, just try filling
                this.tryFillVideo(video);
            }
        },
        handleVideoClicked(v) {
            if (this.showSelectorForId < -1) {
                this.handleToolbarClick(v);
                this.showSelectorForId = -1;
                return;
            }
            const video = this.checkStreamType(v);
            if (!video) return;
            this.addVideoWithId(video, this.showSelectorForId);
            this.showSelectorForId = -1;
        },
        handleToolbarShowSelector() {
            // Show selector and pass video to auto layout handler
            this.showSelectorForId = -2;
        },
        handlePresetClicked(preset) {
            this.showPresetSelector = false;
            this.setMultiview({
                ...JSON.parse(JSON.stringify(preset)),
                mergeContent: true,
            });
        },
        handleDelete(id) {
            this.deleteVideoAutoLayout(id);
        },
        onLayoutUpdated(newLayout) {
            this.$store.commit("multiview/setLayout", newLayout);
        },
        toggleFullScreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        },
        toggleSyncBar() {
            this.showSyncBar = !this.showSyncBar;
        },
        checkStreamType(v) {
            let video = v;
            if (video.type === "placeholder") {
                const twitchChannel = video.link.match(TWITCH_VIDEO_URL_REGEX)?.groups.id;
                if (!twitchChannel) return;
                video = {
                    ...video,
                    id: twitchChannel,
                    type: "twitch",
                };
            }
            // eslint-disable-next-line consistent-return
            return video;
        },
    },
};
</script>

<style lang="scss">

.multiview {
    width: 100%;
    height: 100%;
}
.mobile-helpers {
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    // margin-bottom: env(safe-area-inset-bottom);
    .edit-mode {
        padding: 5px;
        padding-bottom: 20px;
    }
}
.open-mv-toolbar-btn {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 10;
    opacity: 0.5;
}
.vue-grid-item {
    transition: none;
}

.vue-grid-layout {
    transition: none;
}

.hints {
    div {
        margin-bottom: 10px;
    }
}

.slide-enter-active, .slide-leave-active {
      transition: all 0.3s ease-out;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(-64px);
  opacity: 0;
}

.slide-enter {
    transform: translateY(-64px);
    opacity: 1;
}
</style>
