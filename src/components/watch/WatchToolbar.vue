<template>
  <v-sheet tile class="d-flex justify-space-between flex-wrap-reverse flex-sm-nowrap px-lg-4">
    <div class="watch-btn-group ml-auto d-flex">
      <slot name="buttons" />
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn
            icon
            lg
            :color="hasSaved ? 'primary' : ''"
            v-bind="attrs"
            @click="toggleSaved"
            v-on="on"
          >
            <v-icon>{{ hasSaved ? icons.mdiCheck : icons.mdiPlusBox }}</v-icon>
          </v-btn>
        </template>
        <span v-if="!hasSaved">{{ $t("views.watch.saveToPlaylist") }}</span>
        <span v-else>{{ $t("views.watch.removeFromPlaylist") }}</span>
      </v-tooltip>
      <v-menu bottom nudge-top="20px">
        <template #activator="{ on }">
          <v-btn
            icon
            lg
            :ripple="false"
            v-on="on"
          >
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
import VideoCardMenu from "@/components/common/VideoCardMenu.vue";

export default {
    name: "WatchToolbar",
    components: {
        VideoCardMenu,
    },
    props: {
        video: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            darkMode: true,
            mdiOpenInNew,
            mdiArrowLeft,
        };
    },
    computed: {
        hasSaved() {
            return this.$store.getters["playlist/contains"](this.video.id);
        },
    },
    methods: {
        toggleSaved() {
            this.hasSaved
                ? this.$store.commit("playlist/removeVideoByID", this.video.id)
                : this.$store.commit("playlist/addVideo", this.video);
        },
    },
};
</script>

<style>
.watch-btn-group > .v-btn {
    margin-right: 5px;
}
</style>
