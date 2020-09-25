<template>
    <v-app>
        <MainNav />
        <v-main>
            <router-view />
        </v-main>
    </v-app>
</template>

<script>
import MainNav from "@/components/MainNav.vue";
export default {
    name: "App",
    components: {
        MainNav,
    },
    // data() {},
    created() {
        if (!this.$store.testedWebP) {
            this.supportsWebp().then(res => {
                if (!res) this.$store.commit("noWebPSupport");
            });
            this.$store.commit("testedWebP");
        }
        this.$vuetify.theme.dark = this.darkMode;
    },
    computed: {
        darkMode() {
            return this.$store.state.darkMode;
        },
    },
    watch: {
        darkMode() {
            this.$vuetify.theme.dark = this.darkMode;
        }
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
    },
};
</script>
