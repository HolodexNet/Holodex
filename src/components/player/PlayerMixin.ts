let pid = 1;

export default {
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
        refreshRate: {
            type: Number,
            default: 500,
        },
    },
    data() {
        pid += 1;
        return {
            player: {},
            updateTimer: null,
        };
    },
    beforeDestroy() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    },
    methods: {
        playerReady(player) {
            this.setMute(this.mute);
            this.initListeners();
            this.$emit("ready", player);
        },
        playerError(e) {
            console.log(`[PLAYER ERROR] - ${this.elementId}`);
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
        initListeners() {
            // Could consider using .sync two way prop, but ytPlayer makes it kind of makes it hard
            const updateCurrentTime = this.$listeners.currentTime;
            const updatePlaybackRate = this.$listeners.playbackRate;
            const updateMute = this.$listeners.mute;
            const updateVolume = this.$listeners.volume;
            // Only start the loop if at least one listener is on
            if (updateVolume || updateCurrentTime || updatePlaybackRate || updateMute) {
                this.updateTimer = setInterval(async () => {
                    if (updateMute) this.$emit("mute", await this.isMuted());
                    if (updatePlaybackRate) this.$emit("playbackRate", await this.getPlaybackRate());
                    if (updateCurrentTime) this.$emit("currentTime", await this.getCurrentTime());
                    if (updateVolume) this.$emit("volume", await this.getVolume());
                }, this.refreshRate);
            }
        },
    },
};
