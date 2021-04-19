<template>
    <v-card class="text-body-2 tl-overlay" tile flat style="width: 100%">
        <v-overlay absolute :value="showOverlay || $socket.disconnected" opacity="0.8">
            <div v-if="isLoading">{{ $t("views.watch.chat.loading") }}</div>
            <div class="pa-3" v-else>{{ overlayMessage }}</div>
            <v-btn v-if="!isLoading" @click="tlJoin()">{{ $t("views.watch.chat.retryBtn") }}</v-btn>
        </v-overlay>
        <v-card-subtitle class="py-1 d-flex justify-space-between">
            <div>
                TLs [{{ liveTlLang }}]
                <span :class="connected ? 'green--text' : 'red--text'">
                    {{
                        connected
                            ? $t("views.watch.chat.status.connectedToChat")
                            : $t("views.watch.chat.status.disconnectedToChat")
                    }}
                </span>
            </div>
            <v-dialog v-model="dialog" width="500">
                <template v-slot:activator="{ on, attrs }">
                    <v-btn icon x-small v-bind="attrs" v-on="on">
                        <v-icon>
                            {{ icons.mdiCog }}
                        </v-icon>
                    </v-btn>
                </template>

                <v-card>
                    <v-card-title> {{ $t("views.watch.chat.TLSettingsTitle") }} </v-card-title>

                    <v-card-text>
                        <v-select
                            v-model="liveTlLang"
                            :items="TL_LANGS"
                            :hint="$t('views.settings.tlLanguageSelection')"
                            persistent-hint
                        />
                        <v-switch
                            v-model="liveTlShowVerified"
                            :label="$t('views.watch.chat.showVerifiedMessages')"
                            hide-details
                        ></v-switch>
                        <v-switch
                            v-model="liveTlShowModerator"
                            :label="$t('views.watch.chat.showModeratorMessages')"
                        ></v-switch>
                        <v-divider class="pb-6" />
                        <v-combobox
                            v-model="liveTlFontSize"
                            :items="[10, 11, 12, 14, 18, 24, 30]"
                            :label="$t('views.watch.chat.tlFontSize')"
                            outlined
                        >
                            <template v-slot:append-outer> px </template>
                        </v-combobox>
                        <v-combobox
                            v-model="liveTlWindowSize"
                            :items="[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]"
                            :label="$t('views.watch.chat.tlWindowSize')"
                            outlined
                            hide-details
                        >
                            <template v-slot:append-outer> % </template>
                        </v-combobox>
                        <v-switch
                            v-model="liveTlStickBottom"
                            :label="$t('views.watch.chat.StickBottomSettingLabel')"
                            :messages="$t('views.watch.chat.StickBottomSettingsDesc')"
                        ></v-switch>
                    </v-card-text>
                </v-card>
            </v-dialog>
        </v-card-subtitle>
        <v-divider />
        <v-card-text
            class="tl-body thin-scroll-bar d-flex flex-column pa-1 pa-lg-3"
            ref="tlBody"
            :style="{
                'font-size': liveTlFontSize + 'px',
            }"
        >
            <transition-group name="fade">
                <template v-for="(item, index) in tlHistory">
                    <div :key="index">
                        <div
                            v-if="
                                index === 0 || index === tlHistory.length - 1 || item.name !== tlHistory[index - 1].name
                            "
                            class="tl-caption"
                            :class="{
                                'primary--text': item.isOwner,
                                'secondary--text': item.isVerified || item.isModerator,
                            }"
                        >
                            <v-divider class="my-1" />
                            {{ item.name }}:
                        </div>
                        <div>
                            <span class="tl-caption mr-1" v-if="item.timestamp">
                                {{ utcToTimestamp(item.timestamp) }}
                            </span>
                            <span class="text--primary">{{ item.message }}</span>
                        </div>
                    </div>
                </template>
            </transition-group>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import api, { API_BASE_URL } from "@/utils/backend-api";
import { formatDuration, dayjs } from "@/utils/time";
import { TL_LANGS } from "@/utils/consts";
import { debounce, syncState } from "@/utils/functions";
import VueSocketIOExt from "vue-socket.io-extended";
import { Manager } from "socket.io-client";
import Vue from "vue";

const manager = new Manager(/* process.env.NODE_ENV === "development" ? "http://localhost:2434" : */ API_BASE_URL, {
    reconnectionAttempts: 10,
    transports: ["websocket"],
    upgrade: false,
    path: /* process.env.NODE_ENV !== "development" && */ "/api/socket.io/",
    secure: true,
    autoConnect: false,
});

Vue.use(VueSocketIOExt, manager.socket("/"));

