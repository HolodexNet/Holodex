<template>
    <v-app>
        <MainNav />
        <v-main>
            <router-view />
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
                    Refresh
                </v-btn>
            </template>
        </v-snackbar>
    </v-app>
</template>

<script>
import MainNav from "@/components/MainNav.vue";
export default {
    name: "App",
    components: {
        MainNav,
    },
    data() {
        return {
            updateExists: false,
            registration: null,
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
                console.log(event);
                this.registration = event.detail;
                this.updateExists = true;
            },
            {
                once: true,
            }
        );
    },
    computed: {
        darkMode() {
            return this.$store.state.darkMode;
        },
    },
    watch: {
        darkMode() {
            this.$vuetify.theme.dark = this.darkMode;
        },
    },
    methods: {
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
