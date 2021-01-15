<template>
    <v-app>
        <MainNav />
        <v-main>
            <keep-alive max="4" exclude="Watch,MugenClips">
                <router-view :key="$router.path" />
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
                <v-btn text @click="showUpdateDetails = false" class="ml-auto"> {{ $t("views.app.close_btn") }} </v-btn>
            </template>
        </v-snackbar>
    </v-app>
</template>

<script>
import MainNav from "@/components/nav/MainNav";
import { dayjsLangs } from "./plugins/vuetify";

export default {
    name: "App",
    // default meta info
    metaInfo: {
        title: "Holodex",
        titleTemplate: "%s - Holodex",
        meta: [
            {
                vmid: "description",
                name: "description",
                property: "og:description",
                content:
                    "Holodex is a collection of official and translated Hololive vtuber videos and clips made by the community",
            },
            {
                property: "og:type",
                content: "website",
            },
            {
                vmid: "url",
                property: "og:url",
                content: "https://holodex.net",
            },
            {
                vmid: "image",
                property: "og:image",
                content: "https://holodex.net/img/icons/logo.png",
            },
        ],
    },
    components: {
        MainNav,
    },
    data() {
        return {
            updateExists: false,
            registration: null,
            doneHandler: null,
        };
    },
    created() {
        // check if browser support webp
        if (!this.$store.testedWebP) {
            this.supportsWebp().then((res) => {
                if (!res) this.$store.commit("settings/noWebPSupport");
            });
            this.$store.commit("settings/testedWebP");
        }
        // set theme
        this.$vuetify.theme.dark = this.darkMode;
        // set lang
        dayjsLangs[this.$store.state.settings.lang]();
        this.$i18n.locale = this.$store.state.settings.lang;
        this.$vuetify.lang.current = this.$store.state.settings.lang;
        // check for pwa updates
        document.addEventListener(
            "swUpdated",
            (event) => {
                this.registration = event.detail;
                this.updateExists = true;
            },
            {
                once: true,
            },
        );

        // on update, reresh page and set update notification flag
        navigator.serviceWorker.addEventListener("controllerchange", () => {
            if (this.refreshing) return;
            this.refreshing = true;
            this.showUpdateDetails = true;
            window.location.reload();
        });

        // check current breakpoint and set isMobile
        this.updateIsMobile();
    },
    computed: {
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
        // eslint-disable-next-line func-names
        "$vuetify.breakpoint.name": function () {
            this.updateIsMobile();
        },
    },
    methods: {
        updateIsMobile() {
            this.$store.commit(
                "setIsMobile",
                this.$vuetify.breakpoint.name === "xs" || this.$vuetify.breakpoint.name === "sm",
            );
        },
        async supportsWebp() {
            // eslint-disable-next-line no-restricted-globals
            if (!self.createImageBitmap) return false;

            const webpData = "data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=";
            const blob = await fetch(webpData).then((r) => r.blob());
            return createImageBitmap(blob).then(
                () => true,
                () => false,
            );
        },
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
.body {
    overscroll-behavior-y: none;
}
</style>
