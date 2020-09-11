<template>
    <v-app>
        <MainNav />
        <v-main>
        <!-- <v-main class="grey lighten-5"> -->
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
    data: () => ({
        //
    }),
};
</script>
