<template>
  <div
    :key="`uid-${uniqueId}`"
    class="cell-content"
  >
    <div
      class="mv-frame ma-auto mb-1"
      :class="{ 'elevation-4': editMode }"
    >
      <!-- Twitch Player -->
      <VueTwitchPlayer
        v-if="isTwitchVideo"
        ref="player"
        :channel="cellContent.id"
        :plays-inline="true"
        :mute="muted"
        manual-update
        @ready="onReady"
        @ended="editMode = true"
        @playing="onPlayPause(false)"
        @paused="onPlayPause(true)"
        @error="editMode = true"
        @mute="setMuted($event)"
        @volume="volume = $event"
      />
      <!-- Youtube Player -->
      <youtube
        v-else
        ref="player"
        :video-id="cellContent.id"
        :player-vars="{
          playsinline: 1,
        }"
        :mute="muted"
        manual-update
        @ready="onReady"
        @ended="editMode = true"
        @playing="onPlayPause(false)"
        @paused="onPlayPause(true)"

        @cued="editMode = true"
        @error="editMode = true"
        @playbackRate="playbackRate = $event"
        @mute="setMuted($event)"
        @volume="volume = $event"
      />
    </div>
    <cell-control
      v-if="editMode"
      :play-icon="icons.mdiPlay"
      @playpause="setPlaying(true)"
      @reset="uniqueId = Date.now()"
      @back="resetCell"
      @delete="deleteCell"
    />
  </div>
</template>

<script>
import { mapMutations } from "vuex";
import { debounce } from "lodash";
import Youtube from "../player/YoutubePlayer.vue";
import CellMixin from "./CellMixin";
import CellControl from "./CellControl.vue";

export default {
    name: "VideoCell",
    components: {
        CellControl,
        VueTwitchPlayer: () => import("../player/TwitchPlayer.vue"),
        Youtube,
    },
    mixins: [CellMixin],
    data() {
        return {
            uniqueId: Date.now(),
            ytPlayer: null,
            twPlayer: null,
            playbackRate: 1,
            volume: 50,
            firstPlay: true,
        };
    },
    computed: {
        isTwitchVideo() {
            return this.cellContent?.video?.type === "twitch";
        },
        muted: {
            get() {
                if (!this.cellContent) return false;
                return this.cellContent.muted;
            },
            set(value) {
                if (value !== this.cellContent.muted) {
                    this.$store.commit("multiview/setLayoutContentWithKey", {
                        id: this.item.i,
                        key: "muted",
                        value,
                    });
                }
            },
        },
        video: {
            get() {
                if (!this.cellContent) return null;
                return this.cellContent.video;
            },
            set(value) {
                this.$store.commit("multiview/setLayoutContentWithKey", {
                    id: this.item.i,
                    key: "video",
                    value,
                });
            },
        },
        isFastFoward() {
            return this.playbackRate !== 1;
        },
    },
    watch: {
        // eslint-disable-next-line func-names
        cellContent: debounce(function (nw, old) {
            // Handles edge case where twitch player is getting destroyed without notifying
            // This parent, leaving editMode desynced. Alternative is to use the same event @currentTime to sync up
            if (nw.id !== old.id && !this.editMode) this.editMode = true;
            if (!this.isTwitchVideo) this.twPlayer = null;
            else this.ytPlayer = null;
        }, 0, { trailing: true }),
    },
    mounted() {
        // When mounted, the video is paused, reset edit mode to sync up
        if (!this.editMode) this.editMode = true;
    },
    methods: {
        ...mapMutations("multiview", ["muteOthers"]),
        refresh() {
            this.uniqueId = Date.now();
            this.editMode = true;
        },
        setPlaying(val) {
            if (this.editMode !== val) return;
            if (this.ytPlayer) {
                !this.editMode ? this.ytPlayer.pauseVideo() : this.ytPlayer.playVideo();
            }
            if (this.twPlayer) {
                !this.editMode ? this.twPlayer.pause() : this.twPlayer.play();
            }
        },
        setMuted(val) {
            if (val === this.muted) return;
            // Action was done through media controls or youtube player controls. Check to mute all
            if (!val) this.muteOthers(this.item.i);
            this.muted = val;
        },
        setVolume(val) {
            if (this.ytPlayer) this.ytPlayer.setVolume(val);
            if (this.twPlayer) this.twPlayer.setVolume(val / 100);
            this.volume = val;
        },
        togglePlaybackRate() {
            if (!this.ytPlayer) return;
            this.ytPlayer.setPlaybackRate(this.isFastFoward ? 1 : 2);
        },
        setPlaybackRate(val) {
            if (!this.ytPlayer) return;
            this.ytPlayer.setPlaybackRate(val);
        },
        onPlayPause(paused = false) {
            if (this.editMode === paused) return;
            this.editMode = paused;
            if (this.firstPlay) { this.muteOthers(this.item.i); this.firstPlay = false; }
        },
        onReady(player) {
            // On play it should take focus to new stream
            if (player && this.isTwitchVideo) {
                this.twPlayer = player;
            } else if (player) {
                this.ytPlayer = player;
            }
        },
        manualRefresh() {
            if (!this.$refs.player) return;
            this.$refs.player.updateListeners();
        },
        manualCheckMuted() {
            this.muted = this.$refs.player.isMuted();
        },
    },
};
</script>

<style>
.mv-frame > div > iframe {
    position: absolute;
    width: 100%;
    height: 100%;
}

.mv-frame {
    position: relative;
    width: 100%;
    height: 100%;
}
</style>
