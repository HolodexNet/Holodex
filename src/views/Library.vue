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
    </v-container>
</template>

<script>
import VideoCardList from "@/components/video/VideoCardList";

export default {
    name: "Library",
    metaInfo: {
        title: "Library",
    },
    components: {
        VideoCardList,
    },
    data() {
        return {
            selected: [],
            deleteDialog: false,
        };
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
    },
};
</script>

<style></style>
