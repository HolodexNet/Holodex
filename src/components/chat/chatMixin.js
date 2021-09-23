// Loads store settings, exposes loadHistory and parseMessage function
import api from "@/utils/backend-api";
import { formatDuration, dayjs } from "@/utils/time";
import { syncState } from "@/utils/functions";
import { mdiArrowExpand } from "@mdi/js";

export default {
    data() {
        return {
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

            historyLoading: false,
            completed: false,
            limit: 20,
        };
    },
    props: {
        video: {
            type: Object,
            required: false,
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
        startTimeMillis() {
            return Number(dayjs(this.video.start_actual || this.video.start_scheduled));
        },
    },
    methods: {
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
            msg.relativeSeconds = (msg.timestamp - this.startTimeMillis) / 1000;
            msg.displayTime = this.utcToTimestamp(msg.timestamp);
            msg.realTime = this.realTimestamp(msg.timestamp);
            msg.key = msg.name + msg.timestamp + msg.message;
            // Check if there's any emojis represented as URLs formatted by backend
            if (msg.message.includes("https://")) {
                // match a :HUMU:https://<url>
                const regex = /(\S+)(https:\/\/(yt\d+\.ggpht\.com\/\S+-c-k-nd|www\.youtube\.com\/\S+\.svg))/gi;
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
                    }" style="width: auto; height: 1.3em; vertical-align: middle;" />`;
                    curIndex = index + match[0].length;
                    match = regex.exec(str);
                }
                processed += str.substring(curIndex, str.length);
                msg.message = processed;
            }
            return msg;
        },
        utcToTimestamp(utc) {
            return formatDuration(dayjs.utc(utc).diff(this.startTimeMillis));
        },
        realTimestamp(utc) {
            return dayjs(utc).format("LTS"); // localizedFormat
        },
    },
};
