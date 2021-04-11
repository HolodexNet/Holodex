<template>
    <v-card
        flat
        class="mv-cell d-flex"
        :class="{
            'edit-mode': pausedMode,
        }"
    >
        <!-- When Cell has no content: show video picker -->
        <v-sheet style="height: 100%" class="d-flex flex-column pt-4" v-if="!cellContent">
            <!--================= No Content Mode ================-->
            <v-list
                class="mx-6 thin-scroll-bar flex-grow-1 flex-shrink-1"
                v-if="!cellContent"
                style="overflow-y: auto; overflow-x: hidden; position: relative"
            >
                <v-sheet class="px-0 d-flex flex-grow-1 align-stretch mb-1">
                    <v-btn
                        class="flex-grow-1 mr-2"
                        color="indigo darken-1"
                        style="max-width: 300px; flex-basis: 50%"
                        @click="$emit('showSelector', item.i)"
                    >
                        <v-icon>{{ icons.mdiMagnify }}</v-icon>
                    </v-btn>
                    <v-btn
                        class="flex-grow-1"
                        color="teal darken-1"
                        style="max-width: 300px; flex-basis: 20%"
                        @click="setItemAsChat(item)"
                        v-if="!(cellContent && cellContent.type === 'chat')"
                    >
                        <v-icon>{{ mdiMessage }}</v-icon>
                    </v-btn>
                </v-sheet>
                <!-- <div class="pa-0 ma-0">
                    <span class="text-overline">{{ $t("component.mainNav.favorites") }}</span>
                </div>
                <VideoCardList
                    v-if="$store.state.userdata.user && $store.state.favorites.favorites.length > 0"
                    :videos="liveSoon"
                    :horizontal="true"
                    dense
                    @videoClicked="handleVideoClicked"
                    :hideThumbnail="needHideVImg"
                    includeAvatar
                    disableDefaultClick
                    includeChannel
                ></VideoCardList>
                <div v-else class="mt-2">
                    {{ $t("views.channels.favoritesAreEmpty") }} <br />
                    <v-btn small text to="/login" v-if="!$store.state.userdata.user"
                        ><v-icon left>{{ icons.mdiLoginVariant }}</v-icon> {{ $t("component.mainNav.login") }}</v-btn
                    >
                </div> -->
            </v-list>
            <template>
                <CellControl :playIcon="icons.mdiPlay" @delete="deleteCell" class="mx-6 mb-6 mt-0 flex-grow-0" />
            </template>
        </v-sheet>

        <!-- Dragging handles -->
        <!-- v-show is required. do not change to v-if, because it breaks the youtube frame. -->
        <div class="mv-handlebars" v-show="pausedMode">
            <v-icon style="bottom: 5px; right: 5px">
                {{ mdiResizeBottomRight }}
            </v-icon>
            <v-icon style="bottom: 5px; left: 5px; transform: rotate(90deg)">
                {{ mdiResizeBottomRight }}
            </v-icon>
            <v-icon style="top: 5px; left: 5px; transform: rotate(180deg)">
                {{ mdiResizeBottomRight }}
            </v-icon>
            <v-icon style="top: 5px; right: 5px; transform: rotate(270deg)">
                {{ mdiResizeBottomRight }}
            </v-icon>
            <v-icon style="top: calc(50% - 10px); left: 5px; transform: rotate(135deg)">
                {{ mdiResizeBottomRight }}
            </v-icon>
            <v-icon style="top: calc(50% - 10px); right: 5px; transform: rotate(315deg)">
                {{ mdiResizeBottomRight }}
            </v-icon>
            <v-icon style="bottom: 10px; left: calc(50% - 10px); transform: rotate(45deg)">
                {{ mdiResizeBottomRight }}
            </v-icon>
        </div>

        <!--=== Video/Chat iFrame based on type ===-->
        <template v-if="cellContent">
            <v-sheet
                rounded="md"
                color="transparent"
                class="cell-content"
                :class="{ 'pa-6 pb-1': pausedMode, 'chat-cell': isChat }"
            >
                <div
                    class="mv-frame ma-auto"
                    :class="{ 'elevation-4': pausedMode }"
                    v-if="cellContent.type === 'video' && cellContent.content.id"
                    :key="'v' + uniqueId"
                >
                    <youtube
                        :key="'ytplayer-' + item.i + cellContent.content.id"
                        :video-id="cellContent.content.id"
                        :playerVars="{
                            playsinline: 1,
                        }"
                        @ready="vidReady"
                        @ended="pausedMode = true"
                        @playing="vidPlaying"
                        @paused="vidPlaying"
                        @cued="pausedMode = true"
                        @error="pausedMode = true"
                    >
                        <!--                         @buffering="pausedMode=true" -->
                    </youtube>
                </div>
                <template v-else-if="cellContent.type === 'chat'">
                    <TabbedLiveChat :activeVideos="activeVideos" :setShowTL="toggleTL" :setShowChat="toggleChat" />
                </template>
            </v-sheet>

            <template v-if="isVideo && pausedMode">
                <!-- VIDEO + PAUSED --->
                <CellControl
                    :playIcon="icons.mdiPlay"
                    @playpause="ytPlayer.playVideo()"
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
                        ><v-icon small>{{ icons.mdiMenu }}</v-icon
                        >{{ $t("component.videoCard.edit") }}</v-btn
                    >
                    <v-btn
                        :x-small="toggleChat || toggleTL"
                        width="25%"
                        @click="toggleChatHandle"
                        :color="toggleChat ? 'primary' : ''"
                    >
                        <v-icon small>{{ icons.mdiTranslate }}</v-icon
                        >Chat
                    </v-btn>
                    <v-btn
                        :x-small="toggleChat || toggleTL"
                        width="25%"
                        @click="toggleTLHandle"
                        :color="toggleTL ? 'primary' : ''"
                    >
                        <v-icon small>{{ icons.mdiTranslate }}</v-icon
                        >TL
                    </v-btn>
                </v-sheet>
                <div style="height: 20%" v-if="!toggleChat && !toggleTL"></div>
            </template>
        </template>
    </v-card>
