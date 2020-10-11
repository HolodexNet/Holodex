<template>
    <div>
        <NavDrawer :pages="pages" v-model="drawer" v-if="!isXs" />
        <BottomNav :pages="pages" v-else />
        <v-app-bar color="blue lighten-1" app clipped-left flat>
            <template v-if="!isXs || (isXs && !searchBarExpanded)">
                <v-app-bar-nav-icon @click.stop="drawer = !drawer" v-if="!isXs">
                    <v-icon>{{ mdiMenu }}</v-icon>
                </v-app-bar-nav-icon>
                <v-toolbar-title class="pr-5">
                    <router-link
                        :to="'/'"
                        style="text-decoration: none; color: white; font-size: 24px; line-height: 1.2px"
                    >
                        <Logo
                            width="24"
                            height="24"
                            style="margin-bottom: -4px"
                        />Holodex
                    </router-link>
                </v-toolbar-title>
                <SearchBar v-if="!isXs" />
                <v-btn
                    icon
                    class="ml-auto"
                    v-if="isXs"
                    @click="searchBarExpanded = true"
                >
                    <v-icon>{{ mdiMagnify }}</v-icon>
                </v-btn>
            </template>
            <template v-else>
                <v-app-bar-nav-icon
                    @click="searchBarExpanded = false"
                    class="backButton"
                >
                    <v-icon>{{ mdiArrowLeft }}</v-icon>
                </v-app-bar-nav-icon>
                <SearchBar dense />
            </template>
        </v-app-bar>
    </div>
</template>

<script>
import {
    mdiHome,
    mdiAnimationPlay,
    mdiHelpCircle,
    mdiCog,
    mdiMenu,
    mdiArrowLeft,
    mdiMagnify,
} from "@mdi/js";
import NavDrawer from "@/components/navs/NavDrawer";
import BottomNav from "@/components/navs/BottomNav";
import SearchBar from "@/components/SearchBar";
import Logo from "@/components/Logo";
export default {
    components: {
        SearchBar,
        NavDrawer,
        BottomNav,
        Logo,
    },
    data: () => ({
        drawer: null,
        ...{
            mdiArrowLeft,
            mdiMagnify,
            mdiMenu,
        },
        favoritesExpanded: false,
        searchBarExpanded: false,
        mobile: true,
        pages: [
            {
                name: "Home",
                path: "/",
                icon: mdiHome,
            },
            {
                name: "Channels",
                path: "/channel",
                icon: mdiAnimationPlay,
            },
            {
                name: "About",
                path: "/about",
                icon: mdiHelpCircle,
            },
            {
                name: "Settings",
                path: "/settings",
                icon: mdiCog,
            },
        ],
    }),
    computed: {
        isXs() {
            return this.$vuetify.breakpoint.name === "xs";
        },
    },
};
</script>

<style>
.backButton {
    height: 32px !important;
    width: 32px !important;
}
</style>
