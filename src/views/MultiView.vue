<template>
    <div style="width: 100%">
        <transition name="slide-y-transition" mode="out-in">
            <v-toolbar dense class="mv-toolbar" style="right: 0" v-if="!collapseToolbar" absolute>
                <v-app-bar-nav-icon @click="$router.push({ path: '/' })"></v-app-bar-nav-icon>
                <div class="flex-grow-1 justify-center d-flex mv-toolbar-btn">
                    <v-btn @click="addItem" v-if="editMode" color="orange">
                        <v-icon left>{{ mdiViewGridPlus }}</v-icon>
                        Add Cell
                    </v-btn>
                    <v-btn @click="clearAllItems" v-if="editMode" color="red">
                        <v-icon left>{{ icons.mdiClose }}</v-icon>
                        Clear All
                    </v-btn>
                    <v-btn @click="editMode = !editMode" :color="editMode ? 'green' : 'blue'">
                        <v-icon left>{{ editMode ? icons.mdiCheck : icons.mdiPencil }}</v-icon>
                        {{ editMode ? "Done" : "Edit Layout" }}
                    </v-btn>
                    <v-btn>
                        <v-icon left>{{ icons.mdiGridLarge }}</v-icon>
                        Presets
                    </v-btn>

                    <v-menu
                        :open-on-click="true"
                        bottom
                        nudge-bottom="40px"
                        :close-on-content-click="false"
                        :open-on-hover="false"
                        v-model="shareDialog"
                        width="400"
                    >
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn v-bind="attrs" v-on="on">
                                <v-icon left>{{ mdiLinkVariant }}</v-icon>
                                Share
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
            :col-num="24"
            :row-height="Math.floor($vuetify.breakpoint.height / 24)"
            :col-width="30"
            :is-draggable="editMode"
            :is-resizable="editMode"
            :responsive="false"
            :vertical-compact="false"
            :prevent-collision="true"
            :margin="[5, 0]"
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
                    flat
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
        <v-dialog v-model="overwriteDialog" width="400">
            <v-card>
                <v-card-title>
                    <!-- Share -->
                </v-card-title>
                <v-card-text> Overwrite Current Layout </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="primary"
                        text
                        @click="
                            () => {
                                overwriteDialog = false;
                                overwriteConfirm();
                            }
                        "
                    >
                        Confirm
                    </v-btn>
                    <v-btn
                        color="primary"
                        text
                        @click="
                            () => {
                                overwriteDialog = false;
                                overwriteCancel();
                            }
                        "
                    >
                        Cancel
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import VueYouTubeEmbed from "vue-youtube-embed";
import Vue from "vue";
import { GridLayout, GridItem } from "@/external/vue-grid-layout/src/components/index";
import VideoSelector from "@/components/multiview/VideoSelector";
import { getVideoThumbnails } from "@/utils/functions";
import WatchFrame from "@/components/watch/WatchFrame";
import WatchLiveChat from "@/components/watch/WatchLiveChat";
import TabbedLiveChat from "@/components/multiview/TabbedLiveChat";
// import { mapState } from "vuex";
import { mdiMessage, mdiResizeBottomRight, mdiViewGridPlus, mdiLinkVariant, mdiClipboardPlusOutline } from "@mdi/js";
import copyToClipboard from "@/mixins/copyToClipboard";

