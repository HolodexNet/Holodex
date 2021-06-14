<template>
    <v-navigation-drawer
        v-bind:value="value"
        v-on:input="$emit('input', $event)"
        app
        width="400"
        clipped
        right
        class="nav-scroll thin-scroll-bar"
        :temporary="false"
        style="padding-top: env(safe-area-inset-top); padding-right: calc(env(safe-area-inset-right) / 1.3)"
    >
        <slot />
        <v-list dense class="pb-0"> </v-list>
        Hello world
        <playlist :playlist="active" isEditable></playlist>
    </v-navigation-drawer>
</template>

<script lang="ts">
// import { dayjs } from "@/utils/time";
// import { mdiTuneVariant } from "@mdi/js";
import { mapState } from "vuex";
import Playlist from "../playlist/Playlist.vue";

export default {
    name: "PlaylistDrawer",
    components: { Playlist },
    props: {
        value: {
            type: Boolean,
            default: true,
        },
        // temporary: {
        //     type: Boolean,
        //     default: true,
        // },
    },
    data() {
        return {
            favoritesExpanded: false,
        };
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
