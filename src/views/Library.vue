<template>
    <v-container>
        <v-row class="d-flex justify-space-between">
            <v-col>
                <div class="text-h6">Saved Videos</div>
                <div>
                    <v-btn class="mr-1" color="green" @click="exportSelected">
                        Export ({{ selected.length }})
                    </v-btn>
                    <v-btn class="mr-1" color="red" @click="deleteSelected">
                        Delete ({{ selected.length }})
                    </v-btn>
                    <v-btn
                        class="mr-1"
                        @click="showReset ? reset() : selectAll()"
                    >
                        {{ showReset ? "Reset" : "Select All" }}
                    </v-btn>
                </div>
            </v-col>
        </v-row>
        <VideoCardList :videos="savedVideosList" horizontal includeChannel>
            <template v-slot:action="prop">
                <v-checkbox
                    v-model="selected"
                    :value="prop.video.id"
                    hide-details
                ></v-checkbox>
            </template>
        </VideoCardList>
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
