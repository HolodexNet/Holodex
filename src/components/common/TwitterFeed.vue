<template>
    <div class="ma-auto">
        <a
            class="twitter-timeline"
            data-dnt="true"
            data-tweet-limit="5"
            :data-theme="this.$vuetify.theme.dark ? 'dark' : 'light'"
            href="https://twitter.com/holodex?ref_src=twsrc%5Etfw"
        >
            Tweets by @holodex
        </a>
    </div>
</template>
<script>
export default {
    mounted() {
        if (!window.twttr) {
            const externalScript = document.createElement("script");
            externalScript.setAttribute("src", "https://platform.twitter.com/widgets.js");
            externalScript.setAttribute("async", "true");
            document.head.appendChild(externalScript);
        } else {
            window.twttr.widgets.load();
        }
    },
};
</script>

<style></style>
