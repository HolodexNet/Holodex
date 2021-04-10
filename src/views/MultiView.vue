<template>
    <div style="width: 100%" :class="{ 'mobile-helpers': $store.state.isMobile }" ref="fullscreen-content">
        <!-- Floating tool bar -->
        <!-- <transition name="slide-y-transition" mode="out-in"> -->
        <v-toolbar class="mv-toolbar" style="right: 0" v-show="!collapseToolbar">
            <v-app-bar-nav-icon @click="toggleMainNav"></v-app-bar-nav-icon>
            <!-- Toolbar Live Video Selector -->
            <div
                class="justify-start d-flex mv-toolbar-btn align-center thin-scroll-bar"
                style="overflow-x: auto; overflow-y: hidden"
                v-if="!$vuetify.breakpoint.xs"
            >
                <VideoSelector horizontal @videoClicked="handleToolbarClick" />
            </div>
            <!-- Single Button video selector for xs displays -->
            <div v-else>
                <v-btn @click="handleToolbarShowSelector" icon>
                    <v-icon size="30" style="border-radius: 0">{{ mdiCardPlus }}</v-icon>
                </v-btn>
            </div>
            <!-- Right side buttons -->
            <div
                class="flex-grow-1 justify-end d-flex mv-toolbar-btn align-center"
                :class="{ 'no-btn-text': $store.state.isMobile || true }"
            >
                <!-- <v-switch v-model="autoLayout" hide-details></v-switch> -->
                <v-btn @click="addItem" color="green" icon>
                    <v-icon>{{ mdiViewGridPlus }}</v-icon>
                    <span class="collapsible-text">{{ $t("views.multiview.addframe") }}</span>
                </v-btn>
                <v-btn @click="clearAllItems" color="red" icon>
                    <v-icon>{{ icons.mdiRefresh }}</v-icon>
                    <span class="collapsible-text">{{ $t("component.music.clearPlaylist") }}</span>
                </v-btn>
                <v-btn color="primary" @click="showPresetSelector = true" icon>
                    <v-icon>{{ icons.mdiGridLarge }}</v-icon>
                    <span class="collapsible-text">{{ $t("views.multiview.presets") }}</span>
                </v-btn>
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
                        <v-card-text>
                            <v-text-field
                                readonly
                                solo-inverted
                                dense
                                hide-details
                                :class="doneCopy ? 'green lighten-2' : ''"
                                :value="exportURL"
                                :append-icon="mdiClipboardPlusOutline"
                                @click:append.stop="startCopyToClipboard(exportURL)"
                                style="ma-1"
                            ></v-text-field>
                        </v-card-text>
                    </v-card>
                </v-menu>
                <v-btn @click="toggleFullScreen" icon>
                    <v-icon>{{ icons.mdiFullscreen }}</v-icon>
                </v-btn>
                <v-btn icon @click="collapseToolbar = true">
                    <v-icon>{{ icons.mdiChevronUp }}</v-icon>
                </v-btn>
            </div>
        </v-toolbar>
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
            :layout.sync="layout"
            :col-num="24"
            :row-height="($vuetify.breakpoint.height - 26.0 - (collapseToolbar ? 0 : 64)) / 24.0"
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
                :is-draggable="item.isDraggable"
                :is-resizable="item.isResizable"
                :key="'mvgrid' + item.i"
            >
                <cell :item="item" @showSelector="(id) => (showSelectorForId = id)"> </cell>
            </grid-item>
        </grid-layout>

        <!-- Video Selector -->
        <v-dialog v-model="showVideoSelector" width="1000">
            <VideoSelector @videoClicked="handleVideoClicked" />
        </v-dialog>

        <!-- Preset Selector -->
        <v-dialog v-model="showPresetSelector" width="1000">
            <PresetSelector @selected="handlePresetClicked" />
        </v-dialog>

        <!-- Confirmation for deleting layout -->
        <v-dialog v-model="overwriteDialog" width="400">
            <v-card>
                <v-card-title> {{ $t("views.multiview.confirmOverwrite") }} </v-card-title>
                <v-card-text class="d-flex flex-column justify-center align-center">
                    <LayoutPreview :layout="layoutPreview" />
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
} from "@mdi/js";
import copyToClipboard from "@/mixins/copyToClipboard";
import { encodeLayout, decodeLayout, desktopPresets } from "@/utils/mv-layout";
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

            showSelectorForId: -1,
            shareDialog: false,
            collapseToolbar: false,

            overwriteDialog: false, // whether to show the overwrite dialog.
            overwriteCancel: null, // callbacks that will be generated when needed.
            overwriteConfirm: null, // callbacks to be generated when needed.
            overwriteMerge: false, // if the layout will be merged.

            showPresetSelector: false,

            layoutPreview: [],
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
        ...mapState("multiview", ["layout", "layoutContent"]),
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
        exportURL() {
            const layoutParam = `/${encodeURIComponent(
                encodeLayout({
                    layout: this.layout,
                    contents: this.layoutContent,
                }),
            )}`;
            return `${window.origin}/multiview${layoutParam}`;
        },
        decodedDesktopPresets() {
            return desktopPresets.map((preset) => {
                return {
                    ...preset,
                    ...decodeLayout(preset.layout),
                };
            });
        },
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
            this.layoutPreview = layoutWithContent.layout;
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
            // find an empty cell and show selector for it
            const emptyCell = this.findEmptyCell();
            if (emptyCell) {
                this.showSelectorForId = emptyCell.i;
            }
        },
        handleToolbarClick(video) {
            const hasEmptyCell = this.findEmptyCell();
            // more cells needed, increment to next preset with space
            if (!hasEmptyCell) {
                // find layout with space for one more new video
                const newLayout = this.decodedDesktopPresets.find(
                    (preset) => preset.emptyCells >= this.activeVideos.length + 1,
                );

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
            const toCompare = this.decodedDesktopPresets.filter((preset) => {
                return preset.emptyCells && preset.layout.length === currentLayout.length;
            });

            // there's no presets with equal cells
            if (!toCompare) return false;

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
                let activeVideosIndex = 0;
                // filter out already set items
                layout
                    .filter((item) => {
                        return !content[item.i];
                    })
                    .forEach((item) => {
                        // fill until there's no more current videos
                        if (activeVideosIndex >= this.activeVideos.length) {
                            return;
                        }
                        const key = item.i;
                        contentsToMerge[key] = {
                            type: "video",
                            content: this.activeVideos[activeVideosIndex],
                        };
                        activeVideosIndex += 1;
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
    margin-right: 4px;
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
</style>
