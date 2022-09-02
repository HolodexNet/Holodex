<template>
  <div class="flex flex-col h-full">
    <div>
      <div v-if="editNameMode" class="flex flex-row w-full">
        <input
          v-model="playlistName"
          type="text"
          placeholder="Type here"
          class="flex-auto w-full input"
          required
          aria-required
          autofocus
          @keydown.enter="editNameMode = false"
        />
        <div class="flex-initial btn" @click="editNameMode = false">OK</div>
      </div>
      <span v-else class="flex-grow flex-shrink" style="flex-basis: 100%">
        <div class="inline-block py-1 text-lg font-bold">
          {{ playlist.name }}
        </div>
        <div
          v-show="isEditable"
          icon
          small
          class="float-right btn-square btn-ghost btn btn-sm"
          @click="editNameMode = true"
        >
          <v-icon> {{ icons.mdiPencil }} </v-icon>
        </div>
      </span>
      <v-menu location="bottom" nudge-width="500">
        <template #activator="{ props }">
          <div
            class="float-right btn btn-square btn-ghost btn-sm"
            v-bind="props"
          >
            <v-icon>{{ icons.mdiDotsVertical }}</v-icon>
          </div>
        </template>
        <v-list nav>
          <v-list-item v-if="isEditable" @click="$emit('new-playlist')">
            <v-icon left color="success">
              {{ icons.mdiPlusBox }}
            </v-icon>
            {{ $t("component.playlist.menu.new-playlist") }}
          </v-list-item>
          <!-- feed back a green ripple on click... theoretically -->
          <v-list-item v-if="isEditable" @click="editNameMode = true">
            <v-icon left>
              {{ icons.mdiPencil }}
            </v-icon>
            {{ $t("component.playlist.menu.rename-playlist") }}
          </v-list-item>
          <!-- $store.dispatch('playlist/setActivePlaylistByID', playlist.id) -->
          <!-- <v-list-item :ripple="{ class: 'green--text' }" :disabled="!playlist.id"
                        ><v-icon left>{{ icons.mdiClipboardPlusOutline }}</v-icon>
                        {{ playlist.id ? "Copy sharable Playlist link" : "Save the playlist to enable link-sharing." }}
                    </v-list-item> -->
          <v-divider />
          <!-- Exporting options -->
          <v-list-item class="mt-1 mb-1" dense>
            <v-icon left> {{ icons.mdiOpenInNew }} </v-icon
            ><span>{{ $t("component.playlist.menu.export-playlist") }}</span>
          </v-list-item>
          <v-list-item
            dense
            class="ml-5"
            @click.stop="instructionsDialog = true"
          >
            <v-icon left>
              {{ icons.mdiYoutube }}
            </v-icon>
            {{ $t("views.library.exportYtPlaylist") }}
          </v-list-item>
          <v-list-item dense class="mb-2 ml-5" @click.stop="downloadAsCSV">
            <v-icon left>
              {{ mdiFileDelimited }}
            </v-icon>
            {{ $t("views.library.exportCsv") }}
          </v-list-item>
          <!-- End Exporting options -->
          <v-divider class="mb-2" />
          <v-list-item v-if="isEditable" @click="deletePlaylist">
            <v-icon left color="error">
              {{ icons.mdiDelete }}
            </v-icon>
            {{
              playlist.id
                ? $t("component.playlist.menu.delete-playlist")
                : $t("component.playlist.menu.clear-playlist")
            }}
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
    <span class="block text-sm text-right text-opacity-50 text-secondary-300">
      {{ playlist.videos?.length }} / {{ maxPlaylistCount }}
    </span>

    <div class="flex-auto flex-shrink overflow-auto">
      <video-card-virtual-list :videos="playlist.videos || []">
        <template #default="{ video }">
          <div
            class="self-center w-5 mr-1 text-sm btn-group btn-group-vertical"
          >
            <!-- <button class="p-0 btn btn-ghost btn-xs">
              <i class="i-bx:chevrons-up"></i>
            </button> -->
            <button
              class="p-0 btn btn-ghost btn-xs"
              @click.stop.prevent="move(video.id, 'up')"
            >
              <div class="i-bx:chevron-up"></div>
            </button>
            <button
              class="p-0 btn btn-ghost btn-xs"
              @click.stop.prevent="del(video.id)"
            >
              <div class="i-bx:trash"></div>
            </button>
            <button
              class="p-0 btn btn-ghost btn-xs"
              @click.stop.prevent="move(video.id, 'down')"
            >
              <div class="i-bx:chevron-down"></div>
            </button>
            <!-- <button class="p-0 btn btn-ghost btn-xs">
              <div class="i-bx:chevrons-down"></div>
            </button> -->
          </div>
        </template>
      </video-card-virtual-list>
    </div>
  </div>
  <!-- Need login. -->
  <v-snackbar v-model="loginWarning" :timeout="5000" color="warning">
    {{ $t("component.playlist.save-error-not-logged-in") }}

    <template #action="{ attrs }">
      <v-btn
        color="red darken-2"
        text
        v-bind="attrs"
        @click="
          $router.push('/login');
          loginWarning = false;
        "
      >
        {{ $t("component.mainNav.login") }}
      </v-btn>
    </template>
  </v-snackbar>

  <!--* INSTRUCTIONS DIALOG FOR YOUTUBE --->
  <v-dialog
    v-model="instructionsDialog"
    :width="display.mobile ? '90%' : '60vw'"
  >
    <v-card>
      <v-card-title>{{ $t("views.library.exportYTHeading") }}</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="">
            <p v-html="$t('views.library.exportYTExplanation')" />
            <br />

            <br />
            <p v-html="$t('views.library.exportYTInstructions')" />
            <v-btn class="mx-2 mt-2" color="green" @click="exportToYT">
              {{
                $t("views.library.createYtPlaylistButton", [
                  (playlist.videos || []).length,
                ])
              }}
            </v-btn>
            <v-btn class="mx-2 mt-2" @click="instructionsDialog = false">
              {{ $t("views.library.deleteConfirmationCancel") }}
            </v-btn>
          </v-col>
          <v-col cols="12" md="auto">
            <img src="/img/playlist-instruction.jpg" />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { EditablePlaylist, usePlaylistPatcher } from "@/services/playlist";
import { MAX_PLAYLIST_LENGTH } from "@/utils/consts";
import type { Playlist } from "@/utils/types";
import { mdiFileDelimited } from "@mdi/js";
import { json2csvAsync } from "json-2-csv";
import type { PropType } from "vue";
import { useDisplay } from "vuetify";

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
      //   mdiContentSave,
      mdiFileDelimited,
      //   mdiChevronDoubleUp,
      //   mdiChevronDoubleDown,
      editNameMode: false,
      instructionsDialog: false,
      loginWarning: false,
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
