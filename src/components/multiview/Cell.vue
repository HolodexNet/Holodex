<template>
    <v-card
        flat
        class="mv-video d-flex"
        :class="{
            'edit-mode': pausedMode,
        }"
    >
        <!-- When Cell has no content: show video picker -->
        <v-row class="mx-2" v-if="!cellContent">
            <!--================= No Content Mode ================-->

            <v-btn
                color="primary darken-3"
                fab
                large
                @click="$store.commit('multiview/deleteLayoutContent', item.i)"
                style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)"
                v-if="cellContent"
            >
                <v-icon x-large>{{ icons.mdiClose }}</v-icon>
            </v-btn>

            <v-btn fab color="error" class="mv-rm-card" @click="deleteCell">
                <v-icon>{{ icons.mdiDelete }}</v-icon>
            </v-btn>

            <v-list
                class="ma-3 thin-scroll-bar"
                :max-height="(item.h / 24) * 100 * 0.9 + 'vh'"
                width="100%"
                v-if="!cellContent"
                style="overflow-y: auto; overflow-x: hidden; position: relative"
            >
                <v-sheet width="100%" class="px-0 d-flex flex-grow-1 align-stretch mb-1">
                    <v-btn
                        large
                        class="flex-grow-1 mr-2 mt-3"
                        color="indigo darken-1"
                        style="max-width: 300px; basis: 2"
                        @click="$emit('showSelector', item.i)"
                    >
                        <v-icon large>{{ icons.mdiMagnify }}</v-icon>
                    </v-btn>
                    <v-btn
                        large
                        class="flex-grow-1 mt-3"
                        color="teal darken-1"
                        style="max-width: 300px; basis: 0.4"
                        @click="setItemAsChat(item)"
                        v-if="!(cellContent && cellContent.type === 'chat')"
                    >
                        <v-icon large>{{ mdiMessage }}</v-icon>
                    </v-btn>
                </v-sheet>
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
                </div>
            </v-list>
        </v-row>

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
            <v-sheet rounded="md" color="transparent" class="cell-content" :class="{ 'pa-6 pb-1': pausedMode }">
                <!-- :key="'vbox'+uniqueId"> -->
                <div
                    class="mv-frame ma-auto"
                    :class="{ 'elevation-4': pausedMode }"
                    v-if="cellContent.type === 'video' && cellContent.content.id"
                    :key="'v' + uniqueId"
                >
                    <!-- :key="'ytplayer-' + item.i + cellContent.content.id" -->
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
                    <TabbedLiveChat :activeVideos="activeVideos" />
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
                    <v-btn x-small width="70%" @click="pausedMode = !pausedMode"
                        ><v-icon small>{{ icons.mdiMenu }}</v-icon
                        >{{ $t("component.videoCard.edit") }}</v-btn
                    >
                    <v-btn x-small width="30%"
                        ><v-icon small>{{ icons.mdiTranslate }}</v-icon
                        >TL</v-btn
                    >
                </v-sheet>
            </template>
        </template>
    </v-card>
</template>

<script lang="ts">
import { mdiMessage, mdiResizeBottomRight, mdiArrowLeftCircle } from "@mdi/js";
import { getVideoThumbnails } from "@/utils/functions";
import TabbedLiveChat from "@/components/multiview/TabbedLiveChat.vue";
import { mapState, mapGetters } from "vuex";
import VideoCardList from "@/components/video/VideoCardList.vue";
import { dayjs } from "@/utils/time";
import CellControl from "./CellControl.vue";

const HIDE_VIDEO_UNDER = {
    xs: 26,
    sm: 20,
    md: 15,
    lg: 8,
    xl: 6,
};

export default {
    name: "Cell",
    components: {
        TabbedLiveChat,
        VideoCardList,
        CellControl,
    },
    props: {
        item: {
            type: Object,
            required: true,
        },
        // pausedMode: {
        //     type: Boolean,
        //     required: true,
        // },
    },
    data() {
        return {
            mdiMessage,
            mdiResizeBottomRight,
            mdiArrowLeftCircle,
            pausedMode: true,
            uniqueId: Date.now(),
            ytPlayer: null,
        };
    },
    watch: {
        cellContent(nw) {
            if (nw === null) this.pausedMode = true;
        },
    },
    computed: {
        ...mapGetters("multiview", ["activeVideos"]),
        ...mapState("multiview", ["layout", "layoutContent"]),
        ...mapState("favorites", ["live"]),
        liveSoon() {
            return this.live.filter((x) => {
                return x.status === "live" || Math.abs(dayjs().diff(x.available_at, "minutes")) < 10;
            });
        },
        needHideVImg() {
            return HIDE_VIDEO_UNDER[this.$vuetify.breakpoint.name] > this.item.w;
        },
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
        getVideoThumbnails,
        setItemAsChat(item) {
            this.$store.commit("multiview/setLayoutContentById", {
                id: item.i,
                content: {
                    type: "chat",
                },
            });
        },
        getBackgroundForItem() {
            if (this.cellContent) {
                if (this.cellContent.type === "video" && this.pausedMode) {
                    return `url(${getVideoThumbnails(this.cellContent.content.id, false).hq720})`;
                }
                if (this.cellContent.type === "chat") {
                    return mdiMessage;
                }
            }
            return "";
        },
        deleteCell() {
            this.$store.commit("multiview/removeLayoutItem", this.item.i);
        },
        handleVideoClicked(video) {
            this.$store.commit("multiview/setLayoutContentById", {
                id: this.item.i,
                content: {
                    type: "video",
                    content: video,
                },
            });
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
    },
};
</script>

<style lang="scss">
.mv-video {
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
    }
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
.mv-handlebars > .v-icon {
    position: absolute;
    color: #f06291;
}

.mv-rm-card {
    position: absolute;
    right: 20px;
    bottom: 20px;
    z-index: 40;
}
</style>
