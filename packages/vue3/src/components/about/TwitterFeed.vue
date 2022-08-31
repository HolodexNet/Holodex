<template>
  <a
    class="twitter-timeline bg-bgColor"
    data-dnt="true"
    :data-height="display.mobile.value ? '410' : '650'"
    :data-theme="theme.dark ? 'dark' : 'light'"
    data-chrome="transparent noborders"
    href="https://twitter.com/holodex?ref_src=twsrc%5Etfw"
  >
    Tweets by @holodex
  </a>
</template>
<script lang="ts">
import { useThemeStore } from "@/stores/theme";
import { useDisplay } from "vuetify";

export default defineComponent({
  setup() {
    const theme = useThemeStore();
    const display = useDisplay();

    console.log("Twitterfeed Mounted");
    // TODO(jprochazk): declare this in globals.d.ts
    const w = window as any;
    if (!w.twttr) {
      const externalScript = document.createElement("script");
      externalScript.setAttribute(
        "src",
        "https://platform.twitter.com/widgets.js"
      );
      externalScript.setAttribute("async", "true");
      document.head.appendChild(externalScript);
    } else {
      w.twttr.widgets.load();
    }
    // style twitter iframe
    // waitForElement(".twitter-timeline-rendered").then((el) => {
    //   const twitterIframe: any = el as HTMLIFrameElement;
    //   setTimeout(() => {
    //     // switch position of title and info circle in DOM in order for flex to work
    //     const timelineHeader =
    //       twitterIframe.contentDocument.querySelector(".timeline-Header");
    //     const headerTitle = twitterIframe.contentDocument.querySelector(
    //       ".timeline-Header-title"
    //     );
    //     const headerInfoCircle = twitterIframe.contentDocument.querySelector(
    //       ".timeline-InformationCircle"
    //     );
    //     timelineHeader.insertBefore(headerTitle, headerInfoCircle);
    //     // remove embed link
    //     twitterIframe.contentDocument.querySelector(".u-floatLeft").remove();
    //     let twitterStyles =
    //       " * { scrollbar-color: #cdcdcd transparent; scrollbar-width: thin; }" +
    //       " ::-webkit-scrollbar { width: 8px; }" +
    //       " ::-webkit-scrollbar-thumb { background-color: #686868; border-radius: 5px; }" +
    //       " ::-webkit-scrollbar-thumb:hover { background-color: #505050; }" +
    //       " ::-webkit-scrollbar-track { background-color: transparent; }"; // +
    //     // " .timeline-Header { padding: 0.5rem 1rem !important; display: flex;" +
    //     // "  justify-content: space-between; align-items: center; }" +
    //     // " .timeline-InformationCircle { position: unset !important; }" +
    //     // " .timeline-Header-title { font-size: 20px !important; }";
    //     if (theme.dark) {
    //       const darkStyles =
    //         " * { scrollbar-color: #686868 transparent; scrollbar-width: thin; }" +
    //         " * { background-color: #222!important; }" +
    //         " .timeline-Tweet:hover { background-color: #303030 !important; }";
    //       twitterStyles += darkStyles;
    //     }
    //     // insert styles in <style> tag
    //     twitterIframe.contentDocument.all[2].innerHTML += twitterStyles;
    //   }, 600);
    // });

    return { theme, display };
  },
});
</script>

<style></style>
