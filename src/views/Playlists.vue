<template>
    <v-container>
        <v-col>
            <span class="text-h5">Your Playlists:</span><br />
            <span class="text-subtitle-2">Click a playlist to set it as active.</span>
            <!-- <v-list class="mt-4" color="transparent"> -->
            <v-card class="my-4" v-for="playlist in playlists" :key="'plst' + playlist.id + playlist.name">
                <v-list-item two-line>
                    <v-icon left x-large color="secondary" class="mr-6">{{ mdiFormatListText }}</v-icon>
                    <v-list-item-title
                        ><span class="font-weight-medium">{{ playlist.name }}</span> <br />
                        <span class="text-caption">Last Updated: {{ toTime(playlist.updated_at) }}</span>
                    </v-list-item-title>
                    <v-list-item-action>
                        <v-img
                            width="150px"
                            v-for="id in playlist.video_ids"
                            :src="imageSrc(id)"
                            :key="`vid${id}thumb`"
                        ></v-img>
                    </v-list-item-action>
                </v-list-item>
            </v-card>
            <!-- </v-list> -->
        </v-col>
    </v-container>
</template>
<style></style>

<script>
import backendApi from "@/utils/backend-api";
import { localizedDayjs } from "@/utils/time";
import { mdiFormatListText } from "@mdi/js";
import { getVideoThumbnails } from "@/utils/functions";

export default {
    name: "Playlists",
    components: {},
    async mounted() {
        this.playlists = (await backendApi.getPlaylistList(this.$store.state.userdata.jwt)).data;
    },
    data() {
        return {
            mdiFormatListText,
            playlists: [],
            loading: true,
        };
    },
    computed: {},
    methods: {
        toTime(ts) {
            return localizedDayjs(ts, this.$store.state.settings.lang).format("LLL");
        },
        imageSrc(id) {
            // load different images based on current column size, which correspond to breakpoints
            const srcs = getVideoThumbnails(id, false);
            return srcs.medium;
        },
    },
};
</script>