</template>

<script lang="ts">
import { mdiMessage, mdiResizeBottomRight, mdiArrowLeftCircle } from "@mdi/js";
// import { getVideoThumbnails } from "@/utils/functions";
import TabbedLiveChat from "@/components/multiview/TabbedLiveChat.vue";
import { mapState, mapGetters } from "vuex";
// import VideoCardList from "@/components/video/VideoCardList.vue";
// import { dayjs } from "@/utils/time";
import CellControl from "./CellControl.vue";

// const HIDE_VIDEO_UNDER = {
//     xs: 26,
//     sm: 20,
//     md: 15,
//     lg: 8,
//     xl: 6,
// };

export default {
    name: "Cell",
    components: {
        TabbedLiveChat,
        // VideoCardList,
        CellControl,
    },
    props: {
        item: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            mdiMessage,
            mdiResizeBottomRight,
            mdiArrowLeftCircle,
            pausedMode: true,
            uniqueId: Date.now(),
            ytPlayer: null,
            toggleTL: false,
            toggleChat: true,
        };
    },
    watch: {
        cellContent(nw) {
            if (nw === null) this.pausedMode = true;
        },
        pausedMode(ow, nw) {
            if (nw) this.$store.commit("multiview/freezeLayoutItem", this.item.i);
            else this.$store.commit("multiview/unfreezeLayoutItem", this.item.i);
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
    },
    methods: {
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
            this.$store.commit("multiview/removeLayoutItem", this.item.i);
        },
        vidPlaying(evt) {
            this.pausedMode = evt.data === 2;
        },
        vidReady(evt) {
            this.ytPlayer = evt.target;
        },
        resetCell() {
            this.$store.commit("multiview/deleteLayoutContent", this.item.i);
        },
        toggleChatHandle() {
            this.toggleChat = !this.toggleChat;
            if (!this.toggleChat && !this.toggleTL) this.toggleTL = true;
        },
        toggleTLHandle() {
            this.toggleTL = !this.toggleTL;
            if (!this.toggleChat && !this.toggleTL) this.toggleChat = true;
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
    }
}

.cell-content.chat-cell .show-tl-overlay {
    // height: calc(100% - 24px);
}

.mv-cell.edit-mode {
    border: 1px solid #f06291 !important;
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
.mv-handlebars > .v-icon {
    position: absolute;
    color: #f06291;
}
</style>
