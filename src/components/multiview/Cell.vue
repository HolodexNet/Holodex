<template>
    <v-card
        flat
        class="mv-cell d-flex"
        :class="{
            'edit-mode': pausedMode,
        }"
        v-on:drop="drop"
        v-on:dragover="allowDrop"
        v-on:dragleave="dragLeave"
        v-on:dragenter="dragEnter"
    >
        <!-- When Cell has no content: show video picker -->
        <v-sheet style="height: 100%" class="d-flex flex-column pt-4" v-if="!cellContent">
            <!--================= No Content Mode ================-->
            <v-sheet
                class="mx-6 thin-scroll-bar d-flex flex-grow-1 flex-shrink-1 align-center justify-center"
                v-if="!cellContent"
                style="overflow-y: auto; overflow-x: hidden; position: relative"
            >
                <!-- <v-sheet class="px-0 d-flex flex-grow-1 align-center justify-center mb-1"> -->
                <v-btn class="mr-2" color="indigo darken-1" @click="$emit('showSelector', item.i)" rounded-sm large>
                    <v-icon>{{ mdiCardPlus }}</v-icon>
                </v-btn>
                <v-btn
                    color="teal darken-1"
                    @click="setItemAsChat(item)"
                    v-if="!(cellContent && cellContent.type === 'chat')"
                    rounded-sm
                    large
                >
                    <v-icon>{{ mdiMessage }}</v-icon>
                </v-btn>
            </v-sheet>
            <template>
                <CellControl :playIcon="icons.mdiPlay" @delete="deleteCell" class="mx-6 mb-6 mt-0 flex-grow-0" />
            </template>
        </v-sheet>

        <v-overlay absolute :value="showDropOverlay">
            <div>
                <v-icon x-large>{{ mdiSelectionEllipseArrowInside }}</v-icon>
            </div>
        </v-overlay>
        <!--=== Video/Chat iFrame based on type ===-->
        <template v-if="cellContent">
            <v-sheet
                rounded="md"
                color="transparent"
                class="cell-content"
                :class="{ 'pa-6 pb-1': pausedMode, 'chat-cell': isChat }"
                :key="`uid-${uniqueId}`"
            >
                <div
                    class="mv-frame ma-auto"
                    :class="{ 'elevation-4': pausedMode }"
                    v-if="cellContent.type === 'video' && cellContent.id"
                >
                    <!-- Twitch Player -->
                    <VueTwitchPlayer
                        v-if="isTwitchVideo"
                        :channel="cellContent.id"
                        :playsInline="true"
                        @ready="vidReady"
                        @ended="pausedMode = true"
                        @play="vidPlaying({ data: 1 })"
                        @pause="vidPlaying({ data: 2 })"
                        @error="pausedMode = true"
                        :mute="muted"
                    >
                    </VueTwitchPlayer>
                    <!-- Youtube Player -->
                    <youtube
                        v-else
                        :video-id="cellContent.id"
                        :playerVars="{
                            playsinline: 1,
                        }"
                        @ready="vidReady"
                        @ended="pausedMode = true"
                        @playing="vidPlaying({ data: 1 })"
                        @paused="vidPlaying({ data: 2 })"
                        @cued="pausedMode = true"
                        @error="pausedMode = true"
                        :mute="muted"
                    >
                    </youtube>
                </div>
                <template v-else-if="cellContent.type === 'chat'">
                    <TabbedLiveChat
                        :activeVideos="activeVideos"
                        :setShowTL="toggleTL"
                        :setShowChat="toggleChat"
                        :id="item.i"
                        :scale="chatScale"
                    />
                </template>
            </v-sheet>

            <template v-if="isVideo && pausedMode">
                <!-- VIDEO + PAUSED --->
                <CellControl
                    :playIcon="icons.mdiPlay"
                    @playpause="setPlaying(true)"
                    @reset="uniqueId = Date.now()"
                    @back="resetCell"
                    @delete="deleteCell"
                    class="ma-6 mt-0"
                />
            </template>
            <template v-if="isChat && pausedMode">
                <!-- CHAT + PAUSED --->
                <CellControl
                    :playIcon="icons.mdiCheck"
                    @back="resetCell"
                    @playpause="pausedMode = !pausedMode"
                    @delete="deleteCell"
                    class="ma-6 mt-0"
                />
            </template>
            <template v-if="isChat && !pausedMode">
                <!-- CHAT + UNPAUSED --->
                <v-sheet class="cell-control">
                    <v-btn :x-small="toggleChat || toggleTL" width="50%" @click="pausedMode = !pausedMode"
                        ><v-icon small class="mr-1">{{ icons.mdiMenu }}</v-icon
                        >{{ $t("component.videoCard.edit") }}</v-btn
                    >
                    <v-btn
                        :x-small="toggleChat || toggleTL"
                        width="25%"
                        @click="toggleChatHandle"
                        :color="toggleChat ? 'primary' : ''"
                    >
                        <v-icon small class="mr-1">
                            M20,2H4C2.9,2,2,2.9,2,4v18l4-4h14c1.1,0,2-0.9,2-2V4C22,2.9,21.1,2,20,2z
                            M9.9,10.8v3.8h-2v-3.8L5.1,6.6h2.4l1.4,2.2 l1.4-2.2h2.4L9.9,10.8z
                            M18.9,8.6h-2v6h-2v-6h-2v-2h6V8.6z
                        </v-icon>
                        <template v-if="cellWidth > 200">Chat</template>
                    </v-btn>
                    <v-btn
                        :x-small="toggleChat || toggleTL"
                        width="25%"
                        @click="toggleTLHandle"
                        :color="toggleTL ? 'primary' : ''"
                    >
                        <v-icon small class="mr-1">
                            M20,2H4C2.9,2,2,2.9,2,4v18l4-4h14c1.1,0,2-0.9,2-2V4C22,2.9,21.1,2,20,2z M4,10h4v2H4V10z
                            M14,16H4v-2h10V16z M20,16h-4v-2 h4V16z M20,12H10v-2h10V12z
                        </v-icon>
                        <template v-if="cellWidth > 200">TL</template>
                    </v-btn>
                </v-sheet>
                <div style="height: 20%" v-if="!toggleChat && !toggleTL"></div>
            </template>
        </template>
    </v-card>
