import player from "youtube-player";

const UNSTARTED = -1;
const ENDED = 0;
const PLAYING = 1;
const PAUSED = 2;
const BUFFERING = 3;
const CUED = 5;

let pid = 1;

export default {
    name: "Youtube",
    props: {
        videoId: String,
        playerVars: {
            type: Object,
            default: () => ({}),
        },
        height: {
            type: [Number, String],
            default: 720,
        },
        width: {
            type: [Number, String],
            default: 1280,
        },
        nocookie: {
            type: Boolean,
            default: false,
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
            events: {
                [UNSTARTED]: "unstarted",
                [PLAYING]: "playing",
                [PAUSED]: "paused",
                [ENDED]: "ended",
                [BUFFERING]: "buffering",
                [CUED]: "cued",
            },
            elementId: `youtube-player-${pid}`,
            updateTimer: null,
        };
    },
    computed: {
    },
    methods: {
        playerReady(e) {
            this.setMute(this.mute);
            this.initListeners();
            this.$emit("ready", e.target);
        },
        playerStateChange(e) {
            if (e.data !== null && e.data !== UNSTARTED) {
                this.$emit(this.events[e.data], e.target);
            }
        },
        playerError(e) {
            this.$emit("error", e.target);
        },
        updatePlayer(videoId) {
            if (!videoId) {
                this.player.stopVideo();
                return;
            }

            const params = { videoId: videoId };

            if (typeof this.playerVars.start === "number") {
                params.startSeconds = this.playerVars.start;
            }

            if (typeof this.playerVars.end === "number") {
                params.endSeconds = this.playerVars.end;
            }

            console.log("LoadVideoByID in Vue-Youtube", params);

            if (this.playerVars.autoplay === 1) {
                this.player.loadVideoById(params);
                return;
            }

            this.player.cueVideoById(params);
        },
        setMute(value) {
            if (value && this.player) {
                this.player.mute();
            } else {
                this.player.unMute();
            }
        },
        initListeners() {
            // Could consider using .sync two way prop, but ytPlayer makes it kind of makes it hard
            const updateCurrentTime = this.$listeners.currentTime;
            const updatePlaybackRate = this.$listeners.playbackRate;
            const updateMute = this.$listeners.mute;
            const updateVolume = this.$listeners.volume;
            // Only start the loop if at least one listener is on
            if(updateVolume || updateCurrentTime || updatePlaybackRate || updateMute)
                this.updateTimer = setInterval(async () => {
                    if (updateMute) this.$emit("mute", await this.player.isMuted());
                    if (updatePlaybackRate) this.$emit("playbackRate", await this.player.getPlaybackRate());
                    if (updateCurrentTime) this.$emit("currentTime", await this.player.getCurrentTime());
                    if (updateVolume) this.$emit("volume", await this.player.getVolume());
                }, this.refreshRate);
        }
    },
    watch: {
        videoId: "updatePlayer",
        mute: "setMute",
    },
    beforeDestroy() {
        if (this.player !== null && this.player.destroy) {
            this.player.destroy();
            delete this.player;
        }
        if(this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    },
    async mounted() {
        window.YTConfig = {
            host: "https://www.youtube.com/iframe_api",
        };

        const host = this.nocookie ? "https://www.youtube-nocookie.com" : "https://www.youtube.com";

        this.player = player(this.elementId, {
            host,
            width: this.width,
            height: this.height,
            videoId: this.videoId,
            playerVars: this.playerVars,
        });

        this.player.on("ready", this.playerReady);
        this.player.on("stateChange", this.playerStateChange);
        this.player.on("error", this.playerError);
        // const iframeWindow = (await this.player.getIframe()).contentWindoww
        // window.addEventListener("message", function(event) {
        //     if (event.source === iframeWindow) {
        //         console.log(event);
        //         const data = JSON.parse(event.data);
        //         console.log(data);
        //     }
        // });
    },
    render(h) {
        return h("div", [h("div", { attrs: { id: this.elementId } })]);
    },
};
