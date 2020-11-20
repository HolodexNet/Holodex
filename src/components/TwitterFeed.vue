<template>
    <div class="ma-auto">
        <a
            class="twitter-timeline"
            data-dnt="true"
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
        const externalScript = document.createElement("script");
        externalScript.setAttribute(
            "src",
            "https://platform.twitter.com/widgets.js",
        );
        externalScript.setAttribute("async", "true");
        document.head.appendChild(externalScript);
    },
};
</script>

<style></style>
