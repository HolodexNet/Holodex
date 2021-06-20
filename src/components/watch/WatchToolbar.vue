<template>
    <v-card tile class="d-flex justify-space-between flex-wrap-reverse flex-sm-nowrap px-lg-4">
        <v-btn icon lg @click="goBack()" v-if="!noBackButton">
            <v-icon>{{ mdiArrowLeft }}</v-icon>
        </v-btn>
        <div class="watch-btn-group ml-auto d-flex">
            <slot name="buttons"></slot>
            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn icon lg @click="toggleSaved" :color="hasSaved ? 'primary' : ''" v-bind="attrs" v-on="on">
                        <v-icon>{{ hasSaved ? icons.mdiCheck : icons.mdiPlusBox }}</v-icon>
                    </v-btn>
                </template>
                <span v-if="!hasSaved">{{ $t("views.watch.saveToPlaylist") }}</span>
                <span v-else>{{ $t("views.watch.removeFromPlaylist") }}</span>
            </v-tooltip>
            <v-menu bottom nudge-top="20px">
                <template v-slot:activator="{ on }">
                    <v-btn icon lg v-on="on" :ripple="false">
                        <v-icon>
                            {{ icons.mdiDotsVertical }}
                        </v-icon>
                    </v-btn>
                </template>
                <v-list dense>
                    <v-list-item :href="`https://youtu.be/${video.id}`" target="_blank">
                        <v-icon left color="red">
                            {{ icons.mdiYoutube }}
                        </v-icon>
                        {{ $t("views.settings.redirectModeLabel") }}
                    </v-list-item>
                    <v-list-item @click.stop="copyLink"
                        ><v-icon left>{{ icons.mdiClipboardPlusOutline }}</v-icon>
                        {{ $t("component.videoCard.copyLink") }}
                    </v-list-item>
                    <v-list-item
                        :disabled="video.type === 'clip'"
                        :to="`/multiview/AAUY${video.id}${getChannelShortname(video.channel)}%2CUAEYchat`"
                    >
                        <v-icon left :color="video.type === 'clip' ? 'grey' : ''">
                            {{ icons.mdiViewDashboard }}
                        </v-icon>
                        {{ $t("component.mainNav.multiview") }}
                    </v-list-item>
                    <v-list-item @click="$store.commit('setReportVideo', video)">
                        <v-icon left :color="video.type === 'clip' ? 'grey' : ''">{{ icons.mdiFlag }} </v-icon>
                        {{ $t("component.reportDialog.title") }}
                    </v-list-item>
                </v-list>
            </v-menu>
        </div>
        <v-snackbar app v-model="doneCopy" :timeout="3000" color="success">
            {{ $t("component.videoCard.copiedToClipboard") }}
            <template v-slot:action="{ attrs }">
                <v-btn text v-bind="attrs" @click="doneCopy = false">
                    {{ $t("views.app.close_btn") }}
                </v-btn>
            </template>
        </v-snackbar>
    </v-card>
</template>

<script lang="ts">
import { mdiOpenInNew, mdiArrowLeft } from "@mdi/js";
import copyToClipboard from "@/mixins/copyToClipboard";

export default {
    name: "WatchToolbar",
    components: {},
    mixins: [copyToClipboard],
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
        getChannelShortname(ch) {
            return (
                (ch.english_name && ch.english_name.split(/[/\s]/g).join("_")) ||
                ch.name.split(/[/\s]/)[0].replace(",", "")
            );
        },
        toggleSaved() {
            this.hasSaved
                ? this.$store.commit("playlist/removeVideoByID", this.video.id)
                : this.$store.commit("playlist/addVideo", this.video);
        },
        goBack() {
            this.$router.replace(this.$route.meta.prevPath || "/");
        },
        copyLink() {
            const link = `${window.origin}/watch/${this.video.id}`;
            this.copyToClipboard(link);
        },
    },
    computed: {
        redirectMode() {
            return this.$store.state.settings.redirectMode;
        },
        hasSaved() {
            return this.$store.getters["playlist/contains"](this.video.id);
        },
    },
};
</script>

<style>
.watch-btn-group > .v-btn {
    margin-right: 5px;
}
</style>
