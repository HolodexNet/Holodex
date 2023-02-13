<template>
  <div class="flex h-full flex-col">
    <div>
      <div v-if="editNameMode" class="flex w-full flex-row">
        <input
          v-model="playlistName"
          type="text"
          placeholder="Type here"
          class="input w-full flex-auto"
          required
          aria-required
          autofocus
          @keydown.enter="editNameMode = false"
        />
        <div class="btn flex-initial" @click="editNameMode = false">OK</div>
      </div>
      <span v-else class="flex-shrink flex-grow" style="flex-basis: 100%">
        <div class="inline-block py-1 text-lg font-bold">
          {{ playlist.name }}
        </div>
        <h-btn
          v-show="isEditable"
          ghost
          small
          class="btn float-right w-8"
          @click="editNameMode = true"
        >
          <h-icon class="i-mdi:pencil" />
        </h-btn>
      </span>
      <h-menu placement="bottom-end">
        <template #activator="{ props }">
          <h-btn ghost small class="btn float-right w-8" v-bind="props">
            <h-icon class="i-mdi:dots-vertical" />
          </h-btn>
        </template>
        <h-list class="bg-base-100">
          <h-list-item v-if="isEditable" @click="$emit('new-playlist')">
            <!-- Please migrate these V-Icon along with the list items coz it's not actually that easy to move one and not the other. -->
            <h-icon class="i-mdi:plus-box" />
            {{ $t("component.playlist.menu.new-playlist") }}
          </h-list-item>
          <!-- feed back a green ripple on click... theoretically -->
          <h-list-item v-if="isEditable" @click="editNameMode = true">
            <h-icon class="i-mdi:pencil" />
            {{ $t("component.playlist.menu.rename-playlist") }}
          </h-list-item>
          <!-- $store.dispatch('playlist/setActivePlaylistByID', playlist.id) -->
          <!-- <h-list-item :ripple="{ class: 'green--text' }" :disabled="!playlist.id"
                        ><h-icon left>{{ some sharing icon idk }}</h-icon>
                        {{ playlist.id ? "Copy sharable Playlist link" : "Save the playlist to enable link-sharing." }}
                    </h-list-item> -->
          <h-divider />
          <!-- Exporting options -->
          <h-list-item>
            <h-icon class="i-mdi:open-in-new" />
            {{ $t("component.playlist.menu.export-playlist") }}
          </h-list-item>
          <h-list-item class="ml-5" @click.stop="instructionsDialog = true">
            {{ $t("views.library.exportYtPlaylist") }}
          </h-list-item>
          <h-list-item dense class="ml-5" @click.stop="downloadAsCSV">
            {{ $t("views.library.exportCsv") }}
          </h-list-item>
          <!-- End Exporting options -->
          <h-divider class="" />
          <h-list-item v-if="isEditable" @click="deletePlaylist">
            <h-icon class="i-mdi:delete text-red-500" />
            {{
              playlist.id
                ? $t("component.playlist.menu.delete-playlist")
                : $t("component.playlist.menu.clear-playlist")
            }}
          </h-list-item>
        </h-list>
      </h-menu>
    </div>
    <span class="block text-right text-sm text-secondary-300 text-opacity-50">
      {{ playlist.videos?.length }} / {{ maxPlaylistCount }}
    </span>

    <div class="flex-auto flex-shrink overflow-auto">
      <video-card-virtual-list :videos="playlist.videos || []">
        <template #default="{ video }">
          <div
            class="btn-group btn-group-vertical mr-1 w-5 self-center text-sm"
          >
            <!-- <button class="p-0 btn btn-ghost btn-xs">
              <i class="i-bx:chevrons-up"></i>
            </button> -->
            <button
              class="btn btn-ghost btn-xs p-0"
              @click.stop.prevent="move(video.id, 'up')"
            >
              <div :class="icons.up" />
            </button>
            <button
              class="btn btn-ghost btn-xs p-0"
              @click.stop.prevent="del(video.id)"
            >
              <div :class="icons.trash" />
            </button>
            <button
              class="btn btn-ghost btn-xs p-0"
              @click.stop.prevent="move(video.id, 'down')"
            >
              <div :class="icons.down" />
            </button>
            <!-- <button class="p-0 btn btn-ghost btn-xs">
              <div class="i-bx:chevrons-down"></div>
            </button> -->
          </div>
        </template>
      </video-card-virtual-list>
    </div>
  </div>

  <!--* INSTRUCTIONS DIALOG FOR YOUTUBE --->
  <h-dialog
    v-model="instructionsDialog"
    :width="display.mobile ? '90%' : '60vw'"
  >
    <h-card>
      <div class="card-body">
        <div class="card-title">{{ $t("views.library.exportYTHeading") }}</div>
        <p class="mb-2" v-html="$t('views.library.exportYTExplanation')" />
        <p v-html="$t('views.library.exportYTInstructions')" />
        <div>
          <h-btn class="btn-primary mx-2 mt-2" @click="exportToYT">
            {{
              $t("views.library.createYtPlaylistButton", [
                (playlist.videos || []).length,
              ])
            }}
          </h-btn>
          <h-btn
            class="btn-error mx-2 mt-2"
            @click="instructionsDialog = false"
          >
            {{ $t("views.library.deleteConfirmationCancel") }}
          </h-btn>
        </div>
        <!-- TODO BROKEN LINK HERE -->
        <!-- <img src="/img/playlist-instruction.jpg" /> -->
      </div>
    </h-card>
  </h-dialog>
