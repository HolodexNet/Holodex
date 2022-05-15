<template>
  <a
    class="twitter-timeline"
    data-dnt="true"
    :data-height="$store.state.isMobile ? '410' : '100%'"
    :data-theme="$vuetify.theme.dark ? 'dark' : 'light'"
    href="https://twitter.com/holodex?ref_src=twsrc%5Etfw"
  >
    Tweets by @holodex
  </a>
</template>
<script lang="ts">
import { waitForElement } from "@/utils/functions";

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
        // style twitter iframe
        waitForElement(".twitter-timeline-rendered").then((el) => {
            const twitterIframe: any = el as HTMLIFrameElement;
            setTimeout(() => {
                // switch position of title and info circle in DOM in order for flex to work
                const timelineHeader = twitterIframe.contentDocument.querySelector(".timeline-Header");
                const headerTitle = twitterIframe.contentDocument.querySelector(".timeline-Header-title");
                const headerInfoCircle = twitterIframe.contentDocument.querySelector(".timeline-InformationCircle");
                timelineHeader.insertBefore(headerTitle, headerInfoCircle);
                // remove embed link
                twitterIframe.contentDocument.querySelector(".u-floatLeft").remove();
                let twitterStyles = " * { scrollbar-color: #cdcdcd transparent; scrollbar-width: thin; }"
                    + " ::-webkit-scrollbar { width: 8px; }"
                    + " ::-webkit-scrollbar-thumb { background-color: #686868; border-radius: 5px; }"
                    + " ::-webkit-scrollbar-thumb:hover { background-color: #505050; }"
                    + " ::-webkit-scrollbar-track { background-color: transparent; }"
                    + " .timeline-Header { padding: 16px !important; display: flex;"
                    + "  justify-content: space-between; align-items: center; }"
                    + " .timeline-InformationCircle { position: unset !important; }";
                if (this.$vuetify.theme.dark) {
                    const darkStyles = " * { scrollbar-color: #686868 transparent; scrollbar-width: thin; }"
                        + " .timeline-Widget { background-color: #1e1e1e !important; }"
                        + " .timeline-Tweet:hover { background-color: #303030 !important; }";
                    twitterStyles += darkStyles;
                }
                // insert styles in <style> tag
                twitterIframe.contentDocument.all[2].innerHTML += twitterStyles;
            }, 600);
        });
    },
};
</script>

<style></style>
