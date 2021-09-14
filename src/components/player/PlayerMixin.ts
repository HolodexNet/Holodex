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
            if (this.manualUpdate) return;
            // Could consider using .sync two way prop, but ytPlayer makes it kind of makes it hard
            const updateCurrentTime = this.$listeners.currentTime;
            const updatePlaybackRate = this.$listeners.playbackRate;
            const updateMute = this.$listeners.mute;
            const updateVolume = this.$listeners.volume;
            // Only start the loop if at least one listener is on
            if (updateVolume || updateCurrentTime || updatePlaybackRate || updateMute) {
                this.updateTimer = setInterval(this.updateListeners, this.refreshRate);
            }
        },
        async updateListeners() {
            const l = this.$listeners;
            if (l.mute) this.$emit("mute", await this.isMuted());
            if (l.playbackRate) this.$emit("playbackRate", await this.getPlaybackRate());
            if (l.currentTime) this.$emit("currentTime", await this.getCurrentTime());
            if (l.volume) this.$emit("volume", await this.getVolume());
        },
    },
};
