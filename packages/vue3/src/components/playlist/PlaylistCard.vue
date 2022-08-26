<template>
  <div
    style="font-size: 1rem !important; font-weight: 500"
    class="mb-1 ml-0 d-flex"
  >
    <v-text-field
      v-if="editNameMode"
      v-model="playlistName"
      autofocus
      single-line
      hide-details
      style="flex-basis: 80"
      class="flex-grow flex-shrink pt-0 mt-0"
      :append-icon="icons.mdiPencil"
      :rules="[(v) => v.length > 0 || 'Should not be empty']"
      @keydown.enter="editNameMode = false"
      @click:append="editNameMode = false"
    />
    <span v-else class="flex-grow flex-shrink text-h5" style="flex-basis: 100%">
      <v-btn
        v-show="isEditable"
        icon
        small
        class="float-right"
        @click="editNameMode = true"
      >
        <v-icon> {{ icons.mdiPencil }} </v-icon>
      </v-btn>
      {{ playlist.name }}
    </span>
    <v-menu bottom offset-y nudge-width="500">
      <template #activator="{ props }">
        <v-btn icon small class="float-right" v-bind="props">
          <v-icon>{{ icons.mdiDotsVertical }}</v-icon>
        </v-btn>
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
        <v-list-item disabled class="mt-1 mb-1" dense>
          <v-icon left disabled> {{ icons.mdiOpenInNew }} </v-icon
          ><span>{{ $t("component.playlist.menu.export-playlist") }}</span>
        </v-list-item>
        <v-list-item dense class="ml-5" @click.stop="instructionsDialog = true">
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
  <span class="text-right text-caption grey--text mt-n2 pa-0 d-block">
    {{ playlist.videos?.length }} / {{ maxPlaylistCount }}
  </span>
  <video-card-virtual-list :videos="playlist.videos || []" />

  <!--* INSTRUCTIONS DIALOG FOR YOUTUBE --->
  <v-dialog
    v-model="instructionsDialog"
    :width="display.isMobile ? '90%' : '60vw'"
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
    horizontal: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup() {
    const display = useDisplay();
    return { display };
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
    move(id, direction) {
      // @todo
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
.playlist-video-list .video-card-item-actions {
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
}
</style>
