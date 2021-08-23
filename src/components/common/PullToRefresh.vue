<template>
  <div class="pull-to-refresh-material__control" style="z-index: 4">
    <svg
      class="pull-to-refresh-material__icon"
      fill="#4285f4"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <path :d="icons.mdiRefresh" />
      <!-- <path d="M0 0h24v24H0z" fill="none" /> -->
    </svg>
    <svg
      class="pull-to-refresh-material__spinner"
      width="24"
      height="24"
      viewBox="25 25 50 50"
    >
      <circle
        class="pull-to-refresh-material__path"
        cx="50"
        cy="50"
        r="20"
        fill="none"
        stroke="#4285f4"
        stroke-width="4"
        stroke-miterlimit="10"
      />
    </svg>
  </div>
</template>

<script>
// Modified verison of https://github.com/jiangfengming/pull-to-refresh
import pullToRefresh from "@/external/mobile-pull-to-refresh/src/pullToRefresh";
import ptrAnimatesMaterial from "@/external/mobile-pull-to-refresh/src/styles/material/animates";
import "@/external/mobile-pull-to-refresh/src/styles/material/style.css";

export default {
    data() {
        return {
            destroyCb: null,
        };
    },
    computed: {
        shouldRefresh() {
            return ["watch_id", "watch", "mugen-clips", "edit_video", "multiview"].includes(this.$route.name);
        },
    },
    mounted() {
        const self = this;
        // eslint-disable-next-line no-unused-vars
        this.destroyCb = pullToRefresh({
            container: document.querySelector(".v-main"),
            animates: ptrAnimatesMaterial,
            // animates: ptrAnimatesMaterial2,
            // animates: ptrAnimatesIos,
            shouldPullToRefresh: () => !window.scrollY
                // disable on watch page
                && !self.shouldRefresh
                // disable on mobile when navdrawer is pulled out
                // self.$store.state.isMobile && (removing restriction on mobile)
                && !self.$store.state.navDrawer,
            async refresh() {
                // here to fetch the data and rerender the contents.
                // check if there's a handler on the sequence
                const handledRefresh = await self.$store.dispatch("reloadCurrentPage", {
                    source: "ptr",
                    consumed: false,
                });
                // do default refresh if none
                if (!handledRefresh.consumed) {
                    self.$router.go(0);
                }
                // Stops the refresh icon from hiding instantly, little bit of placebo XD
                await new Promise((resolve) => setTimeout(resolve, 300));
            },
        });
    },
    beforeDestroy() {
        this.destroyCb();
    },
};
</script>

<style>
/* pull to refresh skin */

.ptr--ptr {
    box-shadow: none !important;
}

.ptr--box {
    padding: 0px !important;
    justify-content: center;
    display: flex;
}

/* icon size */
.ptr--icon,
.ptr--text > svg {
    width: 32px;
    height: 32px;
}

/* rotate left arrow to be down arrow, micro bandwidth savings */
.ptr--icon {
    transform: rotate(90deg);
}

/* only display either icon or text */
.ptr--ptr.ptr--refresh .ptr--content .ptr--icon {
    display: none;
}

.ptr--text {
    display: none;
}

/* rotate arrow when threshold reached */
.ptr--ptr.ptr--release .ptr--content .ptr--icon {
    transform: rotate(270deg);
}

/* show text with refresh spinner and animate */
.ptr--ptr.ptr--refresh .ptr--content .ptr--text {
    animation: spin 1.1s infinite linear;
    display: block;
}

@keyframes spin {
    0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
    }
    100% {
        -webkit-transform: rotate(360deg);
        transform: rotate(360deg);
    }
}
</style>
