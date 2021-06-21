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
                        <span class="text-caption" v-show="playlist.updated_at">
                            Last Updated: {{ toTime(playlist.updated_at) }}
                        </span>
                    </v-list-item-title>
                    <v-list-item-action class="flex-row-reverse">
                        <!-- local playlist support -->
                        <div class="group">
                            <img
                                v-for="id in getTopFour(playlist)"
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
<style>
.active-playlist {
    border-top: 2px solid var(--v-primary-base) !important;
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
            if (this.$store.state.userdata.jwt) {
                this.serverside = (await backendApi.getPlaylistList(this.$store.state.userdata.jwt)).data;
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
        getTopFour(playlist) {
            if (playlist.video_ids) return playlist.video_ids.slice(0, 4);
            if (playlist.videos) return playlist.videos.slice(0, 4).map(({ id }) => id);
            return [];
        },
    },
};
</script>
