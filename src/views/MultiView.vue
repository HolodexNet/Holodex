<template>
    <div style="width: 100%">
        <transition name="slide-y-transition" mode="out-in">
            <v-toolbar dense class="mv-toolbar" v-if="!collapseToolbar">
                <v-app-bar-nav-icon @click="$router.push({ path: '/' })"></v-app-bar-nav-icon>
                <v-toolbar-title>MultiDex</v-toolbar-title>
                <div class="flex-grow-1 justify-center d-flex mv-toolbar-btn">
                    <v-btn @click="editMode = !editMode" :color="editMode ? 'green' : 'blue'">
                        <v-icon left>{{ editMode ? icons.mdiCheck : icons.mdiPencil }}</v-icon>
                        {{ editMode ? "Done" : "Edit Layout" }}
                    </v-btn>
                    <v-btn @click="addItem" v-if="editMode" color="orange">
                        <v-icon left>{{ mdiViewGridPlus }}</v-icon>
                        Add Cell
                    </v-btn>
                    <v-btn @click="clearAllItems" v-if="editMode" color="red">
                        <v-icon left>{{ icons.mdiClose }}</v-icon>
                        Clear All
                    </v-btn>
                    <v-btn>
                        <v-icon left>{{ icons.mdiGridLarge }}</v-icon>
                        Presets
                    </v-btn>
                </div>
                <v-btn icon @click="collapseToolbar = true">
                    <v-icon>{{ icons.mdiChevronUp }}</v-icon>
                </v-btn>
            </v-toolbar>
            <v-btn v-else @click="collapseToolbar = false" class="open-toolbar-btn" tile small>
                <v-icon>{{ icons.mdiChevronDown }}</v-icon>
            </v-btn>
        </transition>
        <grid-layout
            :layout.sync="layout"
            :col-num="12"
            :row-height="30"
            :col-width="30"
            :is-draggable="editMode"
            :is-resizable="editMode"
            :responsive="false"
            :vertical-compact="false"
            :prevent-collision="true"
            :margin="[5, 5]"
            :maxRows="64"
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
                <v-card
                    class="mv-video d-flex"
                    :class="{
                        'edit-mode': editMode,
                    }"
                    :style="{
                        backgroundImage: getBackgroundForItem(item),
                    }"
                >
                    <template v-if="editMode">
                        <div
                            style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)"
                            v-if="layoutContent[item.i] && layoutContent[item.i].type === 'chat'"
                        >
                            <v-icon x-large>{{ mdiMessage }}</v-icon> Live Chat
                        </div>
                        <!-- <span class="text">{{ item.i }}</span> -->
                        <v-btn @click="showSelectorForId = item.i" class="mr-1">
                            <v-icon>{{ icons.mdiPencil }}</v-icon>
                        </v-btn>
                        <v-btn
                            @click="setItemAsChat(item)"
                            v-if="!(layoutContent[item.i] && layoutContent[item.i].type === 'chat')"
                        >
                            + <v-icon>{{ mdiMessage }}</v-icon>
                        </v-btn>
                        <v-spacer />
                        <v-btn @click="removeItemById(item.i)">
                            <v-icon>{{ icons.mdiClose }}</v-icon>
                        </v-btn>
                        <v-icon style="position: absolute; bottom: 5px; right: 5px" color="primary">
                            {{ mdiResizeBottomRight }}
                        </v-icon>
                    </template>
                    <template v-else-if="layoutContent[item.i]">
                        <div
                            class="mv-frame ma-auto"
                            v-if="layoutContent[item.i].type === 'video' && layoutContent[item.i].content.id"
                        >
                            <youtube
                                :key="'ytplayer-' + item.i"
                                :video-id="layoutContent[item.i].content.id"
                                :playerVars="{
                                    playsinline: 1,
                                }"
                            >
                            </youtube>
                            <!-- <WatchLiveChat :video="" /> -->
                        </div>
                        <template v-if="layoutContent[item.i].type === 'chat'">
                            <TabbedLiveChat :activeVideos="activeVideos" />
                        </template>
                    </template>
                </v-card>
            </grid-item>
        </grid-layout>
        <v-dialog v-model="showOverlay">
            <VideoSelector @videoClicked="handleVideoClicked" />
        </v-dialog>
    </div>
</template>

<script>
import VueYouTubeEmbed from "vue-youtube-embed";
import Vue from "vue";
import VueGridLayout from "vue-grid-layout";
import VideoSelector from "@/components/multiview/VideoSelector";
import { getVideoThumbnails } from "@/utils/functions";
import WatchFrame from "@/components/watch/WatchFrame";
import WatchLiveChat from "@/components/watch/WatchLiveChat";
import TabbedLiveChat from "@/components/multiview/TabbedLiveChat";
// import { mapState } from "vuex";
import { mdiMessage, mdiResizeBottomRight, mdiViewGridPlus } from "@mdi/js";

export default {
    name: "MultiView",
    components: {
        GridLayout: VueGridLayout.GridLayout,
        GridItem: VueGridLayout.GridItem,
        VideoSelector,
        WatchFrame,
        WatchLiveChat,
        TabbedLiveChat,
    },
    data() {
        return {
            editMode: false,
            index: 0,
            showSelectorForId: -1,
            mdiMessage,
            mdiResizeBottomRight,
            mdiViewGridPlus,
            collapseToolbar: false,
        };
    },
    mounted() {},
    created() {
        Vue.use(VueYouTubeEmbed);
    },
    computed: {
        layout: {
            get() {
                return this.$store.state.multiview.layout;
            },
        },
        layoutContent: {
            get() {
                return this.$store.state.multiview.layoutContent;
            },
        },
        showOverlay: {
            get() {
                return this.showSelectorForId !== -1;
            },
            set(open) {
                if (!open) this.showSelectorForId = -1;
            },
        },
        activeVideos() {
            const active = [];
            this.layout
                .map((item) => item.i)
                .forEach((key) => {
                    if (this.layoutContent[key] && this.layoutContent[key].type === "video") {
                        active.push(this.layoutContent[key].content);
                    }
                });
            return active;
        },
    },
    methods: {
        getVideoThumbnails,
        handleVideoClicked(video) {
            console.log(video);
            console.log(this.showSelectorForId);
            this.$store.commit("multiview/setLayoutContent", {
                id: this.showSelectorForId,
                content: {
                    type: "video",
                    content: video,
                },
            });
            this.showSelectorForId = -1;
        },
        setItemAsChat(item) {
            this.$store.commit("multiview/setLayoutContent", {
                id: item.i,
                content: {
                    type: "chat",
                },
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
        handleOutside(e) {
            console.log(e);
        },
        getBackgroundForItem(item) {
            if (this.layoutContent[item.i] && this.editMode) {
                if (this.layoutContent[item.i].type === "video") {
                    return `url(${getVideoThumbnails(this.layoutContent[item.i].content.id, false).medium})`;
                }
                if (this.layoutContent[item.i].type === "chat") {
                    return mdiMessage;
                }
            }
            return "";
        },
    },
};
</script>

<style lang="scss">
.mv-video {
    background-size: contain;
    background-position: center;
    height: 100%;
}

.mv-video.edit-mode {
    border: 1px solid pink;
}

.mv-frame > div > iframe {
    position: absolute;
    width: 100%;
    height: 100%;
}

.mv-frame {
    position: relative;
    width: 100%;
    height: 100%;
}

.mv-toolbar-btn .v-btn {
    margin-right: 4px;
}
.open-toolbar-btn {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 10;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
}
</style>
