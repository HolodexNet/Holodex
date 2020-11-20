<template>
    <div>
        <NavDrawer :pages="pages" v-model="drawer" v-if="!isXs" />
        <BottomNav :pages="pages.filter(page => !page.collapsible)" v-else />
        <v-app-bar id="top-bar" class="blue lighten-1" app clipped-left flat>
            <template v-if="!isXs || (isXs && !searchBarExpanded)">
                <v-app-bar-nav-icon @click.stop="drawer = !drawer" v-if="!isXs">
                    <v-icon>{{ mdiMenu }}</v-icon>
                </v-app-bar-nav-icon>
                <v-toolbar-title class="pr-5">
                    <router-link
                        class="white--text"
                        :to="'/'"
                        style="text-decoration: none; font-size: 24px; line-height: 1.2px"
                    >
                        <Logo
                            width="24"
                            height="24"
                            style="margin-bottom: -4px"
                        />
                        Holodex
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
    mdiAccountBoxMultiple,
    mdiAnimationPlay,
    mdiArrowLeft,
    mdiCog,
    mdiDotsVertical,
    mdiHeart,
    mdiHelpCircle,
    mdiHome,
    mdiMagnify,
    mdiMenu,
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
    data() {
        return {
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
        };
    },
    computed: {
        isXs() {
            return this.$vuetify.breakpoint.name === "xs";
        },
        pages() {
            return [
                {
                    name: this.$t("component.mainNav.home"),
                    path: "/",
                    icon: mdiHome,
                },
                {
                    name: this.$t("component.mainNav.favorites"),
                    path: "/favorites",
                    icon: mdiHeart,
                },
                {
                    name: this.$t("component.mainNav.channels"),
                    path: "/channel",
                    icon: mdiAccountBoxMultiple,
                },
                {
                    name: this.$t("component.mainNav.library"),
                    path: "/library",
                    icon: mdiAnimationPlay,
                },
                {
                    name: this.$t("component.mainNav.about"),
                    path: "/about",
                    icon: mdiHelpCircle,
                    collapsible: true,
                },
                {
                    name: this.$t("component.mainNav.settings"),
                    path: "/settings",
                    icon: mdiCog,
                    collapsible: true,
                },
            ];
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

#top-bar::before {
    content: "";
    position: absolute;
    width: 100%;
    top: 0;
    height: 100%;
    background-image: url("data:image/svg+xml;charset=utf8,%3Csvg version='1.0' xmlns='http://www.w3.org/2000/svg' width='400px' height='400px' viewBox='980 0 5300 5400' preserveAspectRatio='xMidYMid meet'%3E%3Cg fill='%23000000'%3E%3C/g%3E%3Cg fill='%2339abe0'%3E%3Cpath d='M1015 5343 c-178-24-326-152-369-320-14-55-16-276-16-2117 0-1282 4-2057 10-2061 5-3 7-12 3-20-3-8 0-15 6-15 6 0 11-9 11-20 0-29 32-90 47-90 7 0 10-6 7-13-6-16 69-87 91-87 8 0 15-4 15-9 0-14 107-64 124-58 9 4 16 2 16-2 0-5 10-9 23-10 12-1 51-4 86-7 46-4 61-3 56 5-5 8 1 10 19 5 16-4 26-2 26 5 0 6 7 8 15 5 8-4 15-2 15 4 0 5 6 10 13 9 32-1 48 4 42 13-3 5 0 11 7 11 38 3 98 28 98 41 0 5 4 7 9 4 5-3 49 13 97 35 49 22 103 47 121 55 17 8 33 19 35 24 2 6 14 12 28 15 14 3 52 18 85 34 33 17 96 44 140 62 44 17 86 39 93 47 6 9 12 13 12 9 0-3 14-1 30 4 17 6 30 15 30 20 0 5 9 9 19 9 11 0 21 5 23 11 2 5 10 11 18 13 8 2 24 6 35 10 11 5 32 12 48 18 15 6 27 14 27 19 0 5 8 9 19 9 27 0 83 25 74 33-3 4-1 8 5 8 34 4 150 54 174 76 10 9 18 13 18 10 0-9 71 22 87 39 8 8 24 14 35 14 23 0 189 77 199 93 3 4 18 10 33 11 14 2 35 11 45 20 9 9 23 16 30 16 7 0 25 6 39 14 15 8 46 23 70 32 23 10 42 22 42 27 0 4 4 6 10 2 5-3 17-2 27 4 10 5 37 17 60 27 24 11 43 22 43 27 0 4 9 7 20 7 11 0 20 4 20 9 0 5 12 11 28 14 15 3 38 15 51 26 13 11 27 18 32 15 9-5 71 24 80 38 3 5 9 9 13 9 16-3 56 12 56 21 0 5 4 7 9 4 4-3 19 3 31 14 12 11 26 17 31 15 4-3 25 4 46 15 21 11 44 20 51 20 7 0 10 5 7 10-3 6 3 10 14 10 16 0 203 83 273 121 10 5 25 9 33 9 9 0 18 7 21 15 6 14 41 31 56 27 4-1 29 10 55 24 26 14 70 35 98 46 27 11 56 25 63 31 8 6 22 11 33 12 10 1 27 9 38 19 10 9 30 19 43 21 38 7 135 52 140 65 1 5 14 12 28 15 14 3 30 12 36 20 6 8 16 15 22 15 7 0 24 18 38 40 15 22 31 40 35 40 5 0 8 3 7 8-4 11 23 72 32 72 4 0 7 35 6 78-2 93-32 160-102 227 l-45 43 40 24 c23 14 38 28 35 31-4 4 1 10 11 13 9 4 28 30 41 58 23 50 24 55 24 368 0 348-3 368-66 459-40 59-105 97-434 255-480 230-1517 730-2405 1159-538 260-644 310-686 323-42 13-124 20-164 15z'/%3E%3C/g%3E%3Cg fill='%2346c0ef'%3E%3Cpath d='M972 4815 c-144-32-243-113-317-260-20-40-20-62-22-1870-2-1106 1-1833 6-1838 5-5 7-16 4-23-3-8 0-14 6-14 6 0 11-9 11-20 0-29 32-90 47-90 7 0 10-6 7-13-6-16 69-87 91-87 8 0 15-4 15-9 0-14 107-64 124-58 9 4 16 2 16-2 0-5 10-9 23-10 12-1 51-4 86-7 46-4 61-3 56 5-5 8 1 10 19 5 16-4 26-2 26 5 0 6 7 8 15 5 8-4 15-2 15 4 0 5 6 10 13 9 32-1 48 4 42 13-3 6 0 11 7 11 38 3 98 28 98 41 0 5 4 7 9 4 5-3 49 13 97 35 49 22 103 47 121 55 17 8 33 19 35 24 2 6 14 12 28 15 14 3 52 18 85 34 33 17 96 44 140 62 44 17 86 39 93 47 6 9 12 13 12 9 0-3 14-1 30 4 17 6 30 15 30 20 0 5 9 9 19 9 11 0 21 5 23 11 2 5 10 11 18 13 8 2 24 6 35 10 11 5 32 12 48 18 15 6 27 14 27 19 0 5 8 9 19 9 27 0 83 25 74 33-3 4-1 8 5 8 34 4 150 54 174 76 10 9 18 13 18 10 0-9 71 22 87 39 8 8 24 14 35 14 23 0 189 77 199 93 3 4 18 10 33 11 14 2 35 11 45 20 9 9 23 16 30 16 7 0 25 6 39 14 15 8 46 23 70 32 23 10 42 22 42 27 0 4 4 6 10 2 5-3 17-2 27 4 10 5 37 17 60 27 24 11 43 22 43 27 0 4 9 7 20 7 11 0 20 4 20 9 0 5 12 11 28 14 15 3 38 15 51 26 13 11 27 18 32 15 9-5 71 24 80 38 3 5 9 9 13 9 16-3 56 12 56 21 0 5 4 7 9 4 4-3 19 3 31 14 12 11 26 17 31 15 4-3 25 4 46 15 21 11 44 20 51 20 7 0 10 5 7 10-3 6 3 10 14 10 16 0 203 83 273 121 10 5 25 9 33 9 9 0 18 7 21 15 6 14 41 31 56 27 4-1 29 10 55 24 26 14 70 35 98 46 27 11 56 25 63 31 8 6 22 11 33 12 10 1 27 9 38 19 10 9 30 19 43 21 38 7 135 52 140 65 1 5 14 12 28 15 14 3 30 12 36 20 6 8 16 15 22 15 7 0 24 18 38 40 15 22 31 40 35 40 5 0 8 3 7 8-4 11 23 72 32 72 4 0 7 35 6 78-2 93-32 160-102 227 l-45 43 40 24 c23 14 38 28 35 31-4 4 1 10 11 13 9 4 28 30 41 58 49 104 23 240-62 335-50 55-57 59-759 396-66 32-203 98-305 147-102 49-223 108-270 130-47 23-157 76-245 118-297 144-450 218-545 263-52 25-225 108-384 186-159 78-290 141-291 141-1 0-85 40-186 88-470 226-506 243-565 252-73 12-83 12-162-5z'/%3E%3C/g%3E%3Cg fill='%235eddec'%3E%3Cpath d='M939 4287 c-113-32-213-116-267-225 l-37-76-2-1565 c-2-941 1-1569 6-1574 5-5 7-16 4-23-3-8 0-14 6-14 6 0 11-9 11-20 0-29 32-90 47-90 7 0 10-6 7-13-6-16 69-87 91-87 8 0 15-4 15-9 0-14 107-64 124-58 9 4 16 2 16-2 0-5 10-9 23-10 12-1 51-4 86-7 46-4 61-3 56 5-5 8 1 10 19 5 16-4 26-2 26 5 0 6 7 8 15 5 8-4 15-2 15 4 0 5 6 10 13 9 32-1 48 4 42 13-3 6 0 11 7 11 38 3 98 28 98 41 0 5 4 7 9 4 5-3 49 13 97 35 49 22 103 47 121 55 17 8 33 19 35 24 2 6 14 12 28 15 14 3 52 18 85 34 33 17 96 44 140 62 44 17 86 39 93 47 6 9 12 13 12 9 0-3 14-1 30 4 17 6 30 15 30 20 0 5 9 9 19 9 11 0 21 5 23 11 2 5 10 11 18 13 8 2 24 6 35 10 11 5 32 12 47 18 16 6 28 14 28 19 0 5 8 9 19 9 27 0 83 25 74 33-3 4-1 8 5 8 34 4 150 54 174 76 10 9 18 13 18 10 0-9 71 22 87 39 8 8 24 14 35 14 23 0 189 77 199 93 3 4 18 10 33 11 14 2 35 11 45 20 9 9 23 16 30 16 7 0 25 6 39 14 15 8 46 23 70 32 23 10 42 22 42 27 0 4 4 6 10 2 5-3 17-2 27 4 10 5 37 17 60 27 24 11 43 22 43 27 0 4 9 7 20 7 11 0 20 4 20 9 0 5 12 11 28 14 15 3 38 15 51 26 13 11 27 18 32 15 9-5 71 24 80 38 3 5 9 9 13 9 16-3 56 12 56 21 0 5 4 7 9 4 4-3 19 3 31 14 12 11 26 17 31 15 4-3 25 4 46 15 21 11 44 20 51 20 7 0 10 4 7 10-3 5 3 10 14 10 16 0 203 83 273 121 10 5 25 9 33 9 9 0 18 7 21 15 6 14 41 31 56 27 4-1 29 10 55 24 26 14 70 35 98 46 27 11 56 25 63 31 8 6 22 11 33 12 10 1 27 9 38 19 10 9 30 19 43 21 38 7 135 52 140 65 1 5 14 12 28 15 14 3 30 12 36 20 6 8 16 15 22 15 7 0 24 18 38 40 15 22 31 40 35 40 5 0 8 3 7 8-4 11 23 72 32 72 4 0 7 35 6 78-2 62-7 87-29 130-30 57-93 124-142 150-44 23-658 321-850 412-55 26-194 94-310 150-115 56-246 119-290 140-44 21-150 71-235 113-85 41-213 102-285 137-71 34-204 98-295 142-91 44-221 107-290 140-123 59-253 122-579 280-267 129-273 131-381 135-57 1-113-2-141-10z'/%3E%3C/g%3E%3Cg fill='%23b3eefb'%3E%3Cpath d='M919 4277 c-122-42-214-131-266-257-21-51-22-69-22-250 0-172 2-191 14-159 68 185 227 299 418 299 100 0 147-17 447-163 340-165 551-267 750-363 91-43 167-82 168-86 2-5 10-8 18-8 8 0 36-11 62-24 26-14 124-62 217-107 337-161 392-188 505-242 127-61 335-161 595-287 94-45 220-106 280-135 407-195 513-249 549-278 39-32 42-33 59-15 9 10 17 20 16 23-2 11 24 65 31 65 4 0 7 35 6 78-2 92-32 158-99 224-43 42-137 90-762 391-132 63-325 157-430 207-104 51-235 114-290 140-55 26-176 85-270 130-93 45-210 101-260 125-49 24-162 78-250 120-236 114-446 216-565 273-58 27-204 98-325 157-329 160-325 158-435 162-80 3-106 0-161-20z'/%3E%3C/g%3E%3C/svg%3E");
    background-position: left -75px top 78%;
    background-size: 400px;
    background-color: #2b79ad !important;
    /* background-position-x: 20px start; */
    transform: rotate(180deg);
    opacity: 0.8;
}
</style>
