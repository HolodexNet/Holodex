<template>
    <v-container>
        <v-col>
            <span class="text-h5">Your Playlists:</span><br />
            <span class="text-subtitle-2">Click a playlist to set it as active.</span>
            <!-- <v-list class="mt-4" color="transparent"> -->
            <v-card
                class="my-4"
                v-for="playlist in playlists"
                :key="'plst' + playlist.id + playlist.name"
                :class="playlist.id === active.id ? 'active-playlist' : ''"
                @click.stop="setNewPlaylist(playlist)"
            >
                <v-list-item two-line>
                    <v-icon left x-large color="secondary" class="mr-6">{{ mdiFormatListText }}</v-icon>
                    <v-list-item-title>
                        <span class="font-weight-medium text-subtitle-1">
                            {{ playlist.name }}
                        </span>
                        <v-chip
                            small
                            v-if="playlist.id === active.id && !$store.state.playlist.isSaved"
                            color="warning"
                            label
                            class="py-0 ml-1"
                        >
                            Not saved
                        </v-chip>
                        <br />
                        <span class="text-caption">Last Updated: {{ toTime(playlist.updated_at) }}</span>
                    </v-list-item-title>
                    <v-list-item-action class="flex-row">
                        <v-img
                            v-for="id in (playlist.video_ids || []).splice(0, 4)"
                            :src="imageSrc(id)"
                            :key="`vid${id}thumb`"
                            class="preview-img"
                        ></v-img>
                        <!-- local playlist support -->
                        <v-img
                            v-for="{ id } in (playlist.videos || []).splice(0, 4)"
                            :src="imageSrc(id)"
                            :key="`vid${id}thumb`"
                            class="preview-img"
                        ></v-img>
                    </v-list-item-action>
                </v-list-item>
            </v-card>
            <!-- </v-list> -->
        </v-col>
    </v-container>
</template>
<style>
.active-playlist {
    border-top: 2px solid var(--v-primary-base) !important;
}
.preview-img {
    display: inline-block;
    margin-left: -50%;
    height: 90px;
}
</style>

<script>
import backendApi from "@/utils/backend-api";
import { localizedDayjs } from "@/utils/time";
import { mdiFormatListText } from "@mdi/js";
import { getVideoThumbnails } from "@/utils/functions";
import { mapState } from "vuex";

export default {
    name: "Playlists",
    components: {},
    async mounted() {
        this.serverside = (await backendApi.getPlaylistList(this.$store.state.userdata.jwt)).data;
    },
    data() {
        return {
            mdiFormatListText,
            serverside: [],
            loading: true,
        };
    },
    computed: {
        ...mapState("playlist", ["active", "isSaved"]),
        playlists() {
            if (!this.active.id) return [this.active, ...this.serverside];
            return this.serverside;
        },
    },
    methods: {
        toTime(ts) {
            return localizedDayjs(ts, this.$store.state.settings.lang).format("LLL");
        },
        imageSrc(id) {
            // load different images based on current column size, which correspond to breakpoints
            const srcs = getVideoThumbnails(id, false);
            return srcs.medium;
        },
        setNewPlaylist(playlist) {
            if (this.active.id !== playlist.id) {
                if (this.isSaved) {
                    this.$store.dispatch("playlist/setActivePlaylistByID", playlist.id);
                } else if (
                    // eslint-disable-next-line no-alert,no-restricted-globals
                    confirm("You will lose unsaved changes. Continue?")
                ) {
                    this.$store.dispatch("playlist/setActivePlaylistByID", playlist.id);
                }
            }
        },
    },
};
</script>
