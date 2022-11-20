<template>
  <v-sheet
    tile
    class="d-flex justify-space-between flex-wrap-reverse flex-sm-nowrap px-lg-4"
  >
    <v-btn v-if="!noBackButton" icon lg @click="goBack()">
      <v-icon>{{ mdiArrowLeft }}</v-icon>
    </v-btn>
    <div class="watch-btn-group ml-auto d-flex">
      <slot name="buttons" />
      <v-tooltip bottom>
        <template #activator="{ props }">
          <v-btn
            icon
            lg
            :color="hasSaved ? 'primary' : ''"
            v-bind="props"
            @click="toggleSaved"
          >
            <v-icon>{{ hasSaved ? icons.mdiCheck : icons.mdiPlusBox }}</v-icon>
          </v-btn>
        </template>
        <span v-if="!hasSaved">{{ $t("views.watch.saveToPlaylist") }}</span>
        <span v-else>{{ $t("views.watch.removeFromPlaylist") }}</span>
      </v-tooltip>
      <v-menu bottom nudge-top="20px">
        <template #activator="{ props }">
          <v-btn icon lg :ripple="false" v-bind="props">
            <v-icon>
              {{ icons.mdiDotsVertical }}
            </v-icon>
          </v-btn>
        </template>
        <video-card-menu :video="video" />
      </v-menu>
    </div>
  </v-sheet>
</template>

<script lang="ts">
import { mdiOpenInNew, mdiArrowLeft } from "@mdi/js";
import { useTogglePlaylistVideo } from "@/stores/playlist";
import { PropType } from "vue";

export default defineComponent({
  name: "WatchToolbar",
  props: {
    video: {
      type: Object as PropType<Video>,
      required: true,
    },
    noBackButton: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const playlistVideo = useTogglePlaylistVideo(props.video);
    return {
      toggleSaved: playlistVideo.toggleSaved,
      hasSaved: playlistVideo.hasSaved,
    };
  },
  data() {
    return {
      darkMode: true,
      mdiOpenInNew,
      mdiArrowLeft,
    };
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
  },
});
</script>

<style>
.watch-btn-group > .v-btn {
  margin-right: 5px;
}
</style>
