<template>
  <div class="mb-2" elevation="0">
    <!-- <a
            class="d-block text-overline ma-2"
            @click="
                showPlaylist = !showPlaylist;
            "
        >
            {{ !showPlaylist ? "＋" : "－" }} Playlist
        </a> -->
    <v-card>
      <template v-if="playlist">
        <v-card-title>
          {{ playlist.name }}
        </v-card-title>
        <v-card-subtitle>{{ value + 1 }}/{{ videos.length }}</v-card-subtitle>
        <v-divider />
        <VirtualVideoCardList
          :videos="videos"
          :playlist="playlist"
          include-channel
          horizontal
          ignore-block
          :active-index="value"
          :style="{ height: Math.min(videos.length, 6) * 102 + 'px' }"
        />
      </template>
      <v-card-title v-if="hasError">
        Error loading playlist, does it exist?
      </v-card-title>
    </v-card>
    <!-- </v-card-text> -->
  </div>
</template>

<script lang="ts">
import VirtualVideoCardList from "@/components/video/VirtualVideoCardList.vue";
import { mapState } from "vuex";
import backendApi from "@/utils/backend-api";

export default {
    name: "WatchPlaylist",
    components: {
        VirtualVideoCardList,
    },
    props: {
        // sync'd playlist index value
        value: {
            type: Number,
            default: 0,
        },
        currentTime: {
            type: Number,
            default: 0,
        },
    },
    data() {
        return {
            isLoading: false,
            hasError: false,
            playlist: undefined,
            // showPlaylist: true,
            // userEnforced: false,
            // activeIndex: 0,
        };
    },
    computed: {
        ...mapState("watch", ["video"]),
        ...mapState("playlist", ["active", "isSaved"]),
        videos() {
            return (this.playlist && this.playlist.videos) || [];
        },
    },
    watch: {
        value(nw) {
            if (
                !this.videos.length
                || this.videos.length === nw
                || nw === -1
                || this.$route.params.id === this.videos[nw].id
            ) {
                return;
            }
            this.$emit("playNext", { video: this.videos[nw] });
        },
        video() {
            this.updateCurrentIndex();
        },
    },
    beforeDestroy() {},
    mounted() {
        if (!this.$route.query.playlist) return;
        this.updateCurrentIndex();
        this.loadPlaylist(this.$route.query.playlist);
    },
    methods: {
        updateCurrentIndex() {
            const currentId = this.video.id;
            const newIndex = this.videos.findIndex(({ id }) => id === currentId);
            // this.value = newIndex;
            this.$emit("input", newIndex);
        },
        loadPlaylist(playlistId) {
            if (playlistId === this.active.id || playlistId === "local") {
                this.playlist = this.active;
                this.updateCurrentIndex();
                return;
            }
            this.isLoading = true;
            backendApi
                .getPlaylist(playlistId)
                .then(({ data }) => {
                    this.playlist = data;
                    this.updateCurrentIndex();
                })
                .catch((e) => {
                    console.error(e);
                    this.hasError = true;
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
    },
};
</script>

<style></style>
