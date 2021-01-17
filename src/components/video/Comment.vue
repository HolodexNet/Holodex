<template>
    <v-list-item class="d-block mb-3">
        <!-- punchout to comment directly -->
        <!-- <v-chip
            class="d-inline"
            small
            label
            :href="`https://www.youtube.com/watch?v=${videoId}&lc=${comment.comment_key}`"
        >
            {{ $t("component.video.comment.openOnYoutube") }}&emsp;&emsp;
            <v-icon>{{ mdiYoutube }}</v-icon>
            {{ $t("component.video.comment.openOnYoutubeAfter") }}
        </v-chip> -->
        <br />
        <!-- <truncated-text 
            style="white-space: pre-wrap" 
            class="text-body-2" 
            :html="processedMessage"
            lines="5"
        >
            <template v-slot:button="{ expanded }">
                <span class="text-body-2">
                    {{ expanded ? $t("component.description.showLess") : $t("component.description.showMore") }}
                </span>
            </template>
        </truncated-text> -->
        <span style="white-space: pre-wrap" class="text-body-2" v-html="processedMessage" />
        <!-- comment body -->
    </v-list-item>
</template>

<script>
import { mdiYoutube } from "@/utils/icons";
import TruncatedText from "../common/TruncatedText";

const COMMENT_TIMESTAMP_REGEX = /(?:(\d+):)?(\d+):(\d+)/gm;

export default {
    name: "Comment",
    components: { TruncatedText },
    data() {
        return {
            mdiYoutube,
        };
    },
    props: {
        comment: {
            required: true,
            type: Object,
        },
        videoId: {
            required: true,
            type: String,
        },
    },
    computed: {
        processedMessage() {
            const decoder = document.createElement("div");
            decoder.innerHTML = this.comment.message; // using browser assembly script to sanitize
            const sanitized = decoder.textContent;
            const vidUrl = (this.$store.state.settings.redirectMode ? "https://youtu.be/" : "/watch/") + this.videoId;
            return sanitized.replace(COMMENT_TIMESTAMP_REGEX, (match, hr, min, sec) => {
                const time = Number(hr ?? 0) * 3600 + Number(min) * 60 + Number(sec);
                return `<a class="comment-chip" href="${vidUrl}?t=${time}"> ${match} </a>`;
            });
        },
    },
};
</script>

<style>
.comment-chip {
    background-color: rgba(231, 159, 245, 0.281);
    padding: 1px 4px;
    border-radius: 4px;
    display: inline-block;
}
.comment-chip:hover {
    background-color: rgba(105, 70, 72, 0.8);
}
</style>
