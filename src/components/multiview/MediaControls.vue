<template>
  <v-dialog :value="value" max-width="400" @input="$emit('input', $event)">
    <v-card max-height="75vh" class="overflow-y-auto">
      <v-card-title> {{ $t("views.multiview.mediaControls") }} </v-card-title>
      <v-card-text class="d-flex flex-column justify-center align-center">
        <v-list width="100%" max-width="100%" class="media-controls-list">
          <v-list-item single-line>
            <v-list-item-content>
              <v-list-item-action class="flex-row justify-center ma-0 mt-1 flex-wrap">
                <v-btn icon @click="allCellAction('play')">
                  <v-icon color="secondary lighten-1">
                    {{ icons.mdiPlay }}
                  </v-icon>
                </v-btn>
                <v-btn icon title="Sync" @click="allCellAction('sync')">
                  <v-icon color="secondary lighten-1">
                    {{ mdiFastForward }}
                  </v-icon>
                </v-btn>
                <v-btn icon @click="allCellAction('pause')">
                  <v-icon color="secondary lighten-1">
                    {{ mdiPause }}
                  </v-icon>
                </v-btn>
                <v-btn icon @click="allCellAction('refresh')">
                  <v-icon color="secondary lighten-1">
                    {{ icons.mdiRefresh }}
                  </v-icon>
                </v-btn>
                <v-btn icon @click="allCellAction('unmute')">
                  <v-icon color="secondary lighten-1">
                    {{ icons.mdiVolumeHigh }}
                  </v-icon>
                </v-btn>
                <v-btn icon @click="allCellAction('mute')">
                  <v-icon color="secondary lighten-1">
                    {{ icons.mdiVolumeMute }}
                  </v-icon>
                </v-btn>
                <v-spacer />
                <v-slider
                  class="volume-slider"
                  :value="allVolume"
                  :color="allVolume === 0 ? 'gray' : 'secondary'"
                  @input="setAllVolume"
                />
              </v-list-item-action>
            </v-list-item-content>
          </v-list-item>
          <template v-if="value && $parent.$refs.videoCell && $parent.$refs.videoCell.length">
            <v-list-item
              v-for="(cellState, index) in cells"
              :key="index"
              two-line
            >
              <v-list-item-avatar v-if="cellState.video.channel.photo" class="ma-0 mr-1">
                <v-img :src="cellState.video.channel.photo" />
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="primary--text">
                  {{ cellState.video.title || cellState.video.channel.name }}
                </v-list-item-title>
                <v-list-item-action class="flex-row justify-start ma-0 mt-1 flex-wrap">
                  <v-btn icon @click="cellState.setPlaying(cellState.editMode)">
                    <v-icon color="grey lighten-1">
                      {{ cellState.editMode ? icons.mdiPlay : mdiPause }}
                    </v-icon>
                  </v-btn>
                  <v-btn
                    v-if="!cellState.isTwitchVideo"
                    icon
                    @click="cellState.togglePlaybackRate()"
                  >
                    <v-icon :color="cellState.isFastFoward ? 'primary' :'grey' ">
                      {{ mdiFastForward }}
                    </v-icon>
                  </v-btn>
                  <v-btn icon @click="cellState.refresh()">
                    <v-icon color="grey lighten-1">
                      {{ icons.mdiRefresh }}
                    </v-icon>
                  </v-btn>
                  <v-btn icon @click="cellState.deleteCell()">
                    <v-icon color="grey lighten-1">
                      {{ icons.mdiDelete }}
                    </v-icon>
                  </v-btn>
                  <v-btn icon @click="cellState.setMuted(!cellState.muted)">
                    <v-icon color="grey lighten-1">
                      {{ cellState.muted ? icons.mdiVolumeMute : icons.mdiVolumeHigh }}
                    </v-icon>
                  </v-btn>
                  <v-spacer />
                  <v-slider :value="cellState.volume" class="volume-slider" @input="cellState.setVolume($event)" />
                </v-list-item-action>
              </v-list-item-content>
            </v-list-item>
          </template>
          <v-list-item v-else class="pa-2 justify-center">
            {{ $t("views.multiview.mediaControlsEmpty") }}
          </v-list-item>
          <v-list-item single-line style="border: none">
            <v-switch
              v-model="muteOthers"
              :label="$t('views.multiview.muteOthers')"
              :hint="$t('views.multiview.muteOthersDetail')"
              persistent-hint
            />
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import {
    mdiPause, mdiFastForward,
} from "@mdi/js";
import { mapState, mapGetters } from "vuex";
import { syncState } from "@/utils/functions";

export default {
    name: "MediaControls",
    props: {
        value: {
            type: Boolean,
        },
    },
    data() {
        return {
            mdiPause,
            mdiFastForward,
            mounted: false,
            timer: null,
        };
    },
    computed: {
        ...syncState("multiview", ["muteOthers"]),
        ...mapGetters("multiview", ["activeVideos"]),
        ...mapState("multiview", ["layoutContent"]),
        allVolume() {
            const cells = this.$parent.$refs.videoCell;
            if (!this.mounted || !this.value || !cells || !cells.length) return 0;
            // Check if all volume is the same, else return 0
            const vol = cells[0].volume;
            return cells.every((c) => c.volume === vol) ? vol : 0;
        },
        cells() {
            if (!this.mounted || !this.$parent.$refs.videoCell) return [];
            // Bind the cell ref check to 'value', does not need to be used.
            // Reason: refs is not observable, therefore changes are not propogated up
            // eslint-disable-next-line no-unused-vars
            const notUsed = this.value || this.activeVideos;
            return this.$parent.$refs.videoCell.filter((c) => c.video);
        },
    },
    watch: {
        // Refresh player status when mediaControls is shown
        value(val) {
            if (val && this.mounted) {
                this.cells.forEach((c) => c.manualRefresh());
            }
        },
    },
    mounted() {
        this.mounted = true;
        // Nothing else needs to be updated in an interval, except for checking for mute changes
        // Premature optimization.... probably
        this.timer = setInterval(() => {
            if (this.cells) this.cells.forEach((c) => c.manualCheckMuted());
        }, 1000);
    },
    beforeDestroy() {
        if (this.timer) {
            clearInterval(this.time);
        }
    },
    methods: {
        setAllVolume(val) {
            this.cells.forEach((c) => c.setVolume(val));
        },
        allCellAction(fnName) {
            if (!this.$parent.$refs.videoCell) return;
            const cells = this.$parent.$refs.videoCell;
            cells.forEach((c) => {
                switch (fnName) {
                    case "mute": c.setMuted(true); break;
                    case "play": c.setPlaying(true); break;
                    case "pause": c.setPlaying(false); break;
                    case "unmute": c.setMuted(false); break;
                    case "refresh": c.refresh(); break;
                    // Streams that are live will be able to sync up, while the rest videos get toggled
                    case "sync": c.video.status === "live"
                        ? c.setPlaybackRate(2)
                        : c.togglePlaybackRate(); break;
                    default: break;
                }
            });
        },
    },
};
</script>

<style>
.volume-slider {
  /* min-width: 80px; */
  flex-basis: 80px;
  box-sizing: border-box;
}

.media-controls-list > .v-list-item {
  border-bottom: 1px solid gray;
}
</style>
