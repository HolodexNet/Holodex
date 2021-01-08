<template>
    <div>
        <!-- punchout to comment directly -->
        <span style="white-space: pre-wrap" v-html="processedMessage"></span>
        <!-- comment body -->
    </div>
</template>

<script>
const COMMENT_TIMESTAMP_REGEX = /(?:(\d+):)?(\d+):(\d+)/gm;

export default {
    name: "Comment",
    components: {},
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
    computed: {
        processedMessage() {
            const decoder = document.createElement("div");
            decoder.innerHTML = this.comment.message; // using browser assembly script to sanitize
            const sanitized = decoder.textContent;
            const vidUrl = (this.$store.state.settings.redirectMode ? "https://youtu.be/" : "/watch/") + this.videoId;
            return sanitized.replace(COMMENT_TIMESTAMP_REGEX, (match, hr, min, sec) => {
                const time = Number(hr) * 3600 + Number(min) * 60 + Number(sec);
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
