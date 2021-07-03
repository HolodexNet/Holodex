<template>
    <v-card class="text-body-2 tl-overlay" tile flat style="width: 100%">
        <v-card-subtitle class="py-1 d-flex justify-space-between">
            <div>TLdex [{{ liveTlLang }}]</div>
            <span>
                <v-dialog v-model="expanded" width="800">
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn icon x-small v-bind="attrs" v-on="on">
                            <v-icon>
                                {{ mdiArrowExpand }}
                            </v-icon>
                        </v-btn>
                    </template>

                    <v-card>
                        <portal-target name="expandedMessage" class="d-flex tl-expanded"> </portal-target>
                        <v-divider />
                        <v-card-actions>
                            <v-spacer />
                            <v-btn text @click="expanded = false" color="red">{{ $t("views.app.close_btn") }}</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
                <WatchLiveTranslationsSetting />
            </span>
        </v-card-subtitle>
        <v-divider />
        <portal to="expandedMessage" :disabled="!expanded" slim>
            <virtual-list
                class="tl-body thin-scroll-bar pa-1 pa-lg-3"
                ref="tlBody"
                :style="{
                    'font-size': liveTlFontSize + 'px',
                }"
                :data-component="ChatMessage"
                :data-key="getKey"
                :data-sources="tlHistory"
                :item-height="20"
                :item-class-add="activeClass"
            >
            </virtual-list>
        </portal>
    </v-card>
</template>

<script lang="ts">
import api from "@/utils/backend-api";
import { formatDuration, dayjs } from "@/utils/time";
import { syncState } from "@/utils/functions";
import { mdiArrowExpand } from "@mdi/js";
import VirtualList from "vue-virtual-scroll-list";
import WatchLiveTranslationsSetting from "./LiveTranslationsSetting.vue";
import ChatMessage from "./ChatMessage.vue";

export default {
    name: "LiveTranslations",
    components: {
        WatchLiveTranslationsSetting,
        ChatMessage,
        VirtualList,
    },
    props: {
        video: {
            type: Object,
            required: false,
        },
    },
    data() {
        return {
            ChatMessage,
            mdiArrowExpand,
            tlHistory: [],
            MESSAGE_TYPES: Object.freeze({
                END: "end",
                ERROR: "error",
                INFO: "info",
                MESSAGE: "message",
                UPDATE: "update",
            }),
            expanded: false,
            selectedChannel: "",

            historyLoading: false,
            completed: false,
            limit: 20,
            currentTime: 0,

            curIndex: 0,
            // overflow: false,
        };
    },
    created() {},
    mounted() {
        this.loadMessages(true, true);
        setInterval(() => {
            this.currentTime = this.$store.state.activeVideos[this.video.id].getCurrentTime();
        }, 1000);
    },
    watch: {
        liveTlLang() {
            this.loadMessages(true, true);
        },
        liveTlShowVerified() {
            this.loadMessages(true, true);
        },
        liveTlShowModerator() {
            this.loadMessages(true, true);
        },
        currentTime(time) {
            if (!this.tlHistory.length) return;
            const cur = this.getRelativeSecs(this.curIndex);
            // time jumped forward too fast, or backwards. Exhaustive search for next spot

            const startIndex = time < cur ? 0 : this.curIndex;
            for (let i = startIndex; i < this.tlHistory.length; i += 1) {
                if (i === this.tlHistory.length - 1) {
                    this.curIndex = this.tlHistory.length - 1;
                    return;
                }
                if (time <= this.getRelativeSecs(i)) {
                    this.curIndex = Math.max(i - 1, 0);
                    return;
                }
            }
        },
        curIndex(idx) {
            this.$refs.tlBody.scrollToIndex(idx);
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
        startTimeUnix() {
            return Number(dayjs(this.video.start_actual || this.video.start_scheduled));
        },
    },
    methods: {
        getRelativeSecs(index) {
            return (this.tlHistory[index].timestamp - this.startTimeUnix) / 1000;
        },
        activeClass(index) {
            return index === this.curIndex ? "active-message" : "";
        },
        getKey(item) {
            return item.timestamp + item.message + item.name;
        },
        loadMessages(firstLoad = false, loadAll = false) {
            this.historyLoading = true;
            const lastTimestamp = !firstLoad && this.tlHistory[0].timestamp;
            api.chatHistory(this.video.id, {
                lang: this.liveTlLang,
                ...(this.liveTlShowVerified && { verified: 1 }),
                moderator: this.liveTlShowModerator ? 1 : 0,
                limit: loadAll ? 10000 : this.limit,
                ...(lastTimestamp && { before: lastTimestamp }),
            })
                .then(({ data }) => {
                    this.completed = data.length !== this.limit || loadAll;
                    const filtered = data.filter((m) => !this.blockedNames.has(m.name));
                    if (firstLoad) this.tlHistory = filtered.map(this.parseMessage);
                    else this.tlHistory.unshift(...filtered.map(this.parseMessage));

                    // Set last message as breakpoint, used for maintaing scrolling and styling
                    if (this.tlHistory.length) this.tlHistory[0].breakpoint = true;
                    this.curIndex = 0;
                })
                .catch((e) => {
                    console.error(e);
                })
                .finally(() => {
                    this.historyLoading = false;
                });
        },
        parseMessage(msg) {
            // Append title to author name
            msg.prefix = "";
            if (msg.is_moderator) msg.prefix += "[Mod]";
            if (msg.is_verified) msg.prefix += "[Verified]";
            if (msg.is_owner) msg.prefix += "[Owner]";
            if (msg.is_vtuber) msg.prefix += "[Vtuber]";
            msg.timestamp = +msg.timestamp;
            msg.displayTime = this.utcToTimestamp(msg.timestamp);
            msg.key = msg.name + msg.timestamp + msg.message;
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
        utcToTimestamp(utc) {
            return formatDuration(
                dayjs.utc(utc).diff(Number(dayjs(this.video.start_actual || this.video.start_scheduled))),
            );
        },
    },
};
</script>

<style>
.tl-body {
    overflow-y: auto;
    position: relative;
    overscroll-behavior: contain;
    height: calc(100% - 32px);
    display: flex;
    flex-direction: column-reverse;
    flex-direction: column;
    line-height: 1.25em;
    letter-spacing: 0.0178571429em !important;
}

.active-message {
    position: relative;
}
.active-message {
    z-index: 0;
}
.active-message .tl-message::before {
    content: "";
    background-color: var(--v-primary-base);
    opacity: 0.25;
    width: calc(100%);
    height: calc(100% + 5px);
    background-size: cover;
    position: absolute;
    top: -1px;
    left: 0;
    z-index: -1;
}
</style>
