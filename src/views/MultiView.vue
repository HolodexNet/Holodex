<template>
    <div style="width: 100%" :class="{ 'mobile-helpers': $store.state.isMobile }" ref="fullscreen-content">
        <!-- Floating tool bar -->
        <v-toolbar class="mv-toolbar" style="right: 0" v-show="!collapseToolbar" height="64">
            <v-app-bar-nav-icon @click="toggleMainNav"></v-app-bar-nav-icon>
            <!-- Toolbar Live Video Selector -->
            <div
                class="justify-start d-flex mv-toolbar-btn align-center thin-scroll-bar"
                style="overflow-x: auto; overflow-y: hidden"
            >
                <VideoSelector v-if="!collapseButtons" horizontal @videoClicked="handleToolbarClick" />
                <!-- Single Button video selector for xs displays -->
                <v-btn @click="handleToolbarShowSelector" icon large>
                    <v-icon style="border-radius: 0 position: relative; margin-right: 3px; cursor: pointer" large>
                        {{ mdiCardPlus }}
                    </v-icon>
                </v-btn>
            </div>
            <!-- Right side buttons -->
            <div
                class="flex-grow-1 justify-end d-flex mv-toolbar-btn align-center"
                :class="{ 'no-btn-text': $store.state.isMobile || true }"
            >
                <!-- <v-switch v-model="autoLayout" hide-details></v-switch> -->
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn @click="addItem" color="green" icon v-bind="attrs" v-on="on">
                            <v-icon>{{ mdiViewGridPlus }}</v-icon>
                        </v-btn>
                    </template>
                    <span>{{ $t("views.multiview.addframe") }}</span>
                </v-tooltip>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn @click="clearAllItems" color="red" icon v-bind="attrs" v-on="on">
                            <v-icon>{{ icons.mdiRefresh }}</v-icon>
                        </v-btn>
                    </template>
                    <span>{{ $t("component.music.clearPlaylist") }}</span>
                </v-tooltip>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn color="primary" @click="showPresetSelector = true" icon v-bind="attrs" v-on="on">
                            <v-icon>{{ icons.mdiGridLarge }}</v-icon>
                        </v-btn>
                    </template>
                    <span>{{ $t("views.multiview.presets") }}</span>
                </v-tooltip>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn @click="setMuteAll(true)" icon v-bind="attrs" v-on="on" v-show="!collapseButtons">
                            <v-icon>{{ icons.mdiVolumeMute }}</v-icon>
                        </v-btn>
                    </template>
                    <span>{{ $t("views.multiview.muteAll") }}</span>
                </v-tooltip>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn @click="setMuteAll(false)" icon v-bind="attrs" v-on="on" v-show="!collapseButtons">
                            <v-icon>{{ icons.mdiVolumeHigh }}</v-icon>
                        </v-btn>
                    </template>
                    <span>{{ $t("views.multiview.unmuteAll") }}</span>
                </v-tooltip>
                <v-menu
                    :open-on-click="true"
                    bottom
                    nudge-bottom="40px"
                    :close-on-content-click="false"
                    :open-on-hover="false"
                    v-model="shareDialog"
                    width="400"
                    z-index="300"
                >
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn v-bind="attrs" v-on="on" icon>
                            <v-icon>{{ mdiLinkVariant }}</v-icon>
                            <span class="collapsible-text">{{ $t("views.multiview.permalink") }}</span>
                        </v-btn>
                    </template>

                    <v-card rounded="lg">
                        <v-card-text class="d-flex">
                            <v-text-field
                                readonly
                                solo-inverted
                                dense
                                hide-details
                                :class="doneCopy ? 'green lighten-2' : ''"
                                :value="exportURL"
                                :append-icon="mdiClipboardPlusOutline"
                                @click:append.stop="startCopyToClipboard(exportURL)"
                            ></v-text-field>
                            <v-btn icon @click="showPresetEditor = true">
                                <v-icon>{{ mdiContentSave }}</v-icon>
                            </v-btn>
                        </v-card-text>
                    </v-card>
                </v-menu>

                <v-btn @click="toggleFullScreen" icon>
                    <v-icon>{{ icons.mdiFullscreen }}</v-icon>
                </v-btn>
                <v-menu offset-y>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn v-bind="attrs" v-on="on" icon v-show="collapseButtons">
                            <v-icon>{{ icons.mdiDotsVertical }}</v-icon>
                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-item @click="setMuteAll(false)" block class="mb-2">
                            <v-icon left>{{ icons.mdiVolumeHigh }}</v-icon>
                            <span>{{ $t("views.multiview.unmuteAll") }}</span>
                        </v-list-item>
                        <v-list-item @click="setMuteAll(true)" block>
                            <v-icon color="red" left>{{ icons.mdiVolumeMute }}</v-icon>
                            <span>{{ $t("views.multiview.muteAll") }}</span>
                        </v-list-item>
                    </v-list>
                </v-menu>
                <v-btn icon @click="collapseToolbar = true">
                    <v-icon>{{ icons.mdiChevronUp }}</v-icon>
                </v-btn>
            </div>
        </v-toolbar>

        <!-- Multiview Cell Area Background -->
        <div
            class="mv-background"
            :style="{
                'background-size': `${columnWidth}px ${rowHeight}px`,
                height: `${rowHeight * 24}px`,
            }"
        >
            <template v-if="layout.length === 0">
                <div style="max-width: 50%; display: inline-block">
                    <div style="display: inline-block; margin-right: 20px; margin-left: 10px">
                        <div style="height: 10vh; border: 1px solid gray; width: 1px; margin-left: 50%" />
                        {{ $t("views.multiview.autoLayoutTip") }}
                    </div>
                </div>
                <div style="max-width: 50%; display: inline-block; float: right">
                    <div style="display: inline-block; margin-right: 10px">
                        <div style="height: 10vh; border: 1px solid gray; width: 1px; margin-left: 50%" />
                        {{ $t("views.multiview.createLayoutTip") }}
                    </div>
                </div>
            </template>
        </div>
        <!-- Floating button to open toolbar when collapsed -->
        <v-btn
            v-if="collapseToolbar"
            @click="collapseToolbar = false"
            class="open-mv-toolbar-btn"
            tile
            small
            color="secondary"
        >
            <v-icon>{{ icons.mdiChevronDown }}</v-icon>
        </v-btn>
        <!-- </transition> -->
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
            @layout-updated="layoutUpdatedEvent"
        >
            <grid-item
                v-for="item in layout"
                :static="item.static"
                :x="item.x"
                :y="item.y"
                :w="item.w"
                :h="item.h"
                :i="item.i"
                :isDraggable="item.isDraggable !== false"
                :isResizable="item.isResizable !== false"
                :key="'mvgrid' + item.i"
            >
                <cell :item="item" @showSelector="(id) => (showSelectorForId = id)" @delete="handleDelete"> </cell>
            </grid-item>
        </grid-layout>

        <!-- Video Selector -->
        <v-dialog v-model="showVideoSelector" min-width="75vw">
            <VideoSelector @videoClicked="handleVideoClicked" />
        </v-dialog>

        <!-- Preset Selector -->
        <v-dialog v-model="showPresetSelector" width="1000">
            <PresetSelector @selected="handlePresetClicked" />
        </v-dialog>

        <!-- Preset Editor -->
        <v-dialog v-model="showPresetEditor" width="500">
            <PresetEditor
                v-if="showPresetEditor"
                :layout="layout"
                :content="layoutContent"
                @close="showPresetEditor = false"
            />
        </v-dialog>

        <!-- Confirmation for deleting layout -->
        <v-dialog v-model="overwriteDialog" width="400">
            <v-card>
                <v-card-title> {{ $t("views.multiview.confirmOverwrite") }} </v-card-title>
                <v-card-text class="d-flex flex-column justify-center align-center">
                    <LayoutPreview :layout="layoutPreview.layout" :content="layoutPreview.content" />
                    <v-checkbox
                        v-model="overwriteMerge"
                        :label="`Fill empty cells with current videos`"
                        hide-details
                    ></v-checkbox>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" text @click="overwriteConfirm">
                        {{ $t("views.multiview.confirmOverwriteYes") }}
                    </v-btn>
                    <v-btn color="primary" text @click="overwriteCancel">
                        {{ $t("views.library.deleteConfirmationCancel") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import VueYouTubeEmbed from "vue-youtube-embed";
import Vue from "vue";
import { GridLayout, GridItem } from "@/external/vue-grid-layout/src/components/index";
import VideoSelector from "@/components/multiview/VideoSelector.vue";
import {
    mdiMessage,
    mdiResizeBottomRight,
    mdiViewGridPlus,
    mdiLinkVariant,
    mdiClipboardPlusOutline,
    mdiDelete,
    mdiCardPlus,
    mdiContentSave,
} from "@mdi/js";
import copyToClipboard from "@/mixins/copyToClipboard";
import { encodeLayout, decodeLayout, desktopPresets, mobilePresets } from "@/utils/mv-layout";
import PresetEditor from "@/components/multiview/PresetEditor.vue";
import PresetSelector from "@/components/multiview/PresetSelector.vue";
import LayoutPreview from "@/components/multiview/LayoutPreview.vue";
import Cell from "@/components/multiview/Cell.vue";
import { mapState, mapGetters } from "vuex";

export default {
    name: "MultiView",
    components: {
        GridLayout,
        GridItem,
        VideoSelector,
        PresetSelector,
        LayoutPreview,
        Cell,
        PresetEditor,
    },
    mixins: [copyToClipboard],
    data() {
        return {
            mdiMessage,
            mdiResizeBottomRight,
            mdiViewGridPlus,
            mdiClipboardPlusOutline,
            mdiLinkVariant,
            mdiDelete,
            mdiCardPlus,
            mdiContentSave,

            showSelectorForId: -1,
            shareDialog: false,
            collapseToolbar: false,

            overwriteDialog: false, // whether to show the overwrite dialog.
            overwriteCancel: null, // callbacks that will be generated when needed.
            overwriteConfirm: null, // callbacks to be generated when needed.
            overwriteMerge: false, // if the layout will be merged.

            showPresetSelector: false,
            showPresetEditor: false,

            layoutPreview: {},
        };
    },
    mounted() {
        // Check if permalink layout is empty
        if (this.$route.params.layout) {
            // TODO: verify layout
            try {
                const parsed = decodeLayout(this.$route.params.layout);
                if (parsed.layout && parsed.content) {
                    // prompt overwrite with permalink, remove permalink if cancelled
                    this.promptLayoutChange(parsed, null, () => this.$router.replace({ path: "/multiview" }));
                }
            } catch (e) {
                console.log("invalid layout");
            }
        }
    },
    created() {
        Vue.use(VueYouTubeEmbed);
    },
    computed: {
        ...mapState("multiview", ["layout", "layoutContent", "presetLayout"]),
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
        decodedCustomPresets() {
            return this.presetLayout.map((preset) => {
                return {
                    ...preset,
                    ...decodeLayout(preset.layout),
                };
            });
        },
        decodedDesktopPresets() {
            return desktopPresets.map((preset) => {
                return {
                    ...preset,
                    ...decodeLayout(preset.layout),
                };
            });
        },
        decodedMobilePresets() {
            return mobilePresets.map((preset) => {
                return {
                    ...preset,
                    ...decodeLayout(preset.layout),
                };
            });
        },
        exportURL() {
            if (!this.shareDialog) return "";
            const layoutParam = `/${encodeURIComponent(
                encodeLayout({
                    layout: this.layout,
                    contents: this.layoutContent,
                    includeVideo: true,
                }),
            )}`;
            return `${window.origin}/multiview${layoutParam}`;
        },
        isMobile() {
            return this.$store.state.isMobile;
        },
        collapseButtons() {
            return this.$vuetify.breakpoint.xs;
        },
        rowHeight() {
            return (this.$vuetify.breakpoint.height - (this.collapseToolbar ? 0 : 64)) / 24.0;
        },
        columnWidth() {
            return this.$vuetify.breakpoint.width / 24.0;
        },
    },
    methods: {
        setMuteAll(val) {
            Object.keys(this.layoutContent).forEach((key) => {
                const content = this.layoutContent[key];
                if (content.type === "video") {
                    this.$store.commit("multiview/muteLayoutContent", { id: key, value: val });
                }
            });
        },
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
            this.layoutPreview = layoutWithContent;
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
        startCopyToClipboard(txt) {
            this.copyToClipboard(txt);
            const thisCopy = this;
            setTimeout(() => {
                thisCopy.shareDialog = false;
            }, 200);
        },
        handleVideoClicked(video) {
            if (this.showSelectorForId < -1) {
                this.handleToolbarClick(video);
                this.showSelectorForId = -1;
                return;
            }
            // set video for a specific cell id
            this.$store.commit("multiview/setLayoutContentById", {
                id: this.showSelectorForId,
                content: {
                    type: "video",
                    content: video,
                },
            });
            this.showSelectorForId = -1;
        },
        handleToolbarShowSelector() {
            // Show selector and pass video to auto layout handler
            this.showSelectorForId = -2;
        },
        handleToolbarClick(video) {
            const hasEmptyCell = this.findEmptyCell();
            // more cells needed, increment to next preset with space
            if (!hasEmptyCell) {
                // find layout with space for one more new video
                const presets = this.decodedCustomPresets.concat(
                    this.isMobile ? this.decodedMobilePresets : this.decodedDesktopPresets,
                );
                const newLayout =
                    presets.find((preset) => preset.emptyCells === this.activeVideos.length + 1) ??
                    presets.find((preset) => preset.emptyCells >= this.activeVideos.length + 1);

                // found new layout
                if (newLayout) {
                    // deep clone preset
                    const clonedLayout = JSON.parse(JSON.stringify(newLayout));

                    // if the current layout is a preset or empty, set next layout without prompting
                    if (!this.layout.length || this.isPreset(this.layout)) {
                        this.setMultiview({
                            ...clonedLayout,
                            mergeContent: true,
                        });
                        this.tryFillVideo(video);
                        return;
                    }

                    // User made edits to a preset, prompt them to overwrite
                    this.overwriteMerge = true;
                    this.promptLayoutChange(
                        clonedLayout,
                        // set new layout, and try to fill with video
                        () => {
                            this.tryFillVideo(video);
                        },
                    );
                }
            } else {
                // autolayout is not on, or there is an empty cell, just try filling
                this.tryFillVideo(video);
            }
        },
        isPreset(currentLayout) {
            // filter out any presets that dont match the amount of cells
            const toCompare = this.decodedCustomPresets
                .concat(this.isMobile ? this.decodedMobilePresets : this.decodedDesktopPresets)
                .filter((preset) => {
                    return preset.emptyCells && preset.layout.length === currentLayout.length;
                });

            // there's no presets with equal cells
            if (toCompare.length === 0) return false;

            let fullMatch = false;

            // go through each preset, and check for full matching layouts
            toCompare.forEach((preset) => {
                if (fullMatch) return;
                for (let i = 0; i < currentLayout.length; i += 1) {
                    const presetCell = preset.layout[i];
                    const layoutCell = currentLayout[i];

                    if (
                        !(
                            presetCell.x === layoutCell.x &&
                            presetCell.y === layoutCell.y &&
                            presetCell.w === layoutCell.w &&
                            presetCell.h === layoutCell.h &&
                            presetCell.i === layoutCell.i
                        )
                    ) {
                        return;
                    }
                }
                fullMatch = true;
            });

            return fullMatch;
        },
        tryFillVideo(video) {
            // try find empty cell
            const emptyCell = this.findEmptyCell();
            if (emptyCell) {
                this.$store.commit("multiview/setLayoutContentById", {
                    id: emptyCell.i,
                    content: {
                        type: "video",
                        content: video,
                    },
                });
            }
            // TODO: snack bar saying no valid empty cells
        },
        findEmptyCell() {
            return this.layout.find((l) => {
                return !this.layoutContent[l.i];
            });
        },
        handlePresetClicked(preset) {
            this.showPresetSelector = false;
            this.setMultiview({
                ...preset,
                mergeContent: true,
            });
        },
        layoutUpdatedEvent(newLayout) {
            this.$store.commit("multiview/setLayout", newLayout);
        },
        removeItemById(i) {
            this.$store.commit("multiview/removeLayoutItem", i);
        },
        clearAllItems() {
            this.$store.commit("multiview/resetState");
        },
        addItem() {
            this.$store.commit("multiview/addLayoutItem");
        },
        setMultiview({ layout, content, mergeContent = false }) {
            if (mergeContent) {
                const contentsToMerge = {};
                let currentIndex = 0;
                const currentContent = Object.values(this.layoutContent).filter((o) => (o as any).type === "video");
                // filter out already set items
                layout
                    .filter((item) => {
                        return !content[item.i];
                    })
                    .forEach((item) => {
                        // fill until there's no more current videos
                        if (currentIndex >= this.activeVideos.length) {
                            return;
                        }

                        // get next video to fill this item's cell
                        const key = item.i;
                        const c: any = currentContent[currentIndex];

                        contentsToMerge[key] = c;
                        currentIndex += 1;
                    });
                // merge by key, prefer incoming content
                const merged = {
                    ...contentsToMerge,
                    ...content,
                };
                this.$store.commit("multiview/setLayoutContent", merged);
            } else {
                this.$store.commit("multiview/setLayoutContent", content);
            }
            this.$store.commit("multiview/setLayout", layout);
        },
        handleDelete(id) {
            // Check if preset and downgrade layout, if cell being deleted is video
            if (this.isPreset(this.layout) && this.layoutContent[id] && this.layoutContent[id].type !== "chat") {
                // Clear everything if it's 1 video 1 chat
                if (this.layout.length - 1 <= 1) {
                    this.clearAllItems();
                    return;
                }

                // Find and set to previous preset layout
                const presets = this.isMobile ? this.decodedMobilePresets : this.decodedDesktopPresets;
                const newLayout = presets.find((preset) => preset.emptyCells >= this.activeVideos.length - 1);
                const clonedLayout = JSON.parse(JSON.stringify(newLayout));
                this.$store.commit("multiview/deleteLayoutContent", id);
                this.setMultiview({
                    ...clonedLayout,
                    mergeContent: true,
                });
            }
            // Default: delete item
            else {
                this.$store.commit("multiview/removeLayoutItem", id);
            }
        },
        toggleFullScreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        },
        toggleMainNav() {
            return this.$store.commit("setNavDrawer", !this.$store.state.navDrawer);
        },
    },
};
</script>

<style lang="scss">
.mv-background {
    opacity: 0.75;
    position: absolute;
    width: 100%;
    background-repeat: initial;
    background-image: linear-gradient(to right, rgba(128, 128, 128, 0.15) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(128, 128, 128, 0.15) 1px, transparent 1px);
}
.mobile-helpers {
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    margin-bottom: env(safe-area-inset-bottom);

    .edit-mode {
        padding: 5px;
        .returnbtn {
            margin-left: -17px !important;
        }
    }
}
.mv-toolbar-btn .v-btn.v-btn--icon.v-size--default {
    // margin-right: 4px;
    height: 36px;
    width: 36px;
}

.mv-toolbar-btn.no-btn-text > .v-btn > .v-btn__content > .collapsible-text {
    display: none;
}

.collapsible-text {
    margin-left: 2px;
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

.mv-toolbar-btn.thin-scroll-bar::-webkit-scrollbar-track {
    background: rgba(99, 46, 46, 0.5);
}
.mv-toolbar-btn.thin-scroll-bar::-webkit-scrollbar-thumb {
    background: #f06291a2;
}
</style>