export default {
    name: "MultiView",
    components: {
        GridLayout,
        GridItem,
        VideoSelector,
        WatchFrame,
        WatchLiveChat,
        TabbedLiveChat,
    },
    mixins: [copyToClipboard],
    data() {
        return {
            editMode: false,
            index: 0,
            showSelectorForId: -1,
            mdiMessage,
            mdiResizeBottomRight,
            mdiViewGridPlus,
            mdiClipboardPlusOutline,
            collapseToolbar: false,
            mdiLinkVariant,
            shareDialog: false,

            overwriteDialog: false,
            overwriteCancel: null,
            overwriteConfirm: null,
        };
    },
    mounted() {
        if (this.$route.query.layout) {
            // TODO: verify layout
            try {
                const parsed = this.decodeLayout(this.$route.query.layout);
                console.log(parsed);
                if (parsed.layout && parsed.content) {
                    if (!this.layout || Object.keys(this.layout).length === 0) {
                        this.setMultiview(parsed);
                        return;
                    }
                    this.overwriteConfirm = () => {
                        this.setMultiview(parsed);
                    };
                    this.overwriteCancel = () => {
                        this.$router.replace({ path: this.$route.path });
                    };
                    this.overwriteDialog = true;
                }
            } catch (e) {
                console.log("invalid layout");
            }
        }

        // console.log(this.decodeLayout(this.encodeLayout(this.layout)));
    },
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
        exportURL() {
            const query = `?layout=${encodeURIComponent(this.encodeCurrentLayout())}`;
            return `${window.origin}/multiview${query}`;
        },
    },
    methods: {
        getVideoThumbnails,
        startCopyToClipboard(txt) {
            this.copyToClipboard(txt);
            const thisCopy = this;
            setTimeout(() => {
                thisCopy.shareDialog = false;
            }, 200);
        },
        getMinVideoObj(video) {
            const {
                id,
                channel: { name },
            } = video;
            return {
                id,
                channel: {
                    name,
                },
            };
        },
        handleVideoClicked(video) {
            console.log(video);
            console.log(this.showSelectorForId);
            this.$store.commit("multiview/setLayoutContentById", {
                id: this.showSelectorForId,
                content: {
                    type: "video",
                    content: this.getMinVideoObj(video),
                },
            });
            this.showSelectorForId = -1;
        },
        setItemAsChat(item) {
            this.$store.commit("multiview/setLayoutContentById", {
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
            if (this.layoutContent[i]) this.$store.commit("multiview/deleteLayoutcontent", i);
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
        setMultiview({ layout, content }) {
            this.$store.commit("multiview/setLayout", layout);
            this.$store.commit("multiview/setLayoutContent", content);
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
        encodeCurrentLayout() {
            const b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
            const l = [];
            try {
                this.layout.forEach((item) => {
                    let encodedBlock = "";
                    let invalid = false;
                    ["x", "y", "w", "h"].forEach((key) => {
                        if (item[key] >= 64) {
                            invalid = true;
                        } else {
                            encodedBlock += b64[item[key]];
                        }
                    });

                    if (!invalid) {
                        if (this.layoutContent[item.i]) {
                            const { type, content } = this.layoutContent[item.i];
                            if (type === "chat") {
                                encodedBlock += "chat";
                            } else if (type === "video") {
                                encodedBlock += content.id + content.channel.name.split(" ")[0].replace(",", "");
                            }
                        }
                        l.push(encodedBlock);
                    }
                });
                return l.join(",");
            } catch (e) {
                return "error";
            }
        },
        decodeLayout(l) {
            const parsedLayout = [];
            const parsedContent = {};
            l.split(",").forEach((str, index) => {
                console.log(index);
                const xywh = str.substring(0, 4);
                const idOrChat = str.substring(4, 15);
                const channelName = str.substring(15);

                // console.log(xywh, idOrChat, channelName);
                const b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
                const keys = ["x", "y", "w", "h"];
                const layoutItem = {};
                xywh.split("").forEach((char, keyIndex) => {
                    const num = b64.indexOf(char);
                    layoutItem[keys[keyIndex]] = num;
                });
                layoutItem.i = index;

                parsedLayout.push(layoutItem);

                if (idOrChat === "chat") {
                    parsedContent[index] = {
                        type: "chat",
                    };
                }

                if (idOrChat.length === 11) {
                    parsedContent[index] = {
                        type: "video",
                        content: {
                            id: idOrChat,
                            channel: {
                                name: channelName,
                            },
                        },
                    };
                }
            });
            return {
                layout: parsedLayout,
                content: parsedContent,
            };
        },
    },
};
</script>

<style lang="scss">
.mv-video {
    background-size: contain;
    background-position: center;
    height: 100%;
    border: 1px solid #f0629118 !important;
}

.mv-video.edit-mode {
    border: 1px solid #f06291 !important;
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
.vue-grid-item {
    /* transition: all 200ms ease; */
    transition: none;
}

.vue-grid-layout {
    /* transition: height 200ms ease; */
    transition: none;
}
</style>
