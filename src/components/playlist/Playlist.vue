<template>
    <v-container fluid class="pa-0">
        <div style="font-size: 1rem !important; font-weight: 500" class="mb-2 ml-0 d-flex">
            <v-text-field
                v-model="playlistName"
                autofocus
                single-line
                hide-details
                style="flex-basis: 80"
                class="flex-shrink flex-grow pt-0 mt-0"
                :append-icon="icons.mdiPencil"
                v-if="editNameMode"
                @keydown.enter="editNameMode = false"
                @click:append="editNameMode = false"
                :rules="[(v) => v.length > 0 || 'Should not be empty']"
            >
            </v-text-field>
            <span class="text-h5 flex-grow flex-shrink" style="flex-basis: 100%" v-else>
                <v-btn icon small class="float-right" v-show="isEditable" @click="editNameMode = true">
                    <v-icon> {{ icons.mdiPencil }} </v-icon>
                </v-btn>
                {{ playlist.name }}
            </span>
            <v-btn
                icon
                small
                class="float-right"
                v-show="!isSaved"
                color="success"
                @click="$store.dispatch('playlist/saveActivePlaylist')"
                ><v-icon>{{ mdiContentSave }}</v-icon></v-btn
            >
            <v-menu bottom offset-y nudge-width="500">
                <template v-slot:activator="{ on }">
                    <v-btn v-on="on" icon small class="float-right">
                        <v-icon>{{ icons.mdiDotsVertical }}</v-icon>
                    </v-btn>
                </template>
                <v-list nav>
                    <v-list-item v-if="isEditable" @click="$emit('new-playlist')"
                        ><v-icon left color="success">{{ icons.mdiPlusBox }}</v-icon> New Playlist
                    </v-list-item>
                    <!-- feed back a green ripple on click... theoretically -->
                    <v-list-item v-if="isEditable" @click="editNameMode = true"
                        ><v-icon left>{{ icons.mdiPencil }}</v-icon> Rename Playlist
                    </v-list-item>
                    <!-- $store.dispatch('playlist/setActivePlaylistByID', playlist.id) -->
                    <v-list-item
                        v-if="isEditable"
                        @click="$store.dispatch('playlist/setActivePlaylistByID', playlist.id)"
                        :disabled="isSaved || !playlist.id"
                        ><v-icon left>{{ icons.mdiRefresh }}</v-icon> Reset Unsaved Changes
                    </v-list-item>
                    <v-list-item :ripple="{ class: 'green--text' }" :disabled="!playlist.id"
                        ><v-icon left>{{ icons.mdiClipboardPlusOutline }}</v-icon>
                        {{ playlist.id ? "Copy sharable Playlist link" : "Save the playlist to enable link-sharing." }}
                    </v-list-item>
                    <v-divider />
                    <!-- Exporting options -->
                    <v-list-item disabled class="mt-1 mb-1" dense>
                        <v-icon left disabled>{{ icons.mdiOpenInNew }}</v-icon
                        ><span>Export Playlist</span>
                    </v-list-item>
                    <v-list-item dense @click.stop="instructionsDialog = true" class="ml-5">
                        <v-icon left>{{ icons.mdiYoutube }}</v-icon>
                        {{ $t("views.library.exportYtPlaylist") }}
                    </v-list-item>
                    <v-list-item dense @click.stop="downloadAsCSV" class="ml-5 mb-2">
                        <v-icon left>{{ mdiFileDelimited }}</v-icon>
                        {{ $t("views.library.exportCsv") }}
                    </v-list-item>
                    <!-- End Exporting options -->
                    <v-divider class="mb-2" />
                    <v-list-item @click="$store.dispatch('playlist/deleteActivePlaylist')" v-if="isEditable">
                        <v-icon left color="error"> {{ icons.mdiDelete }} </v-icon>
                        {{ playlist.id ? "Delete Playlist" : "Clear playlist" }}
                    </v-list-item>
                </v-list>
            </v-menu>
        </div>
        <VideoCardList
            :videos="playlist.videos || []"
            includeChannel
            :horizontal="horizontal"
            class="playlist-video-list"
            :cols="{
                xs: 1,
                sm: 3,
                md: 4,
                lg: 5,
                xl: 6,
            }"
        >
            <template v-slot:action="{ video }" v-if="isEditable">
                <div class="d-flex flex-shrink flex-column">
                    <!-- <button>
                        <v-icon small> {{ mdiChevronDoubleUp }} </v-icon>
                    </button> -->
                    <button @click.stop.prevent="move(video.id, 'up')">
                        <v-icon small> {{ icons.mdiChevronUp }} </v-icon>
                    </button>
                    <button @click.stop.prevent="$store.dispatch('playlist/removeVideoByID', video.id)">
                        <v-icon small> {{ icons.mdiDelete }} </v-icon>
                    </button>
                    <button @click.stop.prevent="move(video.id, 'down')">
                        <v-icon small> {{ icons.mdiChevronDown }} </v-icon>
                    </button>
                    <!-- <button>
                        <v-icon small> {{ mdiChevronDoubleDown }} </v-icon>
                    </button> -->
                </div>
            </template>
        </VideoCardList>

        <!--* INSTRUCTIONS DIALOG FOR YOUTUBE --->
        <v-dialog v-model="instructionsDialog" :width="$store.state.isMobile ? '90%' : '60vw'">
            <v-card>
                <v-card-title>{{ $t("views.library.exportYTHeading") }}</v-card-title>
                <v-card-text>
                    <v-row>
                        <v-col cols="">
                            <p v-html="$t('views.library.exportYTExplanation')"></p>
                            <br />

                            <br />
                            <p v-html="$t('views.library.exportYTInstructions')"></p>
                            <v-btn class="mt-2 mx-2" color="green" @click="exportToYT">
                                {{ $t("views.library.createYtPlaylistButton", [(playlist.videos || []).length]) }}
                            </v-btn>
                            <v-btn class="mt-2 mx-2" @click="instructionsDialog = false">{{
                                $t("views.library.deleteConfirmationCancel")
                            }}</v-btn>
                        </v-col>
                        <v-col cols="12" md="auto">
                            <img src="/img/playlist-instruction.jpg" />
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script lang="ts">
import VideoCardList from "@/components/video/VideoCardList.vue";
import { Playlist } from "@/utils/types";
import { PropType } from "vue";
import { json2csvAsync } from "json-2-csv";
import { mdiContentSave, mdiFileDelimited, mdiChevronDoubleUp, mdiChevronDoubleDown } from "@mdi/js";

