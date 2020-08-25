<template>
    <v-app>
        <MainNav />
        <v-main>
            <!-- <v-container class="fill-height" fluid>
                <v-row justify="center" algin="start">
                    <v-col xl="8"> -->
                        <router-view />
                    <!-- </v-col>
                </v-row>
            </v-container> -->
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
