<template>
    <v-container>
        <v-row class="d-flex justify-space-between">
            <v-col>
                <div class="text-h6">Saved Videos</div>
                <div>
                    <v-btn
                        class="mr-1 mb-1"
                        color="green"
                        @click="exportSelected"
                    >
                        Create YT Playlist ({{ selected.length }})
                    </v-btn>
                    <v-dialog v-model="deleteDialog" max-width="290">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn
                                color="red"
                                class="mr-1 mb-1"
                                v-bind="attrs"
                                v-on="on"
                            >
                                Delete ({{ selected.length }})
                            </v-btn>
                        </template>
                        <!-- Deletion confirm dialog -->
                        <v-card>
                            <v-card-title>
                                Are you sure you want to delete
                                {{ selected.length }} videos?
                            </v-card-title>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn text @click="deleteDialog = false">
                                    Cancel
                                </v-btn>
                                <v-btn
                                    color="red darken-1"
                                    text
                                    @click="
                                        deleteDialog = false;
                                        deleteSelected;
                                    "
                                >
                                    Delete
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                    <v-btn
                        class="mr-1 mb-1"
                        @click="showReset ? reset() : selectAll()"
                        color="blue-grey"
                    >
                        {{ showReset ? "Reset" : "Select All" }}
                    </v-btn>
                </div>
            </v-col>
        </v-row>
        <VideoCardList
            :videos="savedVideosList"
            horizontal
            includeChannel
            v-if="savedVideosList.length > 0"
        >
            <template v-slot:action="prop">
                <v-checkbox
                    v-model="selected"
                    :value="prop.video.id"
                    hide-details
                    @click="e => e.preventDefault()"
                ></v-checkbox>
            </template>
        </VideoCardList>
        <div v-else class="text-center">
            You have no saved videos!
        </div>
    </v-container>
</template>

<script>
import VideoCardList from "@/components/VideoCardList";
export default {
    name: "Library",
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
            return this.$store.state.savedVideos;
        },
        savedVideosList() {
            return Object.values(this.savedVideos)
                .sort((a, b) => {
                    var dateA = new Date(a.added_at).getTime();
                    var dateB = new Date(b.added_at).getTime();
                    return dateA > dateB ? 1 : -1;
                })
                .reverse();
        },
        showReset() {
            return this.selected.length != 0;
        },
    },
    methods: {
        selectAll() {
            this.selected = this.savedVideosList.map(v => v.id);
        },
        reset() {
            this.selected = [];
        },
        deleteSelected() {
            this.selected.forEach(id => {
                this.$store.commit("removeSavedVideo", id);
            });
            this.reset();
        },
        exportSelected() {
            if (this.selected.length == 0) return;
            const yt_video_keys = this.selected.map(video_id => {
                return this.savedVideos[video_id].yt_video_key;
            });
            const url =
                "https://www.youtube.com/watch_videos?video_ids=" +
                yt_video_keys.join(",");

            window.open(url, "_blank", "noopener");
            this.reset();
        },
    },
};
</script>

<style></style>
