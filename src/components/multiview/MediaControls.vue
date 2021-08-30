<template>
  <v-dialog :value="value" max-width="400" @input="$emit('input', $event)">
    <v-card max-height="75vh" class="overflow-y-auto">
      <v-card-title> {{ $t("views.multiview.mediaControls") }} </v-card-title>
      <v-card-text class="d-flex flex-column justify-center align-center">
        <v-list max-width="100%" width="100%">
          <v-list-item single-line style="border-bottom: 1px gray solid">
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
              style="border-bottom: 1px gray solid"
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
                  <v-slider :value="cellState.volume" class="volume-slider" @input="cellState.setVolume($event)" />
                </v-list-item-action>
              </v-list-item-content>
            </v-list-item>
          </template>
          <v-list-item v-else class="pa-2 justify-center">
            {{ $t("views.multiview.mediaControlsEmpty") }}
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

export default {
    name: "MediaControls",
    props: {
        value: {
            type: Boolean,
        },
    },
    data() {
        return {
            showMediaControls: true,
            mdiPause,
            mdiFastForward,
            mounted: false,
            // allVolume: 0,
        };
    },
    computed: {
        allVolume() {
            const cells = this.$parent.$refs.videoCell;
            if (!this.mounted || !this.value || !cells || !cells.length) return 0;
            const vol = cells[0].volume;
            return cells.every((c) => c.volume === vol) ? vol : 0;
        },
        cells() {
            return this.$parent.$refs.videoCell.filter((c) => c.video);
        },
    },
    mounted() {
        this.mounted = true;
    },
    methods: {
        setAllVolume(val) {
            const cells = this.$parent.$refs.videoCell;
            if (!cells) return;
            cells.forEach((c) => c.setVolume(val));
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
  min-width: 32px;
  flex-basis: 32px;
}
</style>