export default {
    name: "Playlist",
    components: {
        VideoCardList,
    },
    props: {
        playlist: {
            type: Object as PropType<Playlist>,
            required: true,
        },
        isEditable: {
            type: Boolean,
            required: false,
            default: false,
        },
        isSaved: {
            type: Boolean,
            required: false,
            default: false,
        },
        horizontal: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    data() {
        return {
            mdiContentSave,
            mdiFileDelimited,
            mdiChevronDoubleUp,
            mdiChevronDoubleDown,
            editNameMode: false,
            instructionsDialog: false,
        };
    },
    computed: {
        playlistName: {
            get() {
                return this.playlist.name;
            },
            set(v: string) {
                if (v && v.length > 0) this.$store.commit("playlist/setPlaylist", { ...this.playlist, name: v });
            },
        },
    },
    methods: {
        move(id, direction) {
            const curIdx = this.playlist.videos.findIndex((elem) => elem.id === id);
            if (curIdx < 0) throw new Error("huh");
            let toIdx;
            switch (direction) {
                case "up":
                    toIdx = curIdx - 1;
                    break;
                case "down":
                    toIdx = curIdx + 1;
                    break;
                default:
                    break;
            }
            if (toIdx < 0) throw new Error("can't move stuff before 0");
            if (toIdx >= this.playlist.videos.length) throw new Error("can't move stuff to beyond the end");
            this.$store.commit("playlist/reorder", { from: curIdx, to: toIdx });
        },
        newPlaylist() {
            // eslint-disable-next-line no-restricted-globals,no-alert
            if (this.isSaved || confirm("You will lose unsaved changes. Continue?")) {
                this.$store.commit("playlist/resetPlaylist");
            }
        },
        /** ==============================================
         *                Export Methods.
         *
         *=============================================* */
        async downloadAsCSV() {
            const csvString = await json2csvAsync(this.playlist.videos);
            const a = document.createElement("a");
            const timestamp = new Date().toISOString().replace("T", "_").substr(0, 19);
            a.href = `data:attachment/csv,${encodeURIComponent(csvString)}`;
            a.target = "_blank";
            a.download = `holodexPlaylist_${this.playlist.name}_${timestamp}.csv`;

            document.body.appendChild(a);
            a.click();
        },
        exportToYT() {
            if (!this.playlist.videos || this.playlist.videos.length === 0) return;
            const url = `https://www.youtube.com/watch_videos?video_ids=${this.playlist.videos
                .map((x) => x.id)
                .join(",")}`;

            window.open(url, "_blank", "noopener");
        },
    },
};
</script>

<style lang="scss">
.playlist-video-list .video-card-item-actions {
    padding: 0 !important;
    margin: 0px !important;
}

.playlist-video-list .video-card:hover .video-card-item-actions {
    opacity: 1;
}
.playlist-video-list .video-card .video-card-item-actions {
    opacity: 0.2;
}

.playlist-video-list .video-card-item-actions button {
    padding: 1px 0 !important;
    margin: 0px !important;
    height: 22px !important;
    width: 22px !important;
    line-height: 20px;

    &:hover {
        background-color: var(--v-primary-darken1);
    }
}
</style>
