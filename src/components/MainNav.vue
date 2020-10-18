<template>
    <div>
        <NavDrawer :pages="pages" v-model="drawer" v-if="!isXs" />
        <BottomNav :pages="pages.filter(page => !page.collapsible)" v-else />
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
                    :class="{ 'refresh-rotate': refreshing }"
                    v-if="isXs"
                    @click="onRefresh"
                >
                    <v-icon>{{ mdiRefresh }}</v-icon>
                </v-btn>
                <v-btn icon v-if="isXs" @click="searchBarExpanded = true">
                    <v-icon>{{ mdiMagnify }}</v-icon>
                </v-btn>
                <v-menu left bottom v-if="isXs">
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn icon v-bind="attrs" v-on="on">
                            <v-icon>{{ mdiDotsVertical }}</v-icon>
                        </v-btn>
                    </template>

                    <v-list v-if="isXs">
                        <v-list-item
                            v-for="page in pages.filter(
                                item => item.collapsible
                            )"
                            :key="page.name"
                            :to="page.path"
                        >
                            <v-list-item-title>
                                {{ page.name }}
                            </v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </template>
            <template v-else>
                <v-app-bar-nav-icon
                    @click="searchBarExpanded = false"
                    class="backButton"
                >
                    <v-icon>{{ mdiArrowLeft }}</v-icon>
                </v-app-bar-nav-icon>
                <SearchBar :autofocus="isXs" />
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
    mdiHeart,
    mdiDotsVertical,
    mdiRefresh,
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
            mdiDotsVertical,
            mdiRefresh,
        },
        favoritesExpanded: false,
        searchBarExpanded: false,
        refreshing: false,
        pages: [
            {
                name: "Home",
                path: "/",
                icon: mdiHome,
            },
            {
                name: "Favorites",
                path: "/favorites",
                icon: mdiHeart,
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
                collapsible: true,
            },
            {
                name: "Settings",
                path: "/settings",
                icon: mdiCog,
                collapsible: true,
            },
        ],
    }),
    computed: {
        isXs() {
            return this.$vuetify.breakpoint.name === "xs";
        },
    },
    created() {
        // eslint-disable-next-line no-unused-vars
        this.$router.afterEach((to, from) => {
            this.refreshing = false;
        });
    },
    methods: {
        onRefresh() {
            this.refreshing = true;
            this.$router.go(0);
        },
    },
};
</script>

<style>
.backButton {
    height: 32px !important;
    width: 32px !important;
}
.refresh-rotate {
    animation: rotation 2s infinite linear;
}
@keyframes rotation {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(359deg);
    }
}
</style>
