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
                    <v-card-title>
                        <template v-if="showBlockedList">
                            <v-btn icon @click="showBlockedList = false">
                                <v-icon>{{ icons.mdiArrowLeft }}</v-icon>
                            </v-btn>
                            {{ $t("views.channels.tabs.Blocked") }}
                        </template>
                        <template v-else>
                            {{ $t("views.watch.chat.TLSettingsTitle") }}
                        </template>
                    </v-card-title>

                    <v-card-text>
                        <template v-if="!showBlockedList">
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
                            <v-btn @click="showBlockedList = true"> Edit Blocked List </v-btn>
                            <v-divider class="my-6" />
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
                        </template>
                        <template v-else>
                            <v-list style="max-height: 300px; overflow: auto">
                                <v-list-item v-for="name in blockedNames.values()" :key="name">
                                    <v-list-item-content class="text-body-1">
                                        {{ name }}
                                    </v-list-item-content>
                                    <v-list-item-action>
                                        <v-btn @click="toggleBlockName(name)"> Unblock </v-btn>
                                    </v-list-item-action>
                                </v-list-item>
                            </v-list>
                        </template>
                    </v-card-text>
                </v-card>
            </v-dialog>
        </v-card-subtitle>
        <v-divider />
        <v-card-text
            class="tl-body thin-scroll-bar pa-1 pa-lg-3"
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
                            <span style="cursor: pointer" @click="selectedChannel = item.name">
                                <v-icon x-small>{{ icons.mdiCog }}</v-icon>
                                {{ `${item.prefix} ${item.name}` }}:
                            </span>
                        </div>
                        <div>
                            <span class="tl-caption mr-1" v-if="item.timestamp">
                                {{ utcToTimestamp(item.timestamp) }}
                            </span>
                            <span class="text--primary" v-html="item.message"></span>
                        </div>
                    </div>
                </template>
            </transition-group>
        </v-card-text>

        <v-dialog v-model="showBlockChannelDialog" width="500">
            <v-card>
                <v-card-title>{{ selectedChannel }}</v-card-title>
                <v-card-text>
                    <v-btn @click="toggleBlockName(selectedChannel)">
                        {{ !blockedNames.has(selectedChannel) ? "Block Channel" : "Unblock" }}
                    </v-btn>
                </v-card-text>
            </v-card>
        </v-dialog>
    </v-card>
</template>