</template>

<script lang="ts">
import { useDisplay } from "@/hooks/common/useDisplay";
import { EditablePlaylist, usePlaylistPatcher } from "@/services/playlist";
import { MAX_PLAYLIST_LENGTH } from "@/utils/consts";
import type { Playlist } from "@/utils/types";
import { json2csvAsync } from "json-2-csv";
import type { PropType } from "vue";

export default defineComponent({
  name: "PlaylistCard",
  components: {},
  props: {
    playlist: {
      type: Object as PropType<Playlist>,
      required: true,
    },
    isEditable: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup() {
    const display = useDisplay();
    const patcher = usePlaylistPatcher();
    return { display, patcher };
  },
  data() {
    return {
      editNameMode: false,
      instructionsDialog: false,
      maxPlaylistCount: MAX_PLAYLIST_LENGTH,
      editedPlaylistName: "",
    };
  },
  computed: {
    playlistName: {
      get() {
        return this.editNameMode ? this.editedPlaylistName : this.playlist.name;
      },
      set(v: string) {
        if (this.editNameMode) this.editedPlaylistName = v;
      },
    },
  },
  methods: {
    move(id: string, direction: "up" | "down") {
      // @todo
      console.log(this.playlist.videos?.map(({ id }) => id));
      const edit = new EditablePlaylist(this.playlist)
        .reorder(id, direction)
        .valueOf();
      console.log(edit.videos?.map(({ id }) => id));

      this.patcher.mutate(edit);
    },
    del(id: string) {
      const edit = new EditablePlaylist(this.playlist).removeId(id).valueOf();
      this.patcher.mutate(edit);
    },
    newPlaylist() {
      // something
    },
    deletePlaylist() {
      // do Something
    },
    /** ==============================================
     *                Export Methods.
     *
     *=============================================* */
    async downloadAsCSV() {
      const csvString = await json2csvAsync(this.playlist.videos || []);
      const a = document.createElement("a");
      const timestamp = new Date()
        .toISOString()
        .replace("T", "_")
        .substr(0, 19);
      a.href = `data:attachment/csv,${encodeURIComponent(csvString)}`;
      a.target = "_blank";
      a.download = `holodexPlaylist_${this.playlist.name}_${timestamp}.csv`;

      document.body.appendChild(a);
      a.click();
    },
    exportToYT() {
      if (!this.playlist.videos || this.playlist.videos.length === 0) return;
      const url = `https://www.youtube.com/watch_videos?video_ids=${this.playlist.videos
        .map((x) => x.id)
        .join(",")}`;

      window.open(url, "_blank", "noopener");
    },
  },
});
</script>

<style lang="scss">
.vlist-wrapper {
}
/*.playlist-video-list .video-card-item-actions {
  padding: 0 !important;
  margin: 0px !important;
}

.playlist-video-list .video-card:hover .video-card-item-actions {
  opacity: 1;
}
.playlist-video-list .video-card .video-card-item-actions {
  opacity: 0.2;
}

.playlist-video-list .video-card-item-actions button {
  padding: 1px 0 !important;
  margin: 0px !important;
  height: 22px !important;
  width: 22px !important;
  line-height: 20px;

  &:hover {
    background-color: var(--v-primary-darken1);
  }
}*/
</style>
