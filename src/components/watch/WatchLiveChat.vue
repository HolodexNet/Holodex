<template>
    <div>
        <div class="embedded-chat" v-if="!hideLiveChat">
            <iframe :src="liveChatUrl" frameborder="0" />
        </div>
        <div class="text-end pa-1 text-caption">
            <a @click="hideLiveChat = !hideLiveChat"> {{ hideLiveChat ? "Show" : "Hide" }} Live Chat </a>
        </div>
    </div>
</template>

<script>
export default {
    name: "WatchLiveChat",
    data() {
        return {
            hideLiveChat: false,
        };
    },
    props: {
        video: {
            type: Object,
            required: true,
        },
        // hasLiveChat: {
        //     type: Boolean,
        //     default: false,
        // }
    },
    computed: {
        liveChatUrl() {
            if (!this.video) return null;
            return `https://www.youtube.com/live_chat?v=${this.video.id}&embed_domain=${
                window.location.hostname
            }&dark_theme=${this.$vuetify.theme.dark ? 1 : 0}`;
        },
    },
};
</script>

<style></style>