</template>

<script lang="ts">
import { mdiCardPlus, mdiMessage, mdiArrowLeftCircle, mdiSelectionEllipseArrowInside } from "@mdi/js";
import TabbedLiveChat from "@/components/multiview/TabbedLiveChat.vue";
import { mapState, mapGetters } from "vuex";
import { getVideoIDFromUrl } from "@/utils/functions";
import CellControl from "./CellControl.vue";

export default {
    name: "Cell",
    components: {
        TabbedLiveChat,
        // VideoCardList,
        CellControl,
        VueTwitchPlayer: () => import("./TwitchPlayer.vue"),
    },
    props: {
        item: {
            type: Object,
            required: true,
        },
        cellWidth: {
            type: Number,
        },
    },
    data() {
        return {
            mdiMessage,
            mdiArrowLeftCircle,
            pausedMode: true,
            uniqueId: Date.now(),
            ytPlayer: null,
            twPlayer: null,
            toggleTL: false,
            toggleChat: true,
            chatScale: 1,
            showDropOverlay: false,
            enterTarget: null,
            mdiSelectionEllipseArrowInside,
            mdiCardPlus,
        };
    },
    mounted() {
        // initialize chat cell in non paused mode
        if (this.cellContent?.type === "chat") this.pausedMode = false;
        this.setLayoutFreeze();
        this.checkScale();
    },
    watch: {
        cellWidth() {
            this.checkScale();
        },
        cellContent(nw, old) {
            // if cell becomes null or content changes to a different type, set paused mode back to true
            if (!nw || (old && nw && nw.type !== old.type)) this.pausedMode = true;
            if (nw && nw.type === "chat") this.pausedMode = false;
            this.setLayoutFreeze();

            if (
                nw &&
                nw.type === "video" &&
                this.iOS() &&
                this.$store.state.multiview.layout.find((item) => {
                    return (
                        item.i !== this.item.i &&
                        this.layoutContent[item.i] &&
                        this.layoutContent[item.i].type === "video" // &&
                    );
                })
            ) {
                this.muted = true;
            }
        },
        pausedMode(newMode) {
            this.setLayoutFreeze(newMode);
        },
    },
    computed: {
        ...mapGetters("multiview", ["activeVideos"]),
        ...mapState("multiview", ["layoutContent"]),
        cellContent() {
            return this.layoutContent[this.item.i];
        },
        isChat() {
            return this.cellContent.type === "chat";
        },
        isVideo() {
            return this.cellContent.type === "video";
        },
        isTwitchVideo() {
            return this.cellContent && this.cellContent.type === "video" && this.cellContent.video.type === "twitch";
        },
        muted: {
            get() {
                if (!this.cellContent) return false;
                return this.cellContent.muted;
            },
            set(value) {
                this.$store.commit("multiview/setLayoutContentWithKey", { id: this.item.i, key: "muted", value });
            },
        },
        video: {
            get() {
                if (!this.cellContent) return null;
                return this.cellContent.video;
            },
            set(value) {
                this.$store.commit("multiview/setLayoutContentWithKey", { id: this.item.i, key: "video", value });
            },
        },
    },
    methods: {
        refresh() {
            this.uniqueId = Date.now();
        },
        setPlaying(val) {
            if (this.pausedMode !== val) return;
            if (this.ytPlayer) {
                console.log(this.ytPlayer);
                !this.pausedMode ? this.ytPlayer.pauseVideo() : this.ytPlayer.playVideo();
            }
            if (this.twPlayer) {
                !this.pausedMode ? this.twPlayer.pause() : this.twPlayer.play();
            }
        },
        setMuted(val) {
            this.muted = val;
        },
        // getVideoThumbnails,
        setItemAsChat(item) {
            this.$store.commit("multiview/setLayoutContentById", {
                id: item.i,
                content: {
                    type: "chat",
                },
            });
        },
        deleteCell() {
            this.$emit("delete", this.item.i);
        },
        vidPlaying(evt) {
            this.pausedMode = evt.data === 2;
            if (evt.data === 2 && this.iOS() && this.ytPlayer) {
                this.ytPlayer.mute();
                this.muted = true;
            }
        },
        vidReady(evt) {
            if (evt && this.isTwitchVideo) {
                this.twPlayer = evt;
            } else if (evt) {
                this.ytPlayer = evt;
                if (this.muted) {
                    this.ytPlayer.mute();
                } else {
                    this.ytPlayer.unMute();
                }
            }
        },
        resetCell() {
            this.$store.commit("multiview/deleteLayoutContent", this.item.i);
        },
        checkScale() {
            if (this.cellContent?.type === "chat") {
                switch (true) {
                    case this.cellWidth < 150:
                        this.chatScale = 0.5;
                        break;
                    case this.cellWidth < 200:
                        this.chatScale = 0.6;
                        break;
                    case this.cellWidth < 250:
                        this.chatScale = 0.75;
                        break;
                    case this.cellWidth < 300:
                        this.chatScale = 0.85;
                        break;
                    case this.cellWidth < 350:
                        this.chatScale = 1;
                        break;
                    default:
                        this.chatScale = 1;
                }
            }
        },
        toggleChatHandle() {
            this.toggleChat = !this.toggleChat;
            if (!this.toggleChat && !this.toggleTL) this.toggleTL = true;
        },
        toggleTLHandle() {
            this.toggleTL = !this.toggleTL;
            if (!this.toggleChat && !this.toggleTL) this.toggleChat = true;
        },
        iOS() {
            return (
                ["iPad Simulator", "iPhone Simulator", "iPod Simulator", "iPad", "iPhone", "iPod"].includes(
                    navigator.platform,
                ) ||
                // iPad on iOS 13 detection
                (navigator.userAgent.includes("Mac") && "ontouchend" in document)
            );
        },
        setLayoutFreeze(newMode = this.pausedMode) {
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
    background-size: contain;
    background-position: center;
    height: 100%;
    border: 1px solid #f0629118 !important;
    justify-content: flex-start;
    align-content: stretch;
    flex-direction: column;

    .cell-content {
        display: flex;
        flex-wrap: wrap;
        flex-grow: 1;
        flex-basis: 100%;
        flex-shrink: 1;
        max-height: 100%;
        height: 100%;
    }
}

.mv-cell.edit-mode {
    border: 1px solid var(--v-secondary-base) !important;
}

.vue-grid-item.vue-draggable-dragging .mv-cell,
.vue-grid-item.resizing .mv-cell {
    pointer-events: none;
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
</style>
