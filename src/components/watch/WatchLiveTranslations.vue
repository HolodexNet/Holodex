<template>
    <v-card class="text-body-2 tl-overlay" tile flat>
        <v-overlay absolute :value="showOverlay || (socket && socket.disconnected)" opacity="0.8">
            <div v-if="isLoading">{{ $t("views.watch.chat.loading") }}</div>
            <div class="pa-3" v-else>{{ overlayMessage }}</div>
            <v-btn v-if="!isLoading" @click="tlChatReconnect()">{{ $t("views.watch.chat.retryBtn") }}</v-btn>
        </v-overlay>
        <v-card-subtitle class="py-2 d-flex justify-space-between">
            TLs [{{ lang }}]
            <v-dialog v-model="dialog">
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
                            v-model="liveTLStickBottom"
                            :label="$t('views.watch.chat.StickBottomSettingLabel')"
                            :messages="$t('views.watch.chat.StickBottomSettingsDesc')"
                        ></v-switch>
                    </v-card-text>
                </v-card>
            </v-dialog>
        </v-card-subtitle>
        <v-divider />
        <v-card-text class="text-body-2 tl-body d-flex flex-column-reverse pa-1 pa-lg-3">
            <template v-for="(item, index) in tlHistory">
                <div :key="index">
                    <span class="text-caption mr-1" v-if="item.timestamp">{{ utcToTimestamp(item.timestamp) }}</span>
                    <span class="text--primary">{{ item.message }}</span>
                </div>
                <div
                    :key="index + '-name'"
                    v-if="index === 0 || index === tlHistory.length - 1 || item.name !== tlHistory[index - 1].name"
                    class="text-caption"
                >
                    <v-divider class="my-1" />
                    {{ item.name }}:
                </div>
            </template>
            <div>
                <div class="text-caption">Holodex:</div>
                <div>
                    <span class="text--primary">{{ $t("views.watch.chat.status.connectedToChat") }}</span>
                </div>
            </div>
        </v-card-text>
    </v-card>
</template>

<script>
// eslint-disable-next-line import/no-unresolved
import { Manager } from "socket.io-client";
import api, { API_BASE_URL } from "@/utils/backend-api";
import { formatDuration, dayjs } from "@/utils/time";

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
            overlayMessage: this.$t("views.watch.chat.loading"),
            showOverlay: false,
            isLoading: true,
            manager: null,
            socket: null,
        };
    },
    mounted() {
        this.tlChatConnect();
    },
    beforeDestroy() {
        this.tlChatDisconnect();
    },
    computed: {
        lang() {
            return this.$store.state.settings.lang;
        },
        liveTLStickBottom: {
            get() {
                return this.$store.state.settings.liveTLStickBottom;
            },
            set(val) {
                this.$store.commit("settings/setliveTLStickBottom", val);
            },
        },
    },
    methods: {
        tlChatConnect() {
            if (!this.manager) {
                this.manager = new Manager(API_BASE_URL, {
                    query: { id: this.video.id },
                    reconnectionAttempts: 10,
                    path: process.env.NODE_ENV === "development" ? "/socket.io/" : "/api/socket.io/",
                    secure: true,
                });
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

            this.socket = this.manager.socket("/");
            this.socket.connect();

            api.chatHistory(this.video.id, this.lang).then(({ data }) => {
                this.tlHistory = data.reverse();
            });

            this.socket.on("connect", () => {
                this.showOverlay = false;
                this.isLoading = false;
            });

            this.socket.on("connect_error", (err) => {
                console.log(err);
                this.overlayMessage = err;
                this.isLoading = false;
                this.showOverlay = true;
            });

            this.socket.on(`${this.video.id}/${this.lang}`, (msg) => {
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
                console.log(msg);
            });
        },
        tlChatDisconnect() {
            if (this.socket) this.socket.close();
        },
        tlChatReconnect() {
            this.isLoading = true;
            this.tlChatConnect();
        },
        utcToTimestamp(utc) {
            return formatDuration(dayjs.utc(utc).subtract(dayjs(this.video.start_actual)));
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
    height: 20vh;
}

.tl-overlay {
    border: 1px solid rgba(65, 65, 65, 0.2) !important;
    box-sizing: border-box;
}
</style>
