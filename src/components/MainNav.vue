<template>
    <v-app-bar color="white" app elevate-on-scroll>
        <v-app-bar-nav-icon></v-app-bar-nav-icon>

        <v-toolbar-title class="pr-5">HoloClips</v-toolbar-title>
        <v-btn to="/" text>
            Home
        </v-btn>
        <v-spacer></v-spacer>

        <v-btn icon>
            <v-icon>mdi-magnify</v-icon>
        </v-btn>

        <v-btn icon>
            <v-icon>mdi-heart</v-icon>
        </v-btn>

        <v-btn icon>
            <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
    </v-app-bar>
</template>

<script>
export default {};
</script>

<style></style>