export default {
    name: "WatchLiveTranslations",
    props: {
        video: {
            type: Object,
            required: false,
        },
    },
    data() {
        return {
            tlHistory: [],
            MESSAGE_TYPES: Object.freeze({
                END: "end",
                ERROR: "error",
                INFO: "info",
                MESSAGE: "message",
                UPDATE: "update",
            }),
            TL_LANGS,
            overlayMessage: this.$t("views.watch.chat.loading"),
            showOverlay: false,
            isLoading: true,
            dialog: false,
            success: false,
        };
    },
    sockets: {
        reconnect_attempt(attempt) {
            const vm = this as any;
            vm.overlayMessage = `${this.$t("views.watch.chat.status.reconnecting")} ${attempt}/10`;
        },
        reconnect_failed() {
            const vm = this as any;
            vm.overlayMessage = this.$t("views.watch.chat.status.reconnectFailed");
        },
        connect_error() {
            const vm = this as any;
            vm.overlayMessage = this.$t("views.watch.chat.status.reconnectFailed");
        },
        // Sucessfully connected to live stream chat
        subscribeSuccess(obj) {
            const vm = this as any;
            // make sure to not listen to duplicate events of the same id (i.e. same chat room open in mv)
            if (obj.id === vm.video.id && !vm.success) {
                vm.success = true;
                vm.registerListener();
                vm.$store.commit("incrementActiveSockets");
            }
        },
        // Failed to join the chat room
        subscribeError(obj) {
            const vm = this as any;
            if (obj.id === vm.video.id) {
                vm.overlayMessage = obj.message;
                vm.isLoading = false;
                vm.showOverlay = true;
            }
        },
    },
    created() {},
    mounted() {
        this.tlJoin();
    },
    beforeDestroy() {
        this.tlLeave();
    },
    watch: {
        liveTlLang() {
            this.tlLeave();
            this.tlJoin();
        },
    },
    computed: {
        lang() {
            return this.$store.state.settings.lang;
        },
        ...syncState("settings", [
            "liveTlStickBottom",
            "liveTlLang",
            "liveTlFontSize",
            "liveTlShowVerified",
            "liveTlShowModerator",
            "liveTlWindowSize",
        ]),
        connected() {
            return this.$socket.connected;
        },
    },
    methods: {
        // eslint-disable-next-line func-names
        scrollBottom: debounce(function (force = false) {
            if (!this.$refs.tlBody) return;
            if (
                force ||
                this.$refs.tlBody.scrollHeight - this.$refs.tlBody.clientHeight - this.$refs.tlBody.scrollTop < 100
            )
                this.$refs.tlBody.scrollTo({ top: this.$refs.tlBody.scrollHeight, behavior: "smooth" });
        }, 100),
        registerListener() {
            const vm = this as any;
            this.$socket.client.on(`${vm.video.id}/${vm.liveTlLang}`, (msg) => {
                // if no type, process as regular message
                if (!msg.type) {
                    // ignore moderator and verified messages if disabled
                    if ((msg.isModerator && !this.liveTlShowModerator) || (msg.isVerified && !this.liveTlShowVerified))
                        return;

                    // Append title to author name
                    if (msg.isModerator) msg.name = `[Mod] ${msg.name}`;
                    if (msg.isVerified) msg.name = `[Verified] ${msg.name}`;
                    if (msg.isOwner) msg.name = `[Owner] ${msg.name}`;

                    vm.tlHistory.push(msg);
                    vm.$emit("historyLength", vm.tlHistory.length);
                    this.scrollBottom();
                    return;
                }
                switch (msg.type) {
                    case vm.MESSAGE_TYPES.UPDATE:
                        vm.$emit("videoUpdate", msg);
                        break;
                    case vm.MESSAGE_TYPES.END:
                        vm.overlayMessage = msg.message;
                        // this.showOverlay = true;
                        vm.tlLeave();
                        break;
                    case vm.MESSAGE_TYPES.ERROR:
                        vm.overlayMessage = "An unexpected error occured";
                        // this.showOverlay = true;
                        vm.tlLeave();
                        break;
                    default:
                        break;
                }
            });
        },
        // eslint-disable-next-line func-names
        tlJoin() {
            // Disallow users from joining a chat room that doesn't exist yet
            // Backend will create a chatroom when it's 15 minutes before a stream
            if (
                this.video.status !== "live" &&
                !dayjs().isAfter(dayjs(this.video.start_scheduled).subtract(15, "minutes"))
            ) {
                this.overlayMessage = this.$t("views.watch.chat.status.notLive");
                this.isLoading = false;
                this.showOverlay = true;
                return;
            }
            this.isLoading = true;

            // Start the unified socket if it isn't already
            if (this.$socket.disconnected) {
                this.$socket.client.connect();
            }

            // Grab chat history
            api.chatHistory(this.video.id, this.liveTlLang).then(({ data }) => {
                this.tlHistory = data;
                this.scrollBottom(true);
            });

            // Try to join chat room with specified language
            this.$socket.client.emit("subscribe", { video_id: this.video.id, lang: this.liveTlLang });
        },
        tlLeave() {
            const vm = this as any;
            // only disconnect and derement socket if it succeeded
            if (vm.success) {
                vm.$store.commit("decrementActiveSockets");
                vm.$socket.client.emit("unsubscribe", { video_id: vm.video.id, lang: vm.liveTlLang });
                vm.$socket.client.off(`${vm.video.id}/${vm.liveTlLang}`);
                vm.$store.dispatch("checkActiveSockets");
                // Reset for immediate reconnects
                vm.success = false;
            }
        },
        utcToTimestamp(utc) {
            return formatDuration(dayjs.utc(utc).subtract(Number(dayjs(this.video.start_actual))));
        },
    },
};
</script>

<style>
.v-overlay__content {
    text-align: center;
}

.tl-body {
    overflow-y: auto;
    overscroll-behavior: contain;
    height: calc(100% - 32px);
    line-height: 1.25em;
    letter-spacing: 0.0178571429em !important;
}

.tl-overlay {
    border: 1px solid rgba(65, 65, 65, 0.2) !important;
    box-sizing: border-box;
}

.tl-body .tl-caption {
    letter-spacing: 0.0333333333em !important;
    font-size: 0.85em;
}

.fade-enter-active,
.fade-leave-active {
    transition: all 0.4s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
}
</style>
