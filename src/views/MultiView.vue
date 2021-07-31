<template>
    <div ref="fullscreen-content" style="width: 100%" :class="{ 'mobile-helpers': $store.state.isMobile }">
        <!-- Floating tool bar -->
        <!--  -->
        <MultiviewToolbar v-show="!collapseToolbar" v-model="collapseToolbar" :buttons="buttons">
            <template #left>
                <VideoSelector v-if="!$vuetify.breakpoint.xs" horizontal @videoClicked="handleToolbarClick" />
                <!-- Single Button video selector for xs displays -->
                <v-btn icon large @click="handleToolbarShowSelector">
                    <v-icon style="border-radius: 0 position: relative; margin-right: 3px; cursor: pointer" large>
                        {{ mdiCardPlus }}
                    </v-icon>
                </v-btn>
            </template>
        </MultiviewToolbar>

        <!-- Multiview Cell Area Background -->
        <div
            class="mv-background"
            :style="{
                'background-size': `${columnWidth}px ${rowHeight}px`,
                height: `calc(100% - ${collapseToolbar ? 0 : 64}px)`,
                top: `${collapseToolbar ? 0 : 64}px`,
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
            <grid-item
                v-for="item in layout"
                :key="'mvgrid' + item.i"
                :static="item.static"
                :x="item.x"
                :y="item.y"
                :w="item.w"
                :h="item.h"
                :i="item.i"
                :is-draggable="item.isDraggable !== false"
                :is-resizable="item.isResizable !== false"
            >
                <cell
                    :ref="`cell`"
                    :cell-width="columnWidth * item.w"
                    :item="item"
                    @showSelector="(id) => (showSelectorForId = id)"
                    @delete="handleDelete"
                />
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

        <LayoutChangePrompt
            v-model="overwriteDialog"
            :cancel-fn="overwriteCancel"
            :confirm-fn="overwriteConfirm"
            :default-overwrite="overwriteMerge"
            :layout-preview="overwriteLayoutPreview"
        />

        <v-dialog v-model="showMediaControls" max-width="400">
            <v-card max-height="75vh" class="overflow-y-auto">
                <v-card-title> {{ $t("views.multiview.mediaControls") }} </v-card-title>
                <v-card-text class="d-flex flex-column justify-center align-center">
                    <v-list max-width="100%">
                        <v-list-item single-line style="border-bottom: 1px gray solid">
                            <v-list-item-content>
                                <v-list-item-action class="flex-row justify-center ma-0 mt-1">
                                    <v-btn icon @click="allCellAction('play')">
                                        <v-icon color="secondary lighten-1">
                                            {{ icons.mdiPlay }}
                                        </v-icon>
                                    </v-btn>
                                    <v-btn icon @click="allCellAction('pause')">
                                        <v-icon color="secondary lighten-1">
                                            {{ mdiPause }}
                                        </v-icon>
                                    </v-btn>
                                    <v-btn icon @click="allCellAction('refresh')">
                                        <v-icon color="secondary lighten-1">{{ icons.mdiRefresh }}</v-icon>
                                    </v-btn>
                                    <v-btn icon @click="allCellAction('unmute')">
                                        <v-icon color="secondary lighten-1">
                                            {{ icons.mdiVolumeHigh }}
                                        </v-icon>
                                    </v-btn>
                                    <v-btn icon @click="allCellAction('mute')">
                                        <v-icon color="secondary lighten-1">
                                            {{ icons.mdiVolumeMute }}
                                        </v-icon>
                                    </v-btn>
                                </v-list-item-action>
                            </v-list-item-content>
                        </v-list-item>
                        <template v-if="$refs['cell'] && $refs['cell'].filter((c) => c.video).length">
                            <v-list-item
                                v-for="(cellState, index) in $refs['cell'].filter((c) => c.video)"
                                :key="index"
                                two-line
                                style="border-bottom: 1px gray solid"
                            >
                                <v-list-item-avatar v-if="cellState.video.channel.photo" class="ma-0 mr-1">
                                    <v-img :src="cellState.video.channel.photo" />
                                </v-list-item-avatar>
                                <v-list-item-content>
                                    <v-list-item-title class="primary--text">
                                        {{ cellState.video.title || cellState.video.channel.name }}
                                    </v-list-item-title>
                                    <!-- <v-list-item-subtitle>
                                        {{ cellState.video.channel.english_name || cellState.video.channel.name  }}
                                    </v-list-item-subtitle> -->
                                    <v-list-item-action class="flex-row justify-start ma-0 mt-1">
                                        <v-btn icon @click="cellState.setPlaying(cellState.pausedMode)">
                                            <v-icon color="grey lighten-1">
                                                {{ cellState.pausedMode ? icons.mdiPlay : mdiPause }}
                                            </v-icon>
                                        </v-btn>
                                        <v-btn icon @click="cellState.refresh()">
                                            <v-icon color="grey lighten-1">{{ icons.mdiRefresh }}</v-icon>
                                        </v-btn>
                                        <v-btn icon @click="handleDelete(findKeyByVideoId(cellState.cellContent.id))">
                                            <v-icon color="grey lighten-1">{{ icons.mdiDelete }}</v-icon>
                                        </v-btn>
                                        <v-btn icon @click="cellState.setMuted(!cellState.muted)">
                                            <v-icon color="grey lighten-1">
                                                {{ cellState.muted ? icons.mdiVolumeMute : icons.mdiVolumeHigh }}
                                            </v-icon>
                                        </v-btn>
                                    </v-list-item-action>
                                </v-list-item-content>
                            </v-list-item>
                        </template>
                        <v-list-item v-else class="pa-2">
                            {{ $t("views.multiview.mediaControlsEmpty") }}
                        </v-list-item>
                    </v-list>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import VueYoutube from "@/external/vue-youtube";

