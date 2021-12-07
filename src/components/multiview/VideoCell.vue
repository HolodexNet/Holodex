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
      <TwitchPlayer
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
      <YoutubePlayer
        v-else
        ref="player"
        :key="cellContent.id"
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
      <portal-target :name="`${video.id}-overlay`" style="font-size: 18px;" />
    </div>
    <cell-control
      v-if="editMode"
      @reset="uniqueId = Date.now()"
      @back="resetCell"
      @delete="deleteCell"
    />
  </div>
</template>

<script>
import { mapMutations } from "vuex";
import YoutubePlayer from "../player/YoutubePlayer.vue";
import CellMixin from "./CellMixin";
import CellControl from "./CellControl.vue";

export default {
    name: "VideoCell",
    components: {
        CellControl,
        TwitchPlayer: () => import("../player/TwitchPlayer.vue"),
        YoutubePlayer,
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

            timer: null,
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
        currentTime: {
            get() {
                if (!this.cellContent) return false;
                return this.cellContent.currentTime;
            },
            set(value) {
                if (value !== this.cellContent.currentTime) {
                    this.$store.commit("multiview/setLayoutContentWithKey", {
                        id: this.item.i,
                        key: "currentTime",
                        value,
                    });
                }
            },
        },
        video() {
            if (!this.cellContent) return null;
            return this.cellContent.video;
        },
        isFastFoward() {
            return this.playbackRate !== 1;
        },
    },
    watch: {
        cellContent(nw, old) {
            // Handles edge case where twitch player is getting destroyed without notifying
            // This parent, leaving editMode desynced. Alternative is to use the same event @currentTime to sync up
            if (nw.id !== old.id && !this.editMode) this.editMode = true;
            if (!this.isTwitchVideo) this.twPlayer = null;
            else this.ytPlayer = null;

            if (this.editMode) this.$store.commit("multiview/unfreezeLayoutItem", this.item.i);
            else this.$store.commit("multiview/freezeLayoutItem", this.item.i);
            this.setTimer();
        },
        // eslint-disable-next-line func-names
        "video.id": function () {
            this.setTimer();
        },
    },
    mounted() {
        // When mounted, the video is paused, reset edit mode to sync up
        if (!this.editMode) this.editMode = true;
        this.setTimer();
    },
    beforeDestroy() {
        this.timer && clearInterval(this.timer);
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
            if (val === !!this.muted) return;
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
        updatePausedState(paused = false) {
            if (this.editMode === paused) return;
            this.editMode = paused;
            if (this.firstPlay && !paused) {
                this.muteOthers(this.item.i);
                this.firstPlay = false;
            }
        },
        onPlayPause(paused = false) {
            if (this.video.status === "past") {
                setTimeout(() => {
                    const recheck = this.ytPlayer.getPlayerState() === 2;
                    this.updatePausedState(recheck);
                }, 200);
            } else {
                this.updatePausedState(paused);
            }
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
            // called when the Media Controller polls for it. Used to update attached listeners with the current state.
            if (!this.$refs.player) return;
            this.$refs.player.updateListeners();
        },
        async manualCheckMuted() {
            // synchronizes the muted state of the PLAYER within with the muted state of the CellContent
            if (!this.$refs.player) return;
            this.setMuted(await this.$refs.player.isMuted());
        },
        setTimer() {
            if (this.timer) clearInterval(this.timer);
            // if (this.video.status !== "past") return;
            this.timer = setInterval(async () => {
                this.currentTime = await this.$refs.player.getCurrentTime();
            }, 500);
        },
        seekTo(t) {
            this.$refs.player.seekTo(t);
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
