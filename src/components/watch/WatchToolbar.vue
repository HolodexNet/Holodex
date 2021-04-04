<template>
    <v-card tile class="d-flex justify-space-between flex-wrap-reverse flex-sm-nowrap px-lg-4">
        <v-btn icon lg @click="goBack()" v-if="!noBackButton">
            <v-icon>{{ mdiArrowLeft }}</v-icon>
        </v-btn>
        <div class="watch-btn-group ml-auto d-flex">
            <slot name="buttons"></slot>
            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        icon
                        lg
                        :href="`https://youtu.be/${video.id}`"
                        target="_blank"
                        rel="noopener noreferrer"
                        v-bind="attrs"
                        v-on="on"
                    >
                        <v-icon>{{ mdiOpenInNew }}</v-icon>
                    </v-btn>
                </template>
                <span>{{ $t("views.settings.redirectModeLabel") }}</span>
            </v-tooltip>
            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn icon lg @click="toggleSaved" :color="hasSaved ? 'primary' : ''" v-bind="attrs" v-on="on">
                        <v-icon>{{ hasSaved ? icons.mdiCheck : icons.mdiPlusBox }}</v-icon>
                    </v-btn>
                </template>
                <span>{{ $t("views.watch.saveToLibrary") }}</span>
            </v-tooltip>
        </div>
    </v-card>
</template>

<script lang="ts">
import { mdiOpenInNew, mdiArrowLeft } from "@mdi/js";

export default {
    name: "WatchToolbar",
    components: {},
    props: {
        video: {
            required: true,
        },
        noBackButton: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            darkMode: true,
            mdiOpenInNew,
            mdiArrowLeft,
        };
    },
    methods: {
        toggleSaved() {
            this.hasSaved
                ? this.$store.commit("library/removeSavedVideo", this.video.id)
                : this.$store.commit("library/addSavedVideo", this.video);
        },
        goBack() {
            this.$router.go(-1);
        },
    },
    computed: {
        redirectMode() {
            return this.$store.state.settings.redirectMode;
        },
        hasSaved() {
            return this.$store.getters["library/hasSaved"](this.video.id);
        },
    },
};
</script>

<style>
.watch-btn-group > .v-btn {
    margin-right: 5px;
}
</style>