import { GridLayout, GridItem } from "@/external/vue-grid-layout/src/components/index";
import Cell from "@/components/multiview/Cell.vue";
import PresetEditor from "@/components/multiview/PresetEditor.vue";
import PresetSelector from "@/components/multiview/PresetSelector.vue";
import MultiviewToolbar from "@/components/multiview/MultiviewToolbar.vue";
import MultiviewLayoutMixin from "@/components/multiview/MultiviewLayoutMixin";
import LayoutChangePrompt from "@/components/multiview/LayoutChangePrompt.vue";
import VideoSelector from "@/components/multiview/VideoSelector.vue";
import { mdiViewGridPlus, mdiCardPlus, mdiContentSave, mdiPause, mdiTuneVertical } from "@mdi/js";
import { Content, decodeLayout } from "@/utils/mv-utils";
import { mapState, mapGetters } from "vuex";
import api from "@/utils/backend-api";

export default {
    name: "MultiView",
    components: {
        GridLayout,
        GridItem,
        VideoSelector,
        PresetSelector,
        Cell,
        PresetEditor,
        MultiviewToolbar,
        LayoutChangePrompt,
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
            mdiPause,

            showSelectorForId: -1,

            overwriteDialog: false, // whether to show the overwrite dialog.
            overwriteCancel: null, // callbacks that will be generated when needed.
            overwriteConfirm: null, // callbacks to be generated when needed.
            overwriteMerge: false, // if the layout will be merged.
            overwriteLayoutPreview: {},

            collapseToolbar: false,

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
                    onClick: this.addItem,
                    color: "green",
                },
                {
                    icon: this.icons.mdiDelete,
                    tooltip: this.$t("component.music.clearPlaylist"),
                    onClick: this.clearAllItems,
                    color: "red",
                    collapse: true,
                },
                {
                    icon: this.icons.mdiGridLarge,
                    tooltip: this.$t("views.multiview.presets"),
                    onClick: () => {
                        this.showPresetSelector = true;
                    },
                    color: "primary",
                    collapse: true,
                },
                {
                    icon: mdiContentSave,
                    onClick: () => {
                        this.showPresetEditor = true;
                    },
                    tooltip: this.$t("views.multiview.presetEditor.title"),
                    color: "secondary",
                    collapse: true,
                },
                {
                    icon: mdiTuneVertical,
                    tooltip: this.$t("views.multiview.mediaControls"),
                    color: "orange",
                    onClick: () => {
                        // this.setMuteAll(true);
                        this.showMediaControls = !this.showMediaControls;
                    },
                },
                {
                    icon: this.icons.mdiFullscreen,
                    onClick: this.toggleFullScreen,
                    tooltip: this.$t("views.multiview.fullScreen"),
                    collapse: true,
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
            return (this.$vuetify.breakpoint.height - (this.collapseToolbar ? 0 : 64)) / 24.0;
        },
        columnWidth() {
            return this.$vuetify.breakpoint.width / 24.0;
        },
    },
    async mounted() {
        // Check if permalink layout is empty
        if (this.$route.params.layout) {
            // TODO: verify layout
            try {
                const parsed = decodeLayout(this.$route.params.layout);
                if (parsed.layout && parsed.content) {
                    // Load missing video data from backend
                    const { data } = await api.videos({
                        include: "live_info",
                        id: Object.values(parsed.content)
                            .filter((x: Content) => x.type === "video" && (x.video as any).type !== "twitch")
                            .map((x: Content) => x.id)
                            .join(","),
                    });
                    if (data.length) {
                        data.forEach((video) => {
                            const matchingKey = Object.keys(parsed.content).find((key) => {
                                return parsed.content[key].id === video.id;
                            });
                            if (matchingKey) {
                                parsed.content[matchingKey].video = video;
                            } else {
                                parsed.content[matchingKey].custom = true;
                            }
                        });
                    }
                    // prompt overwrite with permalink, remove permalink if cancelled
                    try {
                        this.$gtag.event("init-from-link", {
                            event_category: "multiview",
                            event_label: `cells:${parsed?.layout?.length}`,
                        });
                        // eslint-disable-next-line no-empty
                    } catch {}

                    this.promptLayoutChange(parsed, null, () => this.$router.replace({ path: "/multiview" }));
                }
            } catch (e) {
                console.error(e);
                console.log("invalid layout");
            }
        }
    },
    created() {
        Vue.use(VueYoutube);
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
        handleToolbarClick(video) {
            this.$gtag.event("video-added", {
                event_category: "multiview",
                event_label: video.type || "untyped",
            });
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
        handleVideoClicked(video) {
            if (this.showSelectorForId < -1) {
                this.handleToolbarClick(video);
                this.showSelectorForId = -1;
                return;
            }
            this.addVideoWithId(video, this.showSelectorForId);
            this.showSelectorForId = -1;
        },
        handleToolbarShowSelector() {
            // Show selector and pass video to auto layout handler
            this.showSelectorForId = -2;
        },
        handlePresetClicked(preset) {
            this.showPresetSelector = false;
            this.$gtag.event("preset-clicked", {
                event_category: "multiview",
            });
            this.setMultiview({
                ...preset,
                mergeContent: true,
            });
        },
        handleDelete(id) {
            // Check if preset and downgrade layout, if cell being deleted is video
            if (this.isPreset(this.layout) && this.layoutContent[id] && this.layoutContent[id].type !== "chat") {
                // Clear everything if it's 1 video 1 chat
                if (this.activeVideos.length === 1) {
                    this.clearAllItems();
                    return;
                }

                this.deleteVideoAutoLayout(id);
            }
            // Default: delete item
            else {
                this.$store.commit("multiview/removeLayoutItem", id);
            }
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
        allCellAction(key) {
            if (!this.$refs.cell) return;
            const cells = this.$refs.cell.filter((c) => c.video);
            const fns = {
                play: () => {
                    cells.forEach((c) => c.setPlaying(true));
                },
                pause: () => {
                    cells.forEach((c) => c.setPlaying(false));
                },
                mute: () => {
                    cells.forEach((c) => c.setMuted(true));
                },
                unmute: () => {
                    cells.forEach((c) => c.setMuted(false));
                },
                refresh: () => {
                    cells.forEach((c) => c.refresh());
                },
            };
            fns[key]();
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
