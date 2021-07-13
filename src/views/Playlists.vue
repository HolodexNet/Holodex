<template>
    <v-container>
        <v-col>
            <span class="text-h5">{{ $t("views.playlist.page-heading") }}</span
            ><br />
            <span class="text-subtitle-2">{{ $t("views.playlist.page-instruction") }}</span>
            <!-- <v-list class="mt-4" color="transparent"> -->
            <v-card class="my-4" id="new-playlist-btn" @click.stop="createNewPlaylist">
                <v-list-item two-line>
                    <v-icon left x-large class="mr-3">{{ icons.mdiPlaylistPlus }}</v-icon>
                    <v-list-item-title class="font-weight-medium text-subtitle-2">
                        {{ $t("views.playlist.new-playlist-btn-label") }}
                        <br />
                        <div v-if="!jwt" class="text-caption">
                            {{ $t("views.playlist.login-prompt") }}
                        </div>
                    </v-list-item-title>
                </v-list-item>
            </v-card>
            <v-card
                class="my-4"
                v-for="playlist in playlists"
                :key="'plst' + playlist.id + playlist.name"
                :class="playlist.id === active.id ? 'active-playlist' : 'inactive-playlist'"
                @click.stop="setNewPlaylist(playlist)"
            >
                <v-list-item two-line class="pr-1">
                    <v-icon left x-large color="secondary" class="mr-3 hidden-xs-only">{{ mdiFormatListText }}</v-icon>
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
                            {{ $t("views.playlist.playlist-is-modified") }}
                        </v-chip>
                        <br />
                        <span class="text-caption" v-show="playlist.updated_at">
                            <span class="hidden-xs-only">{{ $t("views.playlist.item-last-updated") }}</span>
                            {{ toTime(playlist.updated_at) }}
                        </span>
                    </v-list-item-title>
                    <v-list-item-action class="flex-row-reverse ml-0" style="width: 380px">
                        <!-- local playlist support -->
                        <div class="group">
                            <img
                                v-for="id in getPlaylistPreview(playlist)"
                                :src="imageSrc(id)"
                                :key="`vid${id}thumb`"
                                class="preview-img stack"
                            />
                        </div>
                    </v-list-item-action>
                </v-list-item>
            </v-card>
            <!-- </v-list> -->
        </v-col>
    </v-container>
</template>
<style scoped>
.active-playlist {
    position: relative;
    left: -1px;
    top: -1px;
    border: 2px solid var(--v-primary-base) !important;
}
.inactive-playlist:hover {
    position: relative;
    left: -0.5px;
    top: -0.5px;
    border: 1px solid var(--v-primary-base) !important;
}
/* Layout */
.group {
    position: relative;
    width: 240px;
    height: 90px;
}

.stack {
    display: block;
    width: 150px;
    height: 90px;
    border: 1px solid black;
    border-radius: 5px;
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.9);
    position: absolute;
    transition: top 0.5s ease-out;
    top: 0px;
}

.stack:nth-child(2) {
    left: 25px;
}
.stack:nth-child(3) {
    left: 50px;
}
.stack:nth-child(4) {
    left: 75px;
}

.stack:hover {
    z-index: 2;
    top: -4px !important;
}

.group:hover .stack {
    top: 10px;
}

#new-playlist-btn {
    border: 2px dashed var(--v-primary-darken1);
    opacity: 0.8;
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
        try {
            if (this.jwt) {
                this.serverside = (await backendApi.getPlaylistList(this.jwt)).data;
            }
        } catch {
            this.serverside = [];
        }
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
        jwt() {
            return this.$store.state.userdata.jwt;
        },
    },
    watch: {
        async isSaved(newval) {
            if (newval)
                // is now saved
                this.serverside = (await backendApi.getPlaylistList(this.jwt)).data;
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
            // Ignore clicks on same playlist
            if (playlist.id === this.active.id) return;

            if (this.confirmIfNotSaved()) {
                this.$store.dispatch("playlist/setActivePlaylistByID", playlist.id);
            }
        },
        confirmIfNotSaved() {
            // eslint-disable-next-line no-restricted-globals,no-alert
            return this.isSaved || confirm(this.$t("views.playlist.change-loss-warning"));
        },
        getPlaylistPreview(playlist) {
            const limit = this.$vuetify.breakpoint.xs ? 1 : 4;
            if (playlist.video_ids) return playlist.video_ids.slice(0, limit);
            if (playlist.videos) return playlist.videos.slice(0, limit).map(({ id }) => id);
            return [];
        },
        createNewPlaylist() {
            if (!this.jwt) {
                this.$router.push("/login");
                return;
            }
            if (this.confirmIfNotSaved()) {
                this.$store.commit("playlist/resetPlaylist");
                this.$store.commit("playlist/modified");
                // resetting is basically the same as creating a new one
            }
        },
    },
};
</script>
