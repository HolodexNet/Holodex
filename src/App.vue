<template>
    <v-app
        :style="{ background: $vuetify.theme.themes[this.darkMode ? 'dark' : 'light'].background }"
        :class="{ 'bump-bottom': $store.state.music.isOpen }"
    >
        <MainNav />
        <v-main class="pull-to-refresh" style="transition: none">
            <keep-alive max="4" exclude="Watch,MugenClips,EditVideo,MultiView,Channel">
                <router-view :key="viewKey" />
            </keep-alive>
        </v-main>

        <v-snackbar bottom right :value="updateExists" :timeout="-1" color="primary" v-if="updateExists">
            {{ $t("views.app.update_available") }}
            <template v-slot:action>
                <v-btn text @click="refreshApp" class="ml-auto"> {{ $t("views.app.update_btn") }} </v-btn>
                <v-btn text @click="updateExists = false" class="ml-auto"> {{ $t("views.app.close_btn") }} </v-btn>
            </template>
        </v-snackbar>
        <v-snackbar bottom center :value="showUpdateDetails" color="primary" :timeout="-1">
            {{ $t("views.app.check_about_page") }}
            <template v-slot:action>
                <v-btn text @click="showUpdateDetails = false" class="ml-auto" to="/about#changelog"> Changelog </v-btn>
                <v-btn text @click="showUpdateDetails = false" class="ml-auto"> {{ $t("views.app.close_btn") }} </v-btn>
            </template>
        </v-snackbar>
    </v-app>
</template>

<script lang="ts">
import MainNav from "@/components/nav/MainNav.vue";
import pulltorefresh from "vue-awesome-pulltorefresh";
import { dayjsLangs } from "./plugins/vuetify";

