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
        <span class="loading-text" v-if="showLiveChat">{{ $t("views.watch.chat.loading") }}</span>
        <WatchLiveTranslations
            :video="video"
            v-if="!isMugen && shouldConnectLiveTL"
            v-show="shouldShowLiveTL"
            :class="{
                'chat-overlay': fixedBottom || fixedRight,
                'chat-overlay-stickbottom': $store.state.settings.liveTlStickBottom,
                'tl-full-height': !showLiveChat,
            }"
            :style="{
                height:
                    showLiveChat && $store.state.settings.liveTlWindowSize > 0
                        ? $store.state.settings.liveTlWindowSize + '%'
                        : '',
            }"
            @videoUpdate="handleVideoUpdate"
            @historyLength="handleHistoryLength"
        >
            <template v-slot:button> </template>
        </WatchLiveTranslations>
        <div
            class="embedded-chat"
            v-if="showLiveChat"
            :style="{
                height:
                    $store.state.settings.liveTlWindowSize > 0 && shouldShowLiveTL && !fixedBottom && !fixedRight
                        ? 100 - $store.state.settings.liveTlWindowSize + '%'
                        : '',
            }"
        >
            <iframe :src="liveChatUrl" frameborder="0" />
        </div>
        <v-alert
            border="top"
            color="error"
            type="error"
            elevation="4"
            dismissible
            class="alert-overlay"
            transition="scroll-y-transition"
            :value="true"
            v-if="shouldTestTPCookie && tpCookieTested"
        >
            <div @click.stop="dialogOpen = true">
                {{ $t("component.thirdpartycookie.alertText") }}
            </div>
        </v-alert>
        <v-dialog v-if="dialogOpen" v-model="dialogOpen" max-width="86vw" width="700px">
            <v-card>
                <v-card-title class="headline"> {{ $t("component.thirdpartycookie.dialogTitle") }} </v-card-title>
                <v-card-text>
                    <p v-html="$t('component.thirdpartycookie.explanation')" />
                    <p>
                        English:
                        <a
                            target="_blank"
                            href="https://akohubteam.medium.com/how-to-enable-third-party-cookies-on-your-browsers-f9a8143b8cc5"
                        >
                            How to enable Third-Party Cookies on different browsers
                        </a>
                        <br />Chinese:
                        <a
                            target="_blank"
                            href="https://support.mozilla.org/zh-CN/kb/Firefox%20%E7%9A%84%E8%B7%9F%E8%B8%AA%E4%BF%9D%E6%8A%A4%E5%92%8C%E7%AC%AC%E4%B8%89%E6%96%B9%20Cookie?redirectslug=%E7%A6%81%E7%94%A8%E7%AC%AC%E4%B8%89%E6%96%B9+Cookie+%E9%98%BB%E6%AD%A2%E6%9F%90%E4%BA%9B%E7%B1%BB%E5%9E%8B%E7%9A%84%E5%B9%BF%E5%91%8A%E5%95%86%E8%B7%9F%E8%B8%AA&redirectlocale=zh-CN"
                        >
                            Firefox 的跟踪保护和第三方 Cookie
                        </a>
                        <br />Japanese:
                        <a
                            target="_blank"
                            href="https://help.talend.com/r/shQsvBn3CEOBmBTtOP7vcg/qDx2O9S7Pz~W5_x~IO1Sgw"
                        >
                            ブラウザーでのサードパーティCookieの許可
                        </a>
                    </p>
                    <v-img
                        width="400px"
                        src="https://blog.mozilla.org/wp-content/uploads/2019/08/ETP-Blocking-Cookies-300x264.png"
                    ></v-img>
                </v-card-text>
                <v-card-actions>
                    <v-btn outlined color="warning" @click="dialogOpen = false">
                        {{ $t("views.app.close_btn") }}
                    </v-btn>
                    <v-btn
                        outlined
                        color="error"
                        @click="
                            $store.commit('setTPCookieAlertDismissed', true);
                            dialogOpen = false;
                        "
                    >
                        {{ $t("component.thirdpartycookie.neverShowAgain") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <div style="display: none" v-if="shouldTestTPCookie && !tpCookieTested">
            <!-- only if should test -->
            <iframe src="https://ricecakess.github.io/Holodex/3pcookie2.html" />
        </div>
    </v-sheet>
</template>

<script lang="ts">
import { mapState } from "vuex";
import WatchLiveTranslations from "./WatchLiveTranslations.vue";

// Contains Live Chat iframe and Chat TLs, can show either one at both at the same time
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
        showLiveChat: {
            type: Boolean,
            default: true,
        },
        showTL: {
            type: Boolean,
            default: false,
        },
        showTLFirstTime: {
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
            tpCookieTested: false,
            dialogOpen: false,
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
            return this.showTLFirstTime;
        },
        shouldShowLiveTL() {
            return this.showTL;
        },
        // hasNewTranslations() {
        //     return (this.controlTL ? this.tl.new : this.newTL) > 0;
        // },
        ...mapState(["TPCookieEnabled", "TPCookieAlertDismissed"]),
        shouldTestTPCookie() {
            return (
                (!this.TPCookieEnabled || this.TPCookieEnabled < Date.now() - 60 * 1000) /* (24*7*60*60*1000) */ &&
                !this.TPCookieAlertDismissed
            );
        },
    },
    created() {
        if (this.shouldTestTPCookie) {
            const self = this;
            const receiveMessage = function (evt) {
                if (evt.data === "MM:3PCunsupported") {
                    // document.getElementById("result").innerHTML = "not supported";
                    window.removeEventListener("message", receiveMessage);
                    self.$store.commit("setTPCookieEnabled", false);
                    self.tpCookieTested = true;
                } else if (evt.data === "MM:3PCsupported") {
                    // document.getElementById("result").innerHTML = "supported";
                    window.removeEventListener("message", receiveMessage);
                    self.$store.commit("setTPCookieEnabled", Date.now());
                    self.tpCookieTested = true;
                }
            };
            window.addEventListener("message", receiveMessage, false);
        }
    },

    methods: {
        handleVideoUpdate(update) {
            // bubble event to Watch view
            this.$emit("videoUpdate", update);
        },
        handleHistoryLength(length) {
            // in this case, bubble the event
            this.$emit("historyLength", length);
        },
    },
};
</script>

<style lang="scss">
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
    height: calc(100% - 250px);
}

.watch-live-chat.show-tl-overlay .tl-overlay {
    height: 250px;

    &.tl-full-height {
        position: absolute;
        height: 100%;
        max-height: 100%;
        padding-bottom: calc(env(safe-area-inset-bottom) / 1.75);
    }
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
}

.watch-live-chat.fixed-right > .tl-overlay,
.watch-live-chat.fixed-bottom > .tl-overlay {
    height: 45%;
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

.chat-overlay {
    width: 100%;
    position: absolute;
    z-index: 5;
    top: 0;
}

.chat-overlay-stickbottom {
    bottom: 0;
    top: initial;
}

.alert-overlay {
    position: absolute;
    z-index: 6;
    top: 40px;
    left: 10px;
    right: 10px;
    cursor: pointer;
}
.alert-overlay:hover {
    top: 37px;
}
</style>
