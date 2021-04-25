<template>
    <div class="ma-auto">
        <a
            class="twitter-timeline"
            data-dnt="true"
            :data-height="$store.state.isMobile ? '340' : '800'"
            :data-theme="this.$vuetify.theme.dark ? 'dark' : 'light'"
            href="https://twitter.com/holodex?ref_src=twsrc%5Etfw"
        >
            Tweets by @holodex
        </a>
    </div>
</template>
<script lang="ts">
export default {
    mounted() {
        // TODO(jprochazk): declare this in globals.d.ts
        const w = window as any;
        if (!w.twttr) {
            const externalScript = document.createElement("script");
            externalScript.setAttribute("src", "https://platform.twitter.com/widgets.js");
            externalScript.setAttribute("async", "true");
            document.head.appendChild(externalScript);
        } else {
            w.twttr.widgets.load();
        }
    },
};
</script>

<style></style>
