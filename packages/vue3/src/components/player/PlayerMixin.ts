let pid = 1;

export default defineComponent({
  props: {
    height: {
      type: [Number, String],
      default: 720,
    },
    width: {
      type: [Number, String],
      default: 1280,
    },
    mute: {
      type: Boolean,
      default: false,
    },
    // interval to refresh currentTime/mute/playbackRate
    refreshRate: {
      type: Number,
      default: 500,
    },
    // Don't initialize interval
    manualUpdate: {
      type: Boolean,
    },
  },
  emits: [
    "playbackRate",
    "currentTime",
    "mute",
    "volume",
    "ready",
    "error",
    "paused",
  ],
  data() {
    pid += 1;
    return {
      player: {},
      updateTimer: 0,
    };
  },
  beforeUnmount() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = 0;
    }
  },
  methods: {
    playerReady(player: any) {
      this.setMute(this.mute);
      this.initListeners();
      this.$emit("ready", player);
    },
    playerError(e: any) {
      console.log(`[PLAYER ERROR] - ${pid}`);
      console.error(e);
      this.$emit("error", e);
    },
    getCurrentTime() {
      /* no-op */
    },
    getPlaybackRate() {
      /* no-op */
    },
    getVolume() {
      /* no-op */
    },
    isMuted() {
      /* no-op */
    },
    setPlaying(playing: boolean) {
      /* no-op */
    },
    setMute(mute: boolean) {
      /* no-op */
    },
    initListeners() {
      if (this.manualUpdate) return;
      // Could consider using .sync two way prop, but ytPlayer makes it kind of makes it hard
      const updateCurrentTime = this.$attrs.currentTime;
      const updatePlaybackRate = this.$attrs.playbackRate;
      const updateMute = this.$attrs.mute;
      const updateVolume = this.$attrs.volume;
      // Only start the loop if at least one listener is on
      if (
        updateVolume ||
        updateCurrentTime ||
        updatePlaybackRate ||
        updateMute
      ) {
        this.updateTimer = setInterval(this.updateListeners, this.refreshRate);
      }
    },
    async updateListeners() {
      const l = this.$attrs;
      if (l.mute) this.$emit("mute", await this.isMuted());
      if (l.playbackRate)
        this.$emit("playbackRate", await this.getPlaybackRate());
      if (l.currentTime) this.$emit("currentTime", await this.getCurrentTime());
      if (l.volume) this.$emit("volume", await this.getVolume());
    },
  },
});
