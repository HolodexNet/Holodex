<template>
    <v-sheet
        class="watch-live-chat"
        :class="{
            'fixed-bottom': fixedBottom,
            'fixed-right': fixedRight,
            'show-tl-overlay': !isMugen && shouldShowLiveTL,
            fluid: fluid,
        }"
    >
        <span class="loading-text">{{ $t("views.watch.chat.loading") }}</span>
        <WatchLiveTranslations
            :video="video"
            v-if="!isMugen && shouldConnectLiveTL"
            v-show="shouldShowLiveTL"
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
            <div class="chat-overlay-btn d-flex align-center" v-if="controlTL">
                <v-btn icon lg @click="toggleTL" :color="shouldShowLiveTL ? 'primary' : '#999999'">
                    <div class="notification-sticker" v-if="hasNewTranslations"></div>
                    <v-icon>{{ mdiTranslate }}</v-icon>
                </v-btn>
            </div>
        </div>
    </v-sheet>
</template>

<script>
import { mdiTranslate } from "@mdi/js";
import WatchLiveTranslations from "./WatchLiveTranslations.vue";

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
        showTL: {
            type: Boolean,
            default: false,
        },
        showTLFirstTime: {
            type: Boolean,
            default: false,
        },
        controlTL: {
            type: Boolean,
            default: false,
        },
        isMugen: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            mdiTranslate,

            stickTop: false,
            // TODO: redesign live chat in multiview so that this jank can be removed
            // duplicating the props here because TabbedLiveChat does not provide them.
            tl: {
                show: !this.$store.state.isMobile,
                showFirstTime: !this.$store.state.isMobile,
                new: 0,
            },
        };
    },
    computed: {
        liveChatUrl() {
            if (!this.video && !this.videoId) return null;
            return `https://www.youtube.com/live_chat?v=${this.mugenId ? this.mugenId : this.video.id}&embed_domain=${
                window.location.hostname
            }&dark_theme=${this.$vuetify.theme.dark ? 1 : 0}`;
        },
        shouldConnectLiveTL() {
            return this.controlTL ? this.tl.showFirstTime : this.showTLFirstTime;
        },
        shouldShowLiveTL() {
            return this.controlTL ? this.tl.show : this.showTL;
        },
        hasNewTranslations() {
            return (this.controlTL ? this.tl.new : this.newTL) > 0;
        },
    },
    methods: {
        handleVideoUpdate(update) {
            // bubble event to Watch view
            this.$emit("videoUpdate", update);
        },
        handleHistoryLength(length) {
            if (this.controlTL) {
                if (!this.tl.show) this.tl.new += 1;
            } else {
                // in this case, bubble the event
                this.$emit("historyLength", length);
            }
        },
        toggleTL() {
            if (this.controlTL) {
                console.log("toggle TL from live chat overlay");
                // showTLFirstTime will initiate connection
                // showTL toggle will show/hide without terminating connection
                if (!this.tl.showFirstTime) {
                    this.tl.showFirstTime = true;
                    this.tl.show = true;
                    return;
                }
                this.tl.show = !this.tl.show;
                this.tl.new = 0;
            }
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
    padding-bottom: calc(constant(safe-area-inset-bottom) / 1.75);
    /* iOS 11.2 and later */
    height: calc((100% - 36px - 100vw * 0.5625) - env(safe-area-inset-top, 0px));
    padding-bottom: calc(env(safe-area-inset-bottom) / 1.75);
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
    bottom: 4px;
    left: 64px;
    height: 48px;
    position: absolute;
    z-index: 10;
}

div.notification-sticker {
    position: absolute;
    top: 1px;
    right: 2px;
    border-radius: 4px;
    width: 8px;
    height: 8px;
    background-color: rgb(230, 33, 23);
}
</style>