<script lang="ts">
import api, { API_BASE_URL } from "@/utils/backend-api";
import { formatDuration, dayjs } from "@/utils/time";
import { TL_LANGS } from "@/utils/consts";
import { syncState } from "@/utils/functions";
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
            selectedChannel: "",
            showBlockedList: false,
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
                console.log("Subbed to", vm.liveTlLang, obj.id);
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
        // Test string
        // setTimeout(() => {
        //     const msg = {
        //         name: "test 1",
        //         message: "But it’s no Pokemon, it’s just a very hyped Tako. :_MMT:https://yt3.ggpht.com/vjsrafxnve6TZhRGbmoVEGpn8VWUAYoT_uin2tBO6R4hoFfAakNTE9V9TD8fq3cAp0ZO4jM03pI=w48-h48-c-k-nd It seems to be very hyped for tomorrow’s fashINA show… almost too hyped that it has barely sleep :_MMT:https://yt3.ggpht.com/vjsrafxnve6TZhRGbmoVEGpn8VWUAYoT_uin2tBO6R4hoFfAakNTE9V9TD8fq3cAp0ZO4jM03pI=w48-h48-c-k-nd ",
        //         timestamp: Date.now()
        //     };
        //     this.tlHistory.push(this.parseMessage(msg));
        // }, 1000)
    },
    beforeDestroy() {
        this.tlLeave();
    },
    watch: {
        liveTlLang(nw, old) {
            this.switchLanguage(nw, old);
        },
        dialog(nw) {
            // unshow blocked list when exiting dialog
            if (!nw) {
                this.showBlockedList = false;
            }
        },
        connected(nw) {
            if (nw) {
                this.isLoading = false;
            }
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
        blockedNames() {
            return this.$store.getters["settings/liveTlBlockedNames"];
        },
        connected() {
            return this.$socket.connected;
        },
        showBlockChannelDialog: {
            get() {
                return this.selectedChannel;
            },
            set(val) {
                if (!val) this.selectedChannel = "";
            },
        },
    },
    methods: {
        toggleBlockName(name) {
            this.$store.commit("settings/toggleLiveTlBlocked", name);
        },
        registerListener() {
            this.$socket.client.on(`${this.video.id}/${this.liveTlLang}`, this.handleMessage);
        },
        unregisterListener() {
            this.$socket.client.off(`${this.video.id}/${this.liveTlLang}`, this.handleMessage);
        },
        handleMessage(msg) {
            // if no type, process as regular message
            if (!msg.type) {
                // ignore blocked channels, moderator and verified messages if disabled
                if (this.blockedNames.has(msg.name)) return;

                if (
                    msg.isTL ||
                    msg.isVtuber ||
                    msg.isOwner ||
                    (msg.isModerator && this.liveTlShowModerator) ||
                    (msg.isVerified && this.liveTlShowVerified)
                ) {
                    this.tlHistory.push(this.parseMessage(msg));
                    this.$emit("historyLength", this.tlHistory.length);
                }
                return;
            }
            switch (msg.type) {
                case this.MESSAGE_TYPES.UPDATE:
                    this.$emit("videoUpdate", msg);
                    break;
                case this.MESSAGE_TYPES.END:
                    this.overlayMessage = msg.message;
                    this.tlLeave();
                    break;
                case this.MESSAGE_TYPES.ERROR:
                    this.overlayMessage = "An unexpected error occured";
                    // this.showOverlay = true;
                    this.tlLeave();
                    break;
                default:
                    break;
            }
        },
        parseMessage(msg) {
            // Append title to author name
            msg.prefix = "";
            if (msg.isModerator) msg.prefix += "[Mod]";
            if (msg.isVerified) msg.prefix += "[Verified]";
            if (msg.isOwner) msg.prefix += "[Owner]";
            if (msg.isVtuber) msg.prefix += "[Vtuber]";

            // Check if there's any emojis represented as URLs formatted by backend
            if (msg.message.includes("https://")) {
                // match a :HUMU:https://<url>
                const regex = /(:\S+:)(https:\/\/\S*-c-k-nd)/gi;
                const str = msg.message;
                // find first match
                let match = regex.exec(str);
                let processed = "";
                let curIndex = 0;
                // iterate until no matches remain
                while (match != null) {
                    const { index } = match;
                    // replace all strings between indexes with img src
                    processed += str.substring(curIndex, index);
                    processed += `<img src="${match[2].replace("=w48-h48-c-k-nd", "=w24-h24-c-k-nd")}" alt="${
                        match[1]
                    }"/>`;
                    curIndex = index + match[0].length;
                    match = regex.exec(str);
                }
                processed += str.substring(curIndex, str.length);
                msg.message = processed;
            }
            return msg;
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
            api.chatHistory(this.video.id, {
                lang: this.liveTlLang,
                ...(this.liveTlShowVerified && { verified: 1 }),
                ...(this.liveTlShowModerator && { moderator: 1 }),
            }).then(({ data }) => {
                // Backwards compatible incase backend needs to revert
                if (Array.isArray(data)) {
                    this.tlHistory = data
                        .filter((msg) => !this.blockedNames.has(msg.name)) // filter out blocked users
                        .map((msg) => this.parseMessage(msg)); // replace all emoji urls with tags
                    return;
                }

                this.tlHistory = data.translations
                    .concat(data.moderator ? data.moderator : [])
                    .concat(data.verified ? data.verified : [])
                    .filter((msg) => !this.blockedNames.has(msg.name))
                    .sort((a, b) => a.timestamp - b.timestamp)
                    .map((msg) => this.parseMessage(msg));
            });

            // Another instance has already subscribed to this chat, just register listener
            if (this.$socket.client.listeners(`${this.video.id}/${this.liveTlLang}`).length > 0) {
                this.registerListener();
                this.success = true;
                this.$store.commit("incrementActiveSockets");
            } else {
                // Try to join chat room with specified language
                this.$socket.client.emit("subscribe", { video_id: this.video.id, lang: this.liveTlLang });
            }
        },
        tlLeave() {
            const vm = this as any;
            // only disconnect and derement socket if it succeeded
            if (vm.success) {
                vm.$store.commit("decrementActiveSockets");
                // Check if there's another listener depending on this subscription, unsub if not
                if (vm.$socket.client.listeners(`${this.video.id}/${this.liveTlLang}`).length <= 1) {
                    vm.$socket.client.emit("unsubscribe", { video_id: vm.video.id, lang: vm.liveTlLang });
                }
                vm.unregisterListener();
                vm.$store.dispatch("checkActiveSockets");
                // Reset for immediate reconnects
                vm.success = false;
            }
        },
        switchLanguage(newLang, oldLang) {
            // unsub from old langauge
            this.$socket.client.emit("unsubscribe", { video_id: this.video.id, lang: oldLang });
            this.$socket.client.off(`${this.video.id}/${oldLang}`, this.handleMessage);
            this.success = false;
            this.tlJoin();
        },
        utcToTimestamp(utc) {
            return formatDuration(
                dayjs.utc(utc).diff(Number(dayjs(this.video.start_actual || this.video.start_scheduled))),
            );
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
    display: flex;
    flex-direction: column-reverse;
    line-height: 1.25em;
    letter-spacing: 0.0178571429em !important;
}

.tl-overlay {
    border: 1px solid rgba(65, 65, 65, 0.2) !important;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
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
