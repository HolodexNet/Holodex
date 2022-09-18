<template>
  <div class="container max-w-5xl pt-4 mx-auto">
    <span class="text-3xl">{{ $t("views.playlist.page-heading") }}</span
    ><br />
    <span class="text-sm text-opacity-50 text-primary-300">{{
      $t("views.playlist.page-instruction")
    }}</span>
    <!-- <v-list class="mt-4" color="transparent"> -->
    <div id="new-playlist-btn" class="my-4" @click.stop="createNewPlaylist">
      <div class="p-2 line-clamp-2 bg-bgColor-300 card">
        <div class="px-2 font-bold sm:px-6">
          <v-icon left x-large class="">
            {{ icons.mdiPlaylistPlus }}
          </v-icon>
          {{ $t("views.playlist.new-playlist-btn-label") }}
          <br />
          <div v-if="!user" class="text-caption">
            {{ $t("views.playlist.login-prompt") }}
          </div>
        </div>
      </div>
    </div>
    <div
      v-for="playlist in playlists.data.value"
      :key="'plst' + playlist.id + playlist.name"
      class="my-4 cursor-pointer card card-side bg-bgColor-300 card-compact sm:card-normal hover:shadow-xl hover:-translate-y-1"
      :class="
        playlist.id === current.currentPlaylistId
          ? 'active-playlist'
          : 'inactive-playlist'
      "
      @click.stop="setNewPlaylist(playlist)"
    >
      <div class="card-body line-clamp-2">
        <v-list-item-title>
          <span class="font-weight-medium text-subtitle-1">
            <v-icon left x-large color="secondary" class="">
              {{ mdiFormatListText }}
            </v-icon>
            {{ playlist.name }}
          </span>
          <br />
          <span v-show="playlist.updated_at" class="text-caption">
            <span class="hidden-xs-only">{{
              $t("views.playlist.item-last-updated")
            }}</span>
            {{ toTime(playlist.updated_at) }}
          </span>
        </v-list-item-title>
      </div>
      <div class="flex flex-row-reverse self-center ml-0 align-center">
        <!-- local playlist support -->
        <div
          class="group"
          :style="`max-width: ${
            getPlaylistPreview(playlist).length > 1 ? '240px' : '160px'
          };`"
        >
          <img
            v-for="id in getPlaylistPreview(playlist)"
            :key="`vid${id}thumb`"
            :src="imageSrc(id)"
            class="preview-img stack"
          />
        </div>
      </div>
    </div>
    <!-- </v-list> -->
  </div>
</template>

<script lang="ts">
import { localizedDayjs } from "@/utils/time";
import { mdiFormatListText } from "@mdi/js";
import { getVideoThumbnails } from "@/utils/functions";
import { usePlaylistList } from "@/services/playlist";
import { useLangStore } from "@/stores/lang";
import { useDisplay } from "vuetify";
import type { PlaylistListItem, Playlist } from "@/utils/types";
import { usePlaylistState } from "@/stores/playlist";
import { useSiteStore } from "@/stores/site";

export default defineComponent({
  name: "Playlists",
  components: {},
  setup() {
    const playlists = usePlaylistList();
    const langStore = useLangStore();
    const display = useDisplay();
    const current = usePlaylistState();
    const loggedIn = useSiteStore();

    return {
      playlists,
      langStore,
      xs: display.xs,
      current,
      user: loggedIn.user,
    };
  },
  data() {
    return {
      mdiFormatListText,
      serverside: [],
      loading: true,
    };
  },
  computed: {},
  watch: {},

  methods: {
    toTime(ts: any) {
      return localizedDayjs(ts, this.langStore.lang).format("LLL");
    },
    imageSrc(id: string) {
      // load different images based on current column size, which correspond to breakpoints
      const srcs = getVideoThumbnails(id, false);
      return srcs.medium;
    },
    setNewPlaylist(playlist: PlaylistListItem) {
      this.current.currentPlaylistId = playlist.id;
      // Ignore clicks on same playlist
      //   if (playlist.id === this.active.id) return;
      //   if (this.confirmIfNotSaved()) {
      //     this.$store.dispatch("playlist/setActivePlaylistByID", playlist.id);
      //   }
    },
    // confirmIfNotSaved() {
    //   // eslint-disable-next-line no-restricted-globals,no-alert
    //   return (
    //     this.isSaved || confirm(this.$t("views.playlist.change-loss-warning"))
    //   );
    // },
    getPlaylistPreview(playlist: PlaylistListItem | Playlist) {
      const limit = this.xs ? 1 : 4;
      if ((playlist as any).video_ids)
        return (playlist as any).video_ids.slice(0, limit);
      if (playlist.videos)
        return (playlist.videos as VideoRef[])
          .slice(0, limit)
          .map(({ id }) => id);
      return [];
    },
    createNewPlaylist() {
      //   if (!this.jwt) {
      //     this.$router.push("/login");
      //     return;
      //   }
      //   if (this.confirmIfNotSaved()) {
      //     this.$store.commit("playlist/resetPlaylist");
      //     this.$store.commit("playlist/modified");
      //     // resetting is basically the same as creating a new one
      //   }
    },
  },
});
</script>
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
