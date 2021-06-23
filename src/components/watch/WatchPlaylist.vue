<template>
    <v-card tile class="mb-2">
        <VirtualVideoCardList :videos="videos" includeChannel horizontal ignoreBlock :activeIndex="value" />
        <!-- </v-card-text> -->
    </v-card>
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
            // activeIndex: 0,
        };
    },
    beforeDestroy() {},
    mounted() {
        // this.activeIndex = Math.floor( Math.random() * this.videos.length);
    },
    methods: {},
    watch: {
        value(nw) {
            if (this.videos.length === nw) return;
            this.$emit("playNext", { video: this.videos[nw] });
        },
    },
    computed: {
        ...mapState("playlist", ["active", "isSaved"]),
        // playlist() {
        //     return this.active;
        // },
        videos() {
            return this.active.videos || [];
        },
    },
};
</script>

<style></style>
