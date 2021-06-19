<template>
    <v-card width="400" class="nav-scroll thin-scroll-bar pl-2">
        <slot />
        <div class="pa-2">
            <span class="text-overline secondary--text">Current Playlist</span>
            <playlist :playlist="active" isEditable :isSaved="isSaved" horizontal></playlist>
        </div>
    </v-card>
</template>

<script lang="ts">
import { mapState } from "vuex";
import Playlist from "@/components/playlist/Playlist.vue";

export default {
    name: "EditPlaylist",
    components: { Playlist },
    data() {
        return {};
    },
    mounted() {},
    beforeDestroy() {},
    computed: {
        ...mapState("playlist", ["active", "isSaved"]),
    },
    methods: {},
};
</script>

<style>
.nav-scroll > .v-navigation-drawer__content {
    scrollbar-width: thin; /* firefox fall back */
}

.nav-scroll > .v-navigation-drawer__content::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.nav-scroll > .v-navigation-drawer__content::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
}

.nav-scroll > .v-navigation-drawer__content::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.5);
}

.nav-scroll > .v-navigation-drawer__content:hover {
    overflow-y: auto !important; /* firefox fallback */
    overflow-y: overlay !important;
}

/* overflow-y: overlay does not work on temporary drawer */
.nav-scroll.v-navigation-drawer--temporary > .v-navigation-drawer__content {
    overflow-y: auto !important;
}

.nav-scroll > .v-navigation-drawer__content {
    overflow-y: hidden !important;
}
</style>
