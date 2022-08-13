// Loads store settings, exposes loadHistory and parseMessage function
import api from "@/utils/backend-api";
import { dayjs } from "@/utils/time";
import { syncState } from "@/utils/functions";
import { mdiArrowExpand, mdiSubtitlesOutline } from "@mdi/js";

export default {
    data() {
        return {
            mdiArrowExpand,
            mdiSubtitlesOutline,
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

            subtitleToggle: true,
        };
    },
    props: {
        video: {
            type: Object,
            required: false,
        },
        currentTime: {
            type: Number,
            default: 0,
        },
        // For multiview
        useLocalSubtitleToggle: {
            type: Boolean,
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
            "liveTlShowVtuber",
            "liveTlShowSubtitle",
            "liveTlHideSpoiler",
        ]),
        showSubtitle: {
            get() {
                return this.useLocalSubtitleToggle
                    ? this.subtitleToggle
                    : this.liveTlShowSubtitle;
            },
            set(val) {
                this.useLocalSubtitleToggle
                    ? (this.subtitleToggle = val)
                    : (this.liveTlShowSubtitle = val);
            },
        },
        blockedNames() {
            return this.$store.getters["settings/liveTlBlockedNames"];
        },
        startTimeMillis() {
            if (!this.video.available_at) return null;
            return Number(dayjs(this.video.available_at));
        },
    },
    watch: {
        liveTlShowVerified() {
            this.loadMessages(true, true);
        },
        liveTlShowModerator() {
            this.loadMessages(true, true);
        },
        liveTlShowVtuber() {
            this.loadMessages(true, true);
        },
    },
    mounted() {
        this.showSubtitle = this.liveTlShowSubtitle;
    },
    methods: {
        loadMessages(firstLoad = false, loadAll = false, tlClient = false) {
            const isCustom = this.video.id === "custom" && this.video.custom_video_id;
            this.historyLoading = true;
            const lastTimestamp = !firstLoad && this.tlHistory[0]?.timestamp;

            let query = {};
            query = {
                lang: this.liveTlLang,
                verified: !tlClient && this.liveTlShowVerified,
                moderator: !tlClient && this.liveTlShowModerator,
                vtuber: !tlClient && this.liveTlShowVtuber,
                limit: loadAll ? 100000 : this.limit,
                ...(lastTimestamp && { before: lastTimestamp }),
                ...(isCustom && { custom_video_id: this.video.custom_video_id }),
            };

            api
                .chatHistory(this.video.id, query)
                .then(({ data }) => {
                    this.completed = data.length !== this.limit || loadAll;
                    if (firstLoad) this.tlHistory = data.map(this.parseMessage);
                    else this.tlHistory.unshift(...data.map(this.parseMessage));

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
            msg.timestamp = +msg.timestamp;
            msg.relativeMs = this.startTimeMillis ? msg.timestamp - this.startTimeMillis : 0;
            msg.key = msg.name + msg.timestamp + msg.message;
            // Check if there's any emojis represented as URLs formatted by backend
            if (msg.message.includes("https://") && !msg.parsed) {
                // match a :HUMU:https://<url>
                const regex = /(\S+)(https:\/\/(yt\d+\.ggpht\.com\/[a-zA-Z0-9_\-=/]+-c-k-nd|www\.youtube\.com\/[a-zA-Z0-9_\-=/]+\.svg))/gi;
                msg.parsed = msg.message
                    .replace(/<([^>]*)>/g, "($1)")
                    .replace(regex, '<img src="$2" />');
            }
            return msg;
        },
    },
};
