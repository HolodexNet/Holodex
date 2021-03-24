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
        <!-- Show cell is Live Chat regardless of mode -->
        <div
            style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)"
            v-if="layoutContent[item.i] && layoutContent[item.i].type === 'chat'"
        >
            <v-icon x-large>{{ mdiMessage }}</v-icon> Live Chat
        </div>
        <!-- Edit mode content -->
        <template v-if="editMode">
            <div class="d-flex flex-wrap" style="width: 100%">
                <v-btn @click="$emit('showSelector', item.i)">
                    <v-icon>{{ icons.mdiPencil }}</v-icon>
                </v-btn>
                <v-btn
                    @click="setItemAsChat(item)"
                    v-if="!(layoutContent[item.i] && layoutContent[item.i].type === 'chat')"
                >
                    <v-icon>{{ mdiMessage }}</v-icon>
                </v-btn>
                <v-spacer />
                <v-btn @click="removeItemById(item.i)">
                    <v-icon>{{ mdiDelete }}</v-icon>
                </v-btn>
            </div>
            <div class="mv-handlebars">
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
        <!-- Show buttons if there is no content -->
        <template v-else>
            <v-btn @click="$emit('showSelector', item.i)">
                <v-icon>{{ icons.mdiPencil }}</v-icon>
            </v-btn>
            <v-btn
                @click="setItemAsChat(item)"
                v-if="!(layoutContent[item.i] && layoutContent[item.i].type === 'chat')"
            >
                <v-icon>{{ mdiMessage }}</v-icon>
            </v-btn>
        </template>
    </v-card>
</template>

<script>
import { mdiMessage, mdiResizeBottomRight, mdiDelete } from "@mdi/js";
import { getVideoThumbnails } from "@/utils/functions";
import TabbedLiveChat from "@/components/multiview/TabbedLiveChat";
import { mapState, mapGetters } from "vuex";

export default {
    name: "Cell",
    components: {
        TabbedLiveChat,
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
                    return `url(${getVideoThumbnails(this.layoutContent[item.i].content.id, false).medium})`;
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
    },
};
</script>

<style></style>
