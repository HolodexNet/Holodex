<template>
  <v-list>
    <v-list-item
      v-for="(p,idx) in playlistState"
      :key="p.id+p.name"
      :color="p.contains?'green':''"
      :input-value="p.contains"
      @click.stop="toggle(p, idx)"
    >
      <span>{{ p.name }}</span>
      <v-progress-circular
        v-if="p.loading"
        class="d-inline-block ml-2"
        size="12"
        indeterminate
      />
    </v-list-item>
  </v-list>
</template>

<script>
import backendApi from "@/utils/backend-api";

export default {
    props: {
        videoId: {
            required: true,
            type: String,
        },
        video: {
            required: true,
            type: Object,
        },
    },
    data() {
        return {
            playlistState: [],
        };
    },
    computed: {
        active() { return this.$store.state.playlist.active; },
        jwt() { return this.$store.state?.userdata?.jwt; },
    },
    async mounted() {
        if (this.jwt) {
            const playlists = await backendApi.getPlaylistState(this.videoId, this.jwt);
            this.playlistState.push(...playlists.data);
        }
        const activeIdx = this.playlistState.findIndex((p) => p.id === this.active.id);
        if (activeIdx >= 0) {
            // active playlist is SAVED
            // just delete the active playlist from the playlistState
            this.playlistState.splice(activeIdx, 1);
        }
        this.playlistState.unshift({
            id: this.active.id, // might not exist.
            active: true,
            name: this.active.name,
            contains: this.$store.getters["playlist/contains"](this.videoId),
        });
    },
    methods: {
        async toggle(playlist, index) {
            const { id, active, contains } = this.playlistState[index];

            if (active) {
                // active playlist has special handling.
                if (contains) this.$store.commit("playlist/removeVideoByID", this.video);
                else this.$store.commit("playlist/addVideo", this.video);
            } else {
                this.$set(this.playlistState[index], "loading", true);
                // otherwise it's non special.
                if (contains) await backendApi.deleteVideoFromPlaylist(this.videoId, id, this.jwt);
                else await backendApi.addVideoToPlaylist(this.videoId, id, this.jwt);

                this.$set(this.playlistState[index], "loading", false);
            }

            this.$set(this.playlistState[index], "contains", !contains);
        },
    },
};
</script>

<style>

</style>
