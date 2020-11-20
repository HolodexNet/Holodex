<template>
    <v-app>
        <MainNav />
        <v-main>
            <router-view />
        </v-main>
        <v-snackbar bottom right :value="updateExists" :timeout="-1" color="primary" v-if="updateExists">
            An update is available
            <template v-slot:action>
                <v-btn text @click="refreshApp" class="ml-auto"> Update </v-btn>
                <v-btn text @click="updateExists = false" class="ml-auto"> Close </v-btn>
            </template>
        </v-snackbar>
        <v-snackbar bottom center :value="showUpdateDetails" color="primary" :timeout="-1">
            Visit the About page to see new changes
            <template v-slot:action>
                <v-btn text @click="showUpdateDetails = false" class="ml-auto"> Close </v-btn>
            </template>
        </v-snackbar>
    </v-app>
</template>

<script>
import MainNav from "@/components/MainNav.vue";

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
        if (!this.$store.testedWebP) {
            this.supportsWebp().then((res) => {
                if (!res) this.$store.commit("noWebPSupport");
            });
            this.$store.commit("testedWebP");
        }
        this.$vuetify.theme.dark = this.darkMode;
        this.$i18n.locale = this.$store.state.lang;
        this.$vuetify.lang.current = this.$store.state.lang;
        this.$store.dispatch("checkChannelCache");
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
        navigator.serviceWorker.addEventListener("controllerchange", () => {
            if (this.refreshing) return;
            this.refreshing = true;
            this.showUpdateDetails = true;
            window.location.reload();
        });
    },
    computed: {
        darkMode() {
            return this.$store.state.darkMode;
        },
        isXs() {
            return this.$vuetify.breakpoint.name === "xs";
        },
        showUpdateDetails: {
            set(val) {
                this.$store.commit("setShowUpdatesDetail", val);
            },
            get() {
                return this.$store.state.showUpdateDetails;
            },
        },
    },
    watch: {
        darkMode() {
            this.$vuetify.theme.dark = this.darkMode;
        },
    },
    methods: {
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
