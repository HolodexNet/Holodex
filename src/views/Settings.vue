<template>
    <v-container>
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
    },
};
</script>

<style></style>
