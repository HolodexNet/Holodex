<template>
    <v-list-item class="d-block my-3 comment">
        <truncated-text style="white-space: pre-wrap" class="text-body-2" :html="processedMessage" lines="5">
            <template v-slot:button="{ expanded }">
                <span class="text-subtitle-2" style="color: #aaa">{{
                    expanded ? $t("component.comment.close") : $t("component.comment.readMore")
                }}</span>
            </template>
        </truncated-text>
        <a
            class="openOnYoutube"
            :href="`https://www.youtube.com/watch?v=${videoId}&lc=${comment.comment_key}`"
            target="_blank"
            rel="noopener noreferrer"
        >
            <v-icon small>{{ icons.mdiOpenInNew }}</v-icon>
        </a>
        <!-- comment body -->
    </v-list-item>
</template>

<script lang="ts">
import TruncatedText from "../common/TruncatedText.vue";
// import TruncatedText from '../common/TruncatedText.vue';

const COMMENT_TIMESTAMP_REGEX = /(?:([0-5]?[0-9]):)?([0-5]?[0-9]):([0-5][0-9])/gm;

export default {
    name: "Comment",
    components: { TruncatedText },
    data() {
        return {};
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
    methods: {},
    computed: {
        processedMessage() {
            const decoder = document.createElement("div");
            decoder.innerHTML = this.comment.message; // using browser assembly script to sanitize
            const sanitized = decoder.textContent;
            const vidUrl = (this.$store.state.settings.redirectMode ? "https://youtu.be/" : "/watch/") + this.videoId;
            return sanitized.replace(COMMENT_TIMESTAMP_REGEX, (match, hr, min, sec) => {
                const time = Number(hr ?? 0) * 3600 + Number(min) * 60 + Number(sec);
                return `<a class="comment-chip" href="${vidUrl}?t=${time}" data-time="${time}"> ${match} </a>`;
            });
        },
    },
};
</script>

<style>
.comment-chip {
    /* background-color: rgba(231, 159, 245, 0.281); */
    line-height: initial;
    padding: 1px 1px;
    border-radius: 4px;
    display: inline-block;
    text-decoration: none;
    /* border: 1px solid; */
}
.comment-chip:hover {
    background-color: rgba(105, 70, 72, 0.8);
}
.comment {
    border-left: 2px solid rgba(255, 255, 255, 0.5);
    min-height: 0px !important;
    padding: 0.25rem 1rem;
    position: relative;
}

.comment:hover .openOnYoutube {
    display: block;
}
.comment:focus .openOnYoutube {
    display: block;
}

.openOnYoutube {
    display: none;
    position: absolute;
    right: 0;
    top: 0;
}
</style>
