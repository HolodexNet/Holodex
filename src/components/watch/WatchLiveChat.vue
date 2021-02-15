<template>
    <v-sheet class="watch-live-chat" :class="{ 'fixed-bottom': fixedBottom, 'fixed-right': fixedRight }">
        <span class="loading-text">Loading Chat...</span>
        <div class="embedded-chat">
            <iframe :src="liveChatUrl" frameborder="0" />
        </div>
    </v-sheet>
</template>

<script>
export default {
    name: "WatchLiveChat",
    props: {
        video: {
            type: Object,
            required: false,
        },
        mugenId: {
            required: false,
        },
        fixedBottom: {
            type: Boolean,
            default: false,
        },
        fixedRight: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        liveChatUrl() {
            if (!this.video && !this.videoId) return null;
            return `https://www.youtube.com/live_chat?v=${this.mugenId ? this.mugenId : this.video.id}&embed_domain=${
                window.location.hostname
            }&dark_theme=${this.$vuetify.theme.dark ? 1 : 0}`;
        },
    },
};
</script>

<style>
.watch-live-chat {
    position: relative;
}

.watch-live-chat .loading-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

/* Desktop */
.embedded-chat {
    position: relative;
    height: 600px;
    min-height: calc((75vw - 24px) * 0.5625);
    min-height: min(calc((75vw - 24px) * 0.5625), calc(100vh - 220px));
    border: solid 1px rgba(255, 255, 255, 0.1);
}

.embedded-chat > iframe {
    position: absolute;
    width: 100%;
    height: 100%;
}

/* Fixed Bottom */
.watch-live-chat.fixed-bottom {
    position: fixed;
    bottom: 0px;
    width: 100%;
    z-index: 10;
}

.watch-live-chat.fixed-bottom .embedded-chat {
    position: relative;
    height: calc(100vh - 36px - 100vw * 0.5625);
    /* height: 100vh; */
}

/* Fixed Right */
.watch-live-chat.fixed-right {
    position: fixed;
    right: 0px;
    width: 220px;
}

.watch-live-chat.fixed-right > .embedded-chat {
    height: 100vh;
    width: 100%;
}

.watch-live-chat.fixed-right > .embedded-chat > iframe {
    transform: scale(0.75);
    transform-origin: top left;
    height: 133%;
    width: 133%;
}
</style>
