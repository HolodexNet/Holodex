import { mapState, mapGetters } from "vuex";

export default {
    name: "Cell",
    props: {
        item: {
            type: Object,
            required: true,
        },
        cellWidth: {
            type: Number,
            default: 0,
        },
    },
    data() {
        return {};
    },
    computed: {
        ...mapGetters("multiview", ["activeVideos"]),
        ...mapState("multiview", ["layoutContent"]),
        editMode: {
            get() {
                return this.layoutContent[this.item.i].editMode;
            },
            set(value) {
                this.$store.commit("multiview/setLayoutContentWithKey", { id: this.item.i, key: "editMode", value });
            },
        },
        cellContent() {
            return this.layoutContent[this.item.i];
        },
        isChat() {
            return this.cellContent?.type === "chat";
        },
        isVideo() {
            return this.cellContent?.type === "video";
        },
        isTwitchVideo() {
            return this.cellContent?.video?.type === "twitch";
        },
        // muted: {
        //     get() {
        //         if (!this.cellContent) return false;
        //         return this.cellContent.muted;
        //     },
        //     set(value) {
        //         this.$store.commit("multiview/setLayoutContentWithKey", { id: this.item.i, key: "muted", value });
        //     },
        // },
        // video: {
        //     get() {
        //         if (!this.cellContent) return null;
        //         return this.cellContent.video;
        //     },
        //     set(value) {
        //         this.$store.commit("multiview/setLayoutContentWithKey", { id: this.item.i, key: "video", value });
        //     },
        // },
        // isFastFoward() {
        //     return this.playbackRate !== 1;
        // },
    },
    watch: {
        // cellWidth() {
        //     this.checkScale();
        // },
        cellContent(nw, old) {
            // if cell becomes null or content changes to a different type, set paused mode back to true
            // if (!nw || (old && nw && nw.type !== old.type)) this.pausedMode = true;
            // if (nw && nw.type === "chat") this.pausedMode = false;
            // this.setLayoutFreeze();

            // if (
            //     nw
            //     && nw.type === "video"
            //     && this.iOS()
            //     && this.$store.state.multiview.layout.find(
            //         (item) => item.i !== this.item.i
            //             && this.layoutContent[item.i]
            //             && this.layoutContent[item.i].type === "video", // &&
            //     )
            // ) {
            //     this.muted = true;
            // }
        },
    },
    mounted() {
        // initialize chat cell in non paused mode
        // if (this.cellContent?.type === "chat") this.pausedMode = false;
        // this.setLayoutFreeze();
        // this.checkScale();
    },
    methods: {
        // trySync() {
        //     if (!this.isVideo) return;
        //     // Toggle playback rate, and attempt to track state
        //     if (this.ytPlayer.getPlaybackRate() !== 1) {
        //         this.ytPlayer.setPlaybackRate(1);
        //     } else {
        //         this.ytPlayer.setPlaybackRate(2);
        //     }
        //     if (this.video.status === "past") { this.playbackRate = this.ytPlayer.getPlaybackRate(); }
        // },
        refresh() {
            this.uniqueId = Date.now();
            this.editMode = true;
        },
        // setPlaying(val) {
        //     if (this.pausedMode !== val) return;
        //     if (this.ytPlayer) {
        //         !this.pausedMode ? this.ytPlayer.pauseVideo() : this.ytPlayer.playVideo();
        //     }
        //     if (this.twPlayer) {
        //         !this.pausedMode ? this.twPlayer.pause() : this.twPlayer.play();
        //     }
        // },
        // setMuted(val) {
        //     this.muted = val;
        // },
        // getVideoThumbnails,
        setItemAsChat(item) {
            this.$store.commit("multiview/setLayoutContentById", {
                id: item.i,
                content: {
                    type: "chat",
                },
            });
        },
        deleteCell() {
            this.$emit("delete", this.item.i);
        },
        // vidPlaying(evt) {
        //     this.pausedMode = evt.data === 2;
        //     if (evt.data === 2 && this.iOS() && this.ytPlayer) {
        //         this.ytPlayer.mute();
        //         this.muted = true;
        //     }
        // },
        // vidReady(evt) {
        //     if (evt && this.isTwitchVideo) {
        //         this.twPlayer = evt;
        //     } else if (evt) {
        //         this.ytPlayer = evt;
        //         if (this.muted) {
        //             this.ytPlayer.mute();
        //         } else {
        //             this.ytPlayer.unMute();
        //         }
        //     }
        // },
        resetCell() {
            this.$store.commit("multiview/deleteLayoutContent", this.item.i);
        },
        // // Scale chat based on width
        // checkScale() {
        //     if (this.cellContent?.type === "chat") {
        //         // width breakpoints where 150 < width < 200 => scale = 0.6
        //         const widths = [150, 200, 250, 300, 350];
        //         const scale = [0.5, 0.6, 0.75, 0.85, 1];
        //         const idx = widths.findIndex((w) => this.cellWidth < w);
        //         this.chatScale = idx >= 0 ? scale[idx] : 1;
        //     }
        // },
        // toggleChatHandle() {
        //     this.toggleChat = !this.toggleChat;
        //     if (!this.toggleChat && !this.toggleTL) this.toggleTL = true;
        // },
        // toggleTLHandle() {
        //     this.toggleTL = !this.toggleTL;
        //     if (!this.toggleChat && !this.toggleTL) this.toggleChat = true;
        // },
        iOS() {
            return (
                ["iPad Simulator", "iPhone Simulator", "iPod Simulator", "iPad", "iPhone", "iPod"].includes(
                    navigator.platform,
                )
                // iPad on iOS 13 detection
                || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
            );
        },
    },
};
