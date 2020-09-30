<template>
    <div>
        <NavDrawer :pages="pages" v-model="drawer" v-if="!isXs" />
        <BottomNav :pages="pages" v-else />
        <v-app-bar color="blue lighten-2" app clipped-left flat>
            <template v-if="!isXs || (isXs && !searchBarExpanded)">
                <v-app-bar-nav-icon @click.stop="drawer = !drawer">
                    <v-icon>{{ mdiMenu }}</v-icon>
                </v-app-bar-nav-icon>
                <v-toolbar-title class="pr-5">
                    <router-link
                        :to="'/'"
                        style="text-decoration: none; color: white"
                    >
                        HoloDex
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
    mdiHeart,
    mdiChevronUp,
    mdiChevronDown,
    mdiArrowLeft,
    mdiMagnify,
} from "@mdi/js";
// import ChannelImg from "@/components/ChannelImg";
// import ChannelInfo from "@/components/ChannelInfo";
import NavDrawer from "@/components/navs/NavDrawer";
import BottomNav from "@/components/navs/BottomNav";
import SearchBar from "@/components/SearchBar";
export default {
    components: {
        // ChannelImg,
        // ChannelInfo,
        SearchBar,
        NavDrawer,
        BottomNav,
    },
    data: () => ({
        drawer: null,
        ...{
            mdiHome,
            mdiAnimationPlay,
            mdiHelpCircle,
            mdiCog,
            mdiMenu,
            mdiHeart,
            mdiChevronUp,
            mdiChevronDown,
            mdiArrowLeft,
            mdiMagnify,
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
        favorites() {
            return this.$store.state.favorites;
        },
        cachedChannels() {
            return this.$store.state.cachedChannels;
        },
        favoritedChannels() {
            if (
                !this.$store.state.cachedChannels ||
                !this.$store.state.favorites
            )
                return [];
            // check cache for missing favorites
            this.$store.dispatch("checkFavorites");
            // return favorited channel list from cache
            const arr = this.favorites.map(channel_id =>
                Object.hasOwnProperty.call(this.cachedChannels, channel_id)
                    ? this.cachedChannels[channel_id]
                    : null
            );
            return !this.favoritesExpanded && this.favorites.length > 10
                ? arr.splice(0, 10)
                : arr;
        },
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
