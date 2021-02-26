<template>
    <v-sheet class="watch-live-chat" :class="{ 'fixed-bottom': fixedBottom, 'fixed-right': fixedRight }">
        <span class="loading-text">Loading Chat...</span>
        <div class="embedded-chat">
            <iframe :src="liveChatUrl" frameborder="0" />
            <!-- {{JSON.stringify(tlHistory)}} -->
            <WatchLiveTranslations :video="video" v-if="showTL" />
            <a class="show-overlay-btn d-flex align-center text-body-2" @click="showTL = !showTL">
                {{ showTL ? "Hide" : "Show" }} TLs
            </a>
        </div>
    </v-sheet>
</template>

<script>
import WatchLiveTranslations from "./WatchLiveTranslations";

export default {
    name: "WatchLiveChat",
    components: {
        WatchLiveTranslations,
    },
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
    data() {
        return {
            showTL: false,
        };
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
    height: calc(100% - 36px - 100vw * 0.5625);
}

.watch-live-chat.fixed-bottom > .embedded-chat {
    position: relative;
    height: 100%;
    /* height: calc(100vh - 36px - 100vw * 0.5625); */
    /* height: 100vh; */
}

/* Fixed Right */
.watch-live-chat.fixed-right {
    position: fixed;
    right: 0px;
    width: 220px;
    height: 100%;
}

.watch-live-chat.fixed-right > .embedded-chat {
    width: 100%;
    height: 100%;
}

.watch-live-chat.fixed-right > .embedded-chat > iframe {
    transform: scale(0.75);
    transform-origin: top left;
    height: 133%;
    width: 133%;
}

/* .watch-live-chat.fixed-right > .embedded-chat .chat-overlay {
    transform: scale(0.75);
    transform-origin: top left;
    width: 133%;
    height: calc(35vh * 1.33);
} */

.chat-overlay {
    width: 100%;
    /* height: 35%; */
    position: absolute;
    top: 0;
}
.show-overlay-btn {
    right: 30%;
    height: 38px;
    position: absolute;
    z-index: 10;
}
</style>
