const player = require("youtube-player");

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
            default: 360,
        },
        width: {
            type: [Number, String],
            default: 640,
        },
        resize: {
            type: Boolean,
            default: false,
        },
        resizeDelay: {
            type: Number,
            default: 100,
        },
        nocookie: {
            type: Boolean,
            default: false,
        },
        fitParent: {
            type: Boolean,
            default: true,
        },
        mute: {
            type: Boolean,
            default: false,
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
            resizeTimeout: null,
            elementId: `youtube-player-${pid}`,
        };
    },
    computed: {
        aspectRatio() {
            return this.width / this.height;
        },
    },
    methods: {
        playerReady(e) {
            this.setMute(this.mute);
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

            if (this.playerVars.autoplay === 1) {
                this.player.loadVideoById(params);
                return;
            }

            this.player.cueVideoById(params);
        },
        resizeProportionally() {
            this.player.getIframe().then((iframe) => {
                const width = this.fitParent ? iframe.parentElement.offsetWidth : iframe.offsetWidth;
                const height = width / this.aspectRatio;
                this.player.setSize(width, height);
            });
        },
        onResize() {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(this.resizeProportionally, this.resizeDelay);
        },
        setMute(value) {
            if (value && this.player) {
                this.player.mute();
            } else {
                this.player.unMute();
            }
        },
    },
    watch: {
        videoId: "updatePlayer",
        mute: "setMute",
        resize(val) {
            if (val) {
                // window.addEventListener('resize', this.onResize)
                // this.resizeProportionally()
            } else {
                // window.removeEventListener('resize', this.onResize)
                // this.player.setSize(this.width, this.height)
            }
        },
        // width (val) {
        //   this.player.setSize(val, this.height)
        // },
        // height (val) {
        //   this.player.setSize(this.width, val)
        // }
    },
    beforeDestroy() {
        if (this.player !== null && this.player.destroy) {
            this.player.destroy();
            delete this.player;
        }

        if (this.resize) {
            //   window.removeEventListener('resize', this.onResize)
        }
    },
    mounted() {
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

        if (this.resize) {
            //   window.addEventListener('resize', this.onResize)
        }

        if (this.fitParent) {
            //   this.resizeProportionally()
        }
    },
    render(h) {
        return h("div", [h("div", { attrs: { id: this.elementId } })]);
    },
};
