<template>
    <v-container>
        <v-row class="d-flex justify-space-between">
            <v-col>
                <div class="text-h6">
                    {{ $t("views.library.savedVideosTitle") }}
                </div>
                <div>
                    <v-btn class="mr-1 mb-1" color="green" @click="exportSelected">
                        {{ $t("views.library.createYtPlaylistButton", [selected.length]) }}
                    </v-btn>
                    <v-dialog v-model="deleteDialog" max-width="290">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn color="red" class="mr-1 mb-1" v-bind="attrs" v-on="on">
                                {{ $t("views.library.deleteFromLibraryButton", [selected.length]) }}
                            </v-btn>
                        </template>
                        <!-- Deletion confirm dialog -->
                        <v-card>
                            <v-card-title>
                                {{ $t("views.library.deleteConfirmation", [selected.length]) }}
                            </v-card-title>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn text @click="deleteDialog = false">
                                    {{ $t("views.library.deleteConfirmationCancel") }}
                                </v-btn>
                                <v-btn
                                    color="red darken-1"
                                    text
                                    @click="
                                        deleteDialog = false;
                                        deleteSelected();
                                    "
                                >
                                    {{ $t("views.library.deleteConfirmationOK") }}
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                    <v-btn class="mr-1 mb-1" @click="showReset ? reset() : selectAll()" color="blue-grey">
                        {{ showReset ? $t("views.library.selectionReset") : $t("views.library.selectionSelectAll") }}
                    </v-btn>
                </div>
            </v-col>
        </v-row>
        <VideoCardList :videos="savedVideosList" horizontal includeChannel v-if="savedVideosList.length > 0">
            <template v-slot:action="prop">
                <v-checkbox
                    v-model="selected"
                    :value="prop.video.id"
                    hide-details
                    @click="(e) => e.preventDefault()"
                ></v-checkbox>
            </template>
        </VideoCardList>
        <div v-else class="text-center">
            {{ $t("views.library.emptyLibrary") }}
        </div>
        <v-card v-if="recoveredVideos.length > 0" class="mt-2">
            <v-card-title>Where's my saved videos!?</v-card-title>
            <v-card-text>
                The new library is incompatible with the old library data. The links below will take you to the same
                video on Holodex, where you can click the save button again. We have also created a youtube playlist, if
                you want to save it on youtube.
            </v-card-text>
            <v-btn :href="recoveredUrl" color="green" class="ma-2" target="_blank" rel="noreferrer">
                Open all as Youtube Playlist
            </v-btn>
            <v-btn @click="clearOldStorage" class="ma-2">Clear Old Storage And Remove Message</v-btn>
            <v-list>
                <v-list-item v-for="video in recoveredVideos" :key="video.id">
                    <v-list-item-action>
                        <v-btn text color="primary" :href="`/watch/${video.yt_video_key}`" target="_blank">
                            Open on Holodex
                        </v-btn>
                    </v-list-item-action>
                    {{ video.title }}
                </v-list-item>
            </v-list>
        </v-card>
    </v-container>
</template>

<script>
import VideoCardList from "@/components/video/VideoCardList";

export default {
    name: "Library",
    metaInfo() {
        const vm = this;
        return {
            get title() {
                return `${vm.$t("component.mainNav.library")} - Holodex`;
            },
        };
    },
    components: {
        VideoCardList,
    },
    data() {
        return {
            selected: [],
            deleteDialog: false,
            recoveredVideos: [],
            recoveredUrl: "",
        };
    },
    created() {
        if (localStorage.getItem("holodex") !== null) {
            const oldStore = JSON.parse(localStorage.getItem("holodex"));
            const oldSavedVideos = oldStore.savedVideos;
            if (oldSavedVideos) {
                const videos = Object.values(oldSavedVideos);
                // this.recoveryUrl =
                this.recoveredVideos = videos;
                this.recoveredUrl = `https://www.youtube.com/watch_videos?video_ids=${videos
                    .map((v) => v.yt_video_key)
                    .join(",")}`;
            }
            // localStorage.removeItem("holodex");
        }
    },
    computed: {
        savedVideos() {
            return this.$store.state.library.savedVideos;
        },
        savedVideosList() {
            return Object.values(this.savedVideos)
                .sort((a, b) => {
                    const dateA = new Date(a.added_at).getTime();
                    const dateB = new Date(b.added_at).getTime();
                    return dateA > dateB ? 1 : -1;
                })
                .reverse();
        },
        showReset() {
            return this.selected.length !== 0;
        },
    },
    methods: {
        selectAll() {
            this.selected = this.savedVideosList.map((v) => v.id);
        },
        reset() {
            this.selected = [];
        },
        deleteSelected() {
            this.selected.forEach((id) => {
                this.$store.commit("library/removeSavedVideo", id);
            });
            this.reset();
        },
        exportSelected() {
            if (this.selected.length === 0) return;
            const url = `https://www.youtube.com/watch_videos?video_ids=${this.selected.join(",")}`;

            window.open(url, "_blank", "noopener");
            this.reset();
        },
        clearOldStorage() {
            localStorage.removeItem("holodex");
            this.$router.go(0);
        },
    },
};
</script>

<style></style>