export default {
    name: "App",
    // default meta info
    metaInfo: {
        title: "Holodex",
        // titleTemplate: "%s - Holodex",
        // meta: [
        //     {
        //         vmid: "description",
        //         name: "description",
        //         property: "og:description",
        //         content:
        //             "Holodex is a collection of official and
        // translated Hololive vtuber videos and clips made by the community",
        //     },
        //     {
        //         property: "og:type",
        //         content: "website",
        //     },
        //     {
        //         vmid: "url",
        //         property: "og:url",
        //         content: "https://holodex.net",
        //     },
        //     {
        //         vmid: "image",
        //         property: "og:image",
        //         content: "https://holodex.net/img/icons/logo.png",
        //     },
        // ],
    },
    components: {
        MainNav,
    },
    data() {
        return {
            updateExists: false,
            registration: null,
            favoritesUpdateTask: null,
        };
    },
    created() {
        // set theme
        this.$vuetify.theme.dark = this.darkMode;
        // set lang
        dayjsLangs[this.$store.state.settings.lang]();
        this.$i18n.locale = this.$store.state.settings.lang;
        this.$vuetify.lang.current = this.$store.state.settings.lang;
        // check for pwa updates
        document.addEventListener(
            "swUpdated",
            (event: CustomEvent<any>) => {
                this.registration = event.detail;
                this.updateExists = true;
            },
            {
                once: true,
            },
        );

        // relog if necessary:
        this.$store.dispatch("loginCheck");

        // on update, reresh page and set update notification flag
        navigator.serviceWorker.addEventListener("controllerchange", () => {
            if (this.refreshing) return;
            this.refreshing = true;
            this.showUpdateDetails = true;
            window.location.reload();
        });

        if (this.favoritesUpdateTask) clearInterval(this.favoritesUpdateTask);

        this.favoritesUpdateTask = setInterval(() => {
            this.$store.dispatch("favorites/fetchLive", { minutes: 10 });
        }, 15 * 60 * 1000);

        // check current breakpoint and set isMobile
        this.updateIsMobile();
    },
    beforeDestroy() {
        if (this.favoritesUpdateTask) clearInterval(this.favoritesUpdateTask);
    },
    mounted() {
        const self = this;
        pulltorefresh.init({
            mainElement: ".pull-to-refresh",
            onRefresh: async () => {
                // check if there's a handler on the sequence
                const handledRefresh = await self.$store.dispatch("reloadCurrentPage", {
                    source: "ptr",
                    consumed: false,
                });
                // do default refresh if none
                if (!handledRefresh.consumed) {
                    this.$router.go(0);
                }
            },
            passive: true,
            iconArrow: `<svg viewBox="0 0 24 24"><path fill="${self.darkMode ? "white" : "black"}" d="${
                self.icons.mdiArrowLeft
            }" /></svg>`,
            distIgnore: 10,
            distReload: 120,
            distMax: 180,
            distThreshold: 120,
            refreshTimeout: 200,
            instructionsPullToRefresh: " ",
            instructionsReleaseToRefresh: " ",
            instructionsRefreshing: `<svg viewBox="0 0 24 24"><path fill="${self.darkMode ? "white" : "black"}" d="${
                self.icons.mdiRefresh
            }" /></svg>`,
            shouldPullToRefresh: () => {
                return (
                    !window.scrollY &&
                    // disable on watch page
                    !self.isWatchPage &&
                    // disable on mobile when navdrawer is pulled out
                    // self.$store.state.isMobile && (removing restriction on mobile)
                    !self.$store.state.navDrawer
                );
            },
        });
    },
    computed: {
        viewKey() {
            const key = this.$route.path;

            // channel has subviewws that will cause unwanted keep-alive instances
            // Key them all under channel/:id to avoid duplicating
            if (key.match("^/channel/.{16}")) {
                return key.substring(0, 33);
            }
            return key;
        },
        darkMode() {
            return this.$store.state.settings.darkMode;
        },
        showUpdateDetails: {
            set(val) {
                this.$store.commit("setShowUpdatesDetail", val);
            },
            get() {
                return this.$store.state.showUpdateDetails;
            },
        },
        lang() {
            // connected to the watch.lang hook below.
            return this.$store.state.settings.lang;
        },
        isWatchPage() {
            return ["watch_id", "watch", "mugen-clips", "edit_video", "multiview"].includes(this.$route.name);
        },
    },
    watch: {
        darkMode() {
            this.$vuetify.theme.dark = this.darkMode;
        },
        lang() {
            // watches the computed.lang variable and updates vue I18N
            // import(`dayjs/locale/${this.lang}`) // ES 2015
            dayjsLangs[this.$store.state.settings.lang]();
            this.$i18n.locale = this.$store.state.settings.lang;
            this.$vuetify.lang.current = this.$store.state.settings.lang;
        },
        // watches change in breakpoint from vuetify and updates store
        // eslint-disable-next-line func-names
        "$vuetify.breakpoint.name": function () {
            this.updateIsMobile();
        },
    },
    methods: {
        updateIsMobile() {
            this.$store.commit("setIsMobile", ["xs", "sm"].includes(this.$vuetify.breakpoint.name));
        },
        /* Youtube thumbnails has inconsistent webp support */
        // async supportsWebp() {
        //     // eslint-disable-next-line no-restricted-globals
        //     if (!self.createImageBitmap) return false;

        //     const webpData = "data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=";
        //     const blob = await fetch(webpData).then((r) => r.blob());
        //     return createImageBitmap(blob).then(
        //         () => true,
        //         () => false,
        //     );
        // },
        refreshApp() {
            this.updateExists = false;
            // Make sure we only send a 'skip waiting' message if the SW is waiting
            if (!this.registration || !this.registration.waiting) return;
            // send message to SW to skip the waiting and activate the new SW
            this.registration.waiting.postMessage({ type: "SKIP_WAITING" });
        },
    },
};
</script>
<style>
.no-decoration {
    text-decoration: none;
    color: inherit !important;
}
body {
    overscroll-behavior-y: contain;
    background: black;
    padding-left: min(calc(env(safe-area-inset-left)), 30px);
    padding-right: min(calc(env(safe-area-inset-right)), 30px);
}
.row {
    margin: 0px -12px;
}
.bump-bottom .v-main__wrap {
    padding-bottom: 250px;
    /* a bit of janky bottom spacing to allow all clients to scroll to bottom */
}

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

.thin-scroll-bar {
    scrollbar-width: thin;
}

.thin-scroll-bar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.thin-scroll-bar::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
}

.thin-scroll-bar::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.4);
}
</style>
