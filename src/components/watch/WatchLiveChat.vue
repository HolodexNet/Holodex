<template>
    <v-sheet
        class="watch-live-chat"
        :class="{
            'fixed-bottom': fixedBottom,
            'fixed-right': fixedRight,
            'show-tl-overlay': showTL,
            fluid: fluid,
        }"
    >
        <span class="loading-text">{{ $t("views.watch.chat.loading") }}</span>
        <WatchLiveTranslations
            :video="video"
            v-if="showTLFirstTime"
            v-show="showTL"
            :class="{
                'chat-overlay': fixedBottom || fixedRight,
                'chat-overlay-stickbottom': $store.state.settings.liveTlStickBottom,
            }"
            @videoUpdate="handleVideoUpdate"
            @historyLength="handleHistoryLength"
        >
            <template v-slot:button> </template>
        </WatchLiveTranslations>
        <div class="embedded-chat">
            <iframe :src="liveChatUrl" frameborder="0" />
            <div class="chat-overlay-btn d-flex align-center">
                <a class="text-body-2" @click="toggleTL">
                    {{ showTL ? $t("views.watch.chat.hideTLBtn") : $t("views.watch.chat.showTLBtn") }}
                    {{ newTL > 0 ? `(${newTL}*)` : "" }}
                </a>
            </div>
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
        fluid: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            showTL: false,
            showTLFirstTime: false,
            newTL: 0,
            stickTop: false,
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
    methods: {
        toggleTL() {
            // showTLFirstTime will initiate connection
            // showTL toggle will show/hide without terminating connection
            if (!this.showTLFirstTime) {
                this.showTLFirstTime = true;
                this.showTL = true;
                return;
            }
            this.showTL = !this.showTL;
            this.newTL = 0;
        },
        handleVideoUpdate(update) {
            // bubble event to Watch view
            this.$emit("videoUpdate", update);
        },
        handleHistoryLength() {
            if (!this.showTL) this.newTL += 1;
        },
    },
};
</script>

<style>
.watch-live-chat {
    position: relative;
}

.watch-live-chat.mobile-live-chat {
    margin-right: 0px; /*calc(env(safe-area-inset-right) - 15px)*/
    margin-right: calc(env(safe-area-inset-right) / 2);
    padding-bottom: env(safe-area-inset-bottom, 0px);
}

/* center pre loading text */
.watch-live-chat .loading-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

/* iframe size is same as container */
.embedded-chat > iframe {
    position: absolute;
    width: 100%;
    height: 100%;
}

/* Desktop */
.watch-live-chat {
    height: 600px;
    min-height: calc((75vw - 24px) * 0.5625);
    min-height: min(calc((75vw - 24px) * 0.5625), calc(100vh - 120px));
    border: solid 1px rgba(255, 255, 255, 0.1);
}

.watch-live-chat.fluid {
    width: 100%;
    height: 100%;
    min-height: 0px !important;
}

.embedded-chat {
    position: relative;
    width: 100%;
    height: 100%;
}

/* tl box static size of 200 px */
.watch-live-chat.show-tl-overlay .embedded-chat {
    /* body: 200px, header: 38px */
    height: calc(100% - 200px - 38px);
}

.watch-live-chat.show-tl-overlay .tl-overlay .tl-body {
    height: 200px;
}

/* Fixed Bottom */
.watch-live-chat.fixed-bottom {
    position: fixed;
    bottom: 0px;
    width: 100%;
    z-index: 10;
    /* pre-iOS 11.2 */
    height: calc((100% - 36px - 100vw * 0.5625) - constant(safe-area-inset-top));
    /* iOS 11.2 and later */
    height: calc((100% - 36px - 100vw * 0.5625) - env(safe-area-inset-top, 0px));
}

.watch-live-chat.fixed-bottom > .embedded-chat {
    position: relative;
    height: 100%;
    /* height: calc(100vh - 36px - 100vw * 0.5625); */
    /* height: 100vh; */
}

.watch-live-chat.fixed-bottom > .tl-overlay .tl-body {
    height: 20vh;
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

.watch-live-chat.fixed-right > .tl-overlay .tl-body {
    height: 35vh;
}

/* reposition Show TL button when chat is scaled */
.fixed-right .embedded-chat .chat-overlay-btn {
    height: 36px;
    /* right: 36px; */
}

.chat-overlay {
    width: 100%;
    /* height: 35%; */
    position: absolute;
    z-index: 5;
    top: 0;
}

.chat-overlay-stickbottom {
    bottom: 0;
    top: initial;
}
.chat-overlay-btn {
    /* right: 48px; */
    right: 48px;
    height: 48px;
    position: absolute;
    z-index: 10;
}
</style>
