<template>
    <div class="mb-2" elevation="0">
        <a
            class="d-block text-overline ma-2"
            @click="
                showPlaylist = !showPlaylist;
                userEnforced = true;
            "
        >
            {{ !showPlaylist ? "＋" : "－" }} Playlist
        </a>
        <v-expand-transition>
            <div v-show="showPlaylist">
                <VirtualVideoCardList
                    :videos="videos"
                    includeChannel
                    horizontal
                    ignoreBlock
                    :activeIndex="value"
                    :style="{ height: Math.min(videos.length, 6) * 102 + 'px' }"
                />
            </div>
        </v-expand-transition>
        <!-- </v-card-text> -->
    </div>
</template>

<script lang="ts">
import VirtualVideoCardList from "@/components/video/VirtualVideoCardList.vue";
import { mapState } from "vuex";

export default {
    name: "WatchPlaylist",
    components: {
        VirtualVideoCardList,
    },
    props: {
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
            showPlaylist: this.value >= 0,
            userEnforced: false,
            // activeIndex: 0,
        };
    },
    beforeDestroy() {},
    mounted() {
        // this.activeIndex = Math.floor( Math.random() * this.videos.length);
        this.updateCurrentIndex();
    },
    methods: {
        updateCurrentIndex() {
            const currentId = this.video.id;
            const newIndex = this.videos.findIndex(({ id }) => id === currentId);
            if (!this.userEnforced) {
                this.showPlaylist = newIndex >= 0;
            }
            this.$emit("input", newIndex);
        },
    },
    watch: {
        value(nw) {
            if (this.videos.length === nw) return;
            this.$emit("playNext", { video: this.videos[nw] });
        },
        video() {
            this.updateCurrentIndex();
        },
    },
    computed: {
        ...mapState("watch", ["video"]),
        ...mapState("playlist", ["active", "isSaved"]),
        videos() {
            return this.active.videos || [];
        },
    },
};
</script>

<style></style>
