<template>
    <v-app>
        <MainNav />
        <v-main>
            <PullDownRefresh @refresh="onRefresh" v-if="isXs" />
            <keep-alive include="Home,Favorites,Channels" v-if="isXs">
                <router-view
                    v-bind:refreshId="keyId"
                    @refreshed="handleRefresh"
                />
                <!-- <router-view :key="keyId" /> -->
            </keep-alive>
            <router-view v-else />
        </v-main>
        <v-snackbar
            bottom
            right
            :value="updateExists"
            :timeout="-1"
            color="primary"
        >
            An update is available
            <template v-slot:action>
                <v-btn text @click="refreshApp" class="ml-auto">
                    Update
                </v-btn>
                <v-btn text @click="updateExists = false" class="ml-auto">
                    Close
                </v-btn>
            </template>
        </v-snackbar>
    </v-app>
</template>

<script>
import MainNav from "@/components/MainNav.vue";
import PullDownRefresh from "@/components/PullDownRefresh";
export default {
    name: "App",
    components: {
        MainNav,
        PullDownRefresh,
    },
    data() {
        return {
            updateExists: false,
            registration: null,
            keyId: 0,
            reloading: false,
            doneHandler: null,
        };
    },
    created() {
        if (!this.$store.testedWebP) {
            this.supportsWebp().then(res => {
                if (!res) this.$store.commit("noWebPSupport");
            });
            this.$store.commit("testedWebP");
        }
        this.$vuetify.theme.dark = this.darkMode;
        this.$store.dispatch("checkChannelCache");
        document.addEventListener(
            "swUpdated",
            event => {
                this.registration = event.detail;
                this.updateExists = true;
            },
            {
                once: true,
            }
        );
        navigator.serviceWorker.addEventListener("controllerchange", () => {
            if (this.refreshing) return;
            this.refreshing = true;
            // Here the actual reload of the page occurs
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
    },
    watch: {
        darkMode() {
            this.$vuetify.theme.dark = this.darkMode;
        },
    },
    methods: {
        handleRefresh(path) {
            console.log(path);
            this.doneHandler();
            this.reloading = false;
        },
        onRefresh(done) {
            if (this.reloading) return;
            this.keyId++;
            this.reloading = true;
            this.doneHandler = done;
        },
        supportsWebp: async function() {
            if (!self.createImageBitmap) return false;

            const webpData =
                "data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=";
            const blob = await fetch(webpData).then(r => r.blob());
            return createImageBitmap(blob).then(
                () => true,
                () => false
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
html {
    /* Disables pull-to-refresh but allows overscroll glow effects. */
    overscroll-behavior-y: none !important;
}
</style>
