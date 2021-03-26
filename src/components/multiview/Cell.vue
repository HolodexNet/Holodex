<template>
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
        <div
            style="position: absolute; top: 20%; left: 50%; transform: translate(-50%, -50%)"
            v-if="layoutContent[item.i] && layoutContent[item.i].type === 'chat'"
        >
            <v-icon x-large>{{ mdiMessage }}</v-icon> Live Chat
        </div>

        <!-- Show cell is Live Chat regardless of mode -->
        <!-- Edit mode content -->
        <template v-if="editMode || !layoutContent[item.i]">
            <v-btn
                color="primary darken-3"
                fab
                large
                @click="$store.commit('multiview/deleteLayoutContent', item.i)"
                style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)"
                v-if="layoutContent[item.i]"
            >
                <v-icon x-large>{{ icons.mdiClose }}</v-icon>
            </v-btn>

            <v-btn fab color="error" class="mv-rm-card" @click="removeItemById(item.i)">
                <v-icon>{{ mdiDelete }}</v-icon>
            </v-btn>

            <v-list
                class="ma-3 thin-scroll-bar"
                :max-height="(item.h / 24) * 100 * 0.9 + 'vh'"
                width="100%"
                v-if="!layoutContent[item.i]"
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
                        v-if="!(layoutContent[item.i] && layoutContent[item.i].type === 'chat')"
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

            <div class="mv-handlebars" v-if="editMode">
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
        </template>
        <!-- Video/Chat iFrame based on type -->
        <template v-else-if="layoutContent[item.i]">
            <div
                class="mv-frame ma-auto"
                v-if="layoutContent[item.i].type === 'video' && layoutContent[item.i].content.id"
            >
                <youtube
                    :key="'ytplayer-' + item.i + layoutContent[item.i].content.id"
                    :video-id="layoutContent[item.i].content.id"
                    :playerVars="{
                        playsinline: 1,
                    }"
                >
                </youtube>
            </div>
            <template v-else-if="layoutContent[item.i].type === 'chat'">
                <TabbedLiveChat :activeVideos="activeVideos" />
            </template>
        </template>
    </v-card>
</template>

<script>
import { mdiMessage, mdiResizeBottomRight, mdiDelete } from "@mdi/js";
import { getVideoThumbnails } from "@/utils/functions";
import TabbedLiveChat from "@/components/multiview/TabbedLiveChat";
import { mapState, mapGetters } from "vuex";
import VideoCardList from "@/components/video/VideoCardList";
import { dayjs } from "@/utils/time";

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
    },
    props: {
        item: {
            type: Object,
            required: true,
        },
        editMode: {
            type: Boolean,
            required: true,
        },
    },
    data() {
        return {
            mdiMessage,
            mdiResizeBottomRight,
            mdiDelete,
        };
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
        getBackgroundForItem(item) {
            if (this.layoutContent[item.i]) {
                if (this.layoutContent[item.i].type === "video" && this.editMode) {
                    return `url(${getVideoThumbnails(this.layoutContent[item.i].content.id, false).hq720})`;
                }
                if (this.layoutContent[item.i].type === "chat") {
                    return mdiMessage;
                }
            }
            return "";
        },
        removeItemById(i) {
            this.$store.commit("multiview/removeLayoutItem", i);
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
