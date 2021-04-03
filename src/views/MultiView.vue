<template>
    <div style="width: 100%" ref="fullscreen-content">
        <!-- Floating tool bar -->
        <transition name="slide-y-transition" mode="out-in">
            <v-toolbar dense class="mv-toolbar" style="right: 0" v-if="!collapseToolbar" absolute>
                <v-app-bar-nav-icon @click="toggleMainNav"></v-app-bar-nav-icon>
                <div
                    class="flex-grow-1 justify-center d-flex mv-toolbar-btn align-center"
                    :class="{ 'no-btn-text': $store.state.isMobile }"
                >
                    <v-btn @click="editMode = !editMode" :color="editMode ? 'light-green' : 'blue'">
                        <v-icon>{{ editMode ? icons.mdiCheck : icons.mdiPencil }}</v-icon>
                        <span class="collapsible-text">{{ editMode ? "Done" : "Edit" }}</span>
                    </v-btn>
                    <v-btn @click="addItem" v-if="editMode" color="green">
                        <v-icon>{{ mdiViewGridPlus }}</v-icon>
                        <span class="collapsible-text">{{ $t("views.multiview.addframe") }}</span>
                    </v-btn>
                    <v-btn @click="clearAllItems" v-if="editMode" color="red">
                        <v-icon>{{ icons.mdiRefresh }}</v-icon>
                        <span class="collapsible-text">{{ $t("component.music.clearPlaylist") }}</span>
                    </v-btn>
                    <v-btn v-if="!editMode" color="green darken-1" @click="showPresetSelector = true">
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
                            <v-btn v-bind="attrs" v-on="on" v-show="!editMode">
                                <v-icon>{{ mdiLinkVariant }}</v-icon>
                                <span class="collapsible-text">{{ $t("views.multiview.permalink") }}</span>
                            </v-btn>
                        </template>

                        <v-card rounded="lg">
                            <!-- <v-card-title> Share </v-card-title> -->
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
                            <!-- <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="primary" text @click="shareDialog = false"> Close </v-btn>
                            </v-card-actions> -->
                        </v-card>
                    </v-menu>
                    <v-btn @click="toggleFullScreen" icon>
                        <v-icon>{{ icons.mdiFullscreen }}</v-icon>
                    </v-btn>
                </div>
                <v-btn icon @click="collapseToolbar = true">
                    <v-icon>{{ icons.mdiChevronUp }}</v-icon>
                </v-btn>
            </v-toolbar>
            <v-btn v-else @click="collapseToolbar = false" class="open-mv-toolbar-btn" tile small color="secondary">
                <v-icon>{{ icons.mdiChevronDown }}</v-icon>
            </v-btn>
        </transition>
        <!-- Grid Layout -->
        <!-- rowHeight = 100vh/colNum, makes layout consistent across different heights -->
        <grid-layout
            :layout.sync="layout"
            :col-num="24"
            :row-height="($vuetify.breakpoint.height - 26.0) / 24.0"
            :col-width="30"
            :is-draggable="editMode"
            :is-resizable="editMode"
            :responsive="false"
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
                :key="item.i"
            >
                <cell :item="item" :editMode="editMode" @showSelector="(id) => (showSelectorForId = id)"></cell>
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
} from "@mdi/js";
import copyToClipboard from "@/mixins/copyToClipboard";
import { encodeLayout, decodeLayout } from "@/utils/mv-layout";
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

            editMode: false,
            showSelectorForId: -1,
            shareDialog: false,
            collapseToolbar: false,

            overwriteDialog: false,
            overwriteCancel: null,
            overwriteConfirm: null,
            overwriteMerge: false,

            showPresetSelector: false,

            layoutPreview: [],
        };
    },
    watch: {
        editMode(nw) {
            if (nw) {
                this.$store.dispatch("favorites/fetchLive");
            }
        },
    },
    mounted() {
        // Check if layout is empty
        if (this.layout.length === 0 && !this.$route.params.layout) {
            this.showPresetSelector = true;
        }
        this.$store.dispatch("favorites/fetchLive");
        if (this.$route.params.layout) {
            // TODO: verify layout
            try {
                const parsed = decodeLayout(this.$route.params.layout);
                console.log(parsed);
                if (parsed.layout && parsed.content) {
                    // no layout, overwrite without asking
                    if (!this.layout || Object.keys(this.layout).length === 0) {
                        this.setMultiview(parsed);
                        return;
                    }
                    // show dialog with confirm or cancel functions
                    this.layoutPreview = parsed.layout;
                    this.overwriteConfirm = () => {
                        this.overwriteDialog = false;
                        this.setMultiview({
                            ...parsed,
                            mergeContent: this.overwriteMerge,
                        });
                    };
                    this.overwriteCancel = () => {
                        this.overwriteDialog = false;
                        // clear out query on cancel
                        this.$router.replace({ path: "/multiview" });
                    };
                    this.overwriteDialog = true;
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
        // layout() {
        //     return this.$store.state.multiview.layout;
        // },
        // layoutContent() {
        //     return this.$store.state.multiview.layoutContent;
        // },
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
    },
    methods: {
        startCopyToClipboard(txt) {
            this.copyToClipboard(txt);
            const thisCopy = this;
            setTimeout(() => {
                thisCopy.shareDialog = false;
            }, 200);
        },
        handleVideoClicked(video) {
            this.$store.commit("multiview/setLayoutContentById", {
                id: this.showSelectorForId,
                content: {
                    type: "video",
                    content: video,
                },
            });
            this.showSelectorForId = -1;
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
.mv-toolbar-btn .v-btn {
    margin-right: 4px;
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
