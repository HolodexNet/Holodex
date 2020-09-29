<template>
    <v-container>
        <v-row>
            <v-col>
                <div class="text-h4">Settings</div>
                <v-switch
                    v-model="darkMode"
                    label="Dark Mode"
                    messages="Changes the theme between light mode and dark mode"
                ></v-switch>
                <v-switch
                    v-model="redirectMode"
                    label="Redirect Mode"
                    messages="Clicking on a video takes you straight to the youtube video"
                ></v-switch>
                <v-switch
                    v-model="usingEnName"
                    label="Using English Name"
                    messages="Replaces Vtuber name to their English name throughout the site"
                ></v-switch>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    name: "Settings",
    computed: {
        darkMode: {
            get() {
                return this.$store.state.darkMode;
            },
            set(val) {
                this.$store.commit("setDarkMode", val);
            },
        },
        redirectMode: {
            get() {
                return this.$store.state.redirectMode;
            },
            set(val) {
                this.$store.commit("setRedirectMode", val);
            },
        },
        usingEnName: {
            get() {
                return this.$store.getters.usingEnName;
            },
            set(val) {
                this.$store.commit("setEnName", val);
            },
        },
    },
};
</script>

<style></style>
