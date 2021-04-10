<template>
    <v-card class="text-body-2 tl-overlay" tile flat>
        <v-overlay absolute :value="showOverlay || (socket && socket.disconnected)" opacity="0.8">
            <div v-if="isLoading">{{ $t("views.watch.chat.loading") }}</div>
            <div class="pa-3" v-else>{{ overlayMessage }}</div>
            <v-btn v-if="!isLoading" @click="tlChatConnect()">{{ $t("views.watch.chat.retryBtn") }}</v-btn>
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
                        <v-switch
                            v-model="liveTlStickBottom"
                            :label="$t('views.watch.chat.StickBottomSettingLabel')"
                            :messages="$t('views.watch.chat.StickBottomSettingsDesc')"
                        ></v-switch>
                        <v-select
                            v-model="liveTlLang"
                            :items="TL_LANGS"
                            :hint="$t('views.settings.tlLanguageSelection')"
                            persistent-hint
                        />
                    </v-card-text>
                </v-card>
            </v-dialog>
        </v-card-subtitle>
        <v-divider />
        <v-card-text class="text-body-2 tl-body thin-scroll-bar d-flex flex-column-reverse pa-1 pa-lg-3">
            <template v-for="(item, index) in tlHistory">
                <div :key="index">
                    <div
                        v-if="index === 0 || index === tlHistory.length - 1 || item.name !== tlHistory[index - 1].name"
                        class="text-caption"
                        :color="item.isOwner ? 'primary' : ''"
                    >
                        <v-divider class="my-1" />
                        {{ item.name }}:
                    </div>
                    <div>
                        <span class="text-caption mr-1" v-if="item.timestamp">
                            {{ utcToTimestamp(item.timestamp) }}
                        </span>
                        <span class="text--primary">{{ item.message }}</span>
                    </div>
                </div>
            </template>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
// eslint-disable-next-line import/no-unresolved
import { Manager } from "socket.io-client";
import api, { API_BASE_URL } from "@/utils/backend-api";
import { formatDuration, dayjs } from "@/utils/time";
import { TL_LANGS } from "@/utils/consts";
import { debounce } from "@/utils/functions";

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
            manager: null,
            socket: null,
            dialog: false,
        };
    },
    mounted() {
        this.tlChatConnect();
    },
    beforeDestroy() {
        this.tlChatDisconnect();
    },
    watch: {
        liveTlLang() {
            // this.tlChatReconnect();
            this.tlChatDisconnect();
            this.tlChatConnect();
        },
    },
    computed: {
        lang() {
            return this.$store.state.settings.lang;
        },
        liveTlStickBottom: {
            get() {
                return this.$store.state.settings.liveTLStickBottom;
            },
            set(val) {
                this.$store.commit("settings/setLiveTlStickBottom", val);
            },
        },
        liveTlLang: {
            get() {
                return this.$store.state.settings.liveTlLang;
            },
            set(val) {
                this.$store.commit("settings/setLiveTlLang", val);
            },
        },
        connected() {
            return this.socket && !this.socket.disconnected;
        },
    },
    methods: {
        // eslint-disable-next-line func-names
        tlChatConnect: debounce(function () {
            if (!this.manager) {
                this.manager = new Manager(
                    /* process.env.NODE_ENV === "development" ? "http://localhost:2434" : */ API_BASE_URL,
                    {
                        query: { id: this.video.id },
                        reconnectionAttempts: 10,
                        transports: ["websocket"],
                        upgrade: false,
                        path: /* process.env.NODE_ENV !== "development" && */ "/api/socket.io/",
                        secure: true,
                    },
                );
                this.manager.on("reconnect_attempt", (attempt) => {
                    this.overlayMessage = `${this.$t("views.watch.chat.status.reconnecting")} ${attempt}/10`;
                });
                this.manager.on("reconnect_failed", () => {
                    this.overlayMessage = this.$t("views.watch.chat.status.reconnectFailed");
                });
            }

            if (
                this.video.status !== "live" &&
                !dayjs().isAfter(
                    dayjs(this.video.start_scheduled)
                        // .subtract(8, "hours")
                        .subtract(15, "minutes"),
                )
            ) {
                this.overlayMessage = this.$t("views.watch.chat.status.notLive");
                this.isLoading = false;
                this.showOverlay = true;
                return;
            }
            this.isLoading = true;

            this.socket = this.manager.socket("/");
            this.socket.connect();

            api.chatHistory(this.video.id, this.liveTlLang).then(({ data }) => {
                this.tlHistory = data.reverse();
            });
            this.socket.emit("subscribe", { video_id: this.video.id, lang: this.liveTlLang });

            this.socket.on("subscribeError", (err) => {
                this.overlayMessage = err.message;
                this.isLoading = false;
                this.showOverlay = true;
                this.tlChatDisconnect();
            });
            this.socket.on("subscribeSuccess", () => {
                this.showOverlay = false;
                this.isLoading = false;
            });

            this.socket.on("connect_error", (err) => {
                console.log(err);
                this.overlayMessage = err;
                this.isLoading = false;
                this.showOverlay = true;
            });

            this.socket.on(`${this.video.id}/${this.liveTlLang}`, (msg) => {
                // if no type, process as regular message
                if (!msg.type) {
                    this.tlHistory.unshift(msg);
                    this.$emit("historyLength", this.tlHistory.length);
                    return;
                }
                switch (msg.type) {
                    case this.MESSAGE_TYPES.UPDATE:
                        this.$emit("videoUpdate", msg);
                        break;
                    case this.MESSAGE_TYPES.END:
                        this.overlayMessage = msg.message;
                        // this.showOverlay = true;
                        this.tlChatDisconnect();
                        break;
                    case this.MESSAGE_TYPES.ERROR:
                        this.overlayMessage = "An unexpected error occured";
                        // this.showOverlay = true;
                        this.tlChatDisconnect();
                        break;
                    default:
                        break;
                }
                // console.log(msg);
            });
        }, 300),
        tlChatDisconnect() {
            const self = this as any;
            if (self.socket) {
                self.socket.disconnect(true);
                self.socket = null;
                self.manager = null;
            }
        },
        // tlChatReconnect() {
        //     this.isLoading = true;
        //     this.tlChatConnect();
        // },
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
}

.tl-overlay {
    border: 1px solid rgba(65, 65, 65, 0.2) !important;
    box-sizing: border-box;
}
</style>
