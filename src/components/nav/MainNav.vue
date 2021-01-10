<template>
    <div>
        <NavDrawer :pages="pages" v-model="drawer" v-if="!isMobile" />
        <!--* nav drawer is for the left --->
        <BottomNav :pages="pages.filter((page) => !page.collapsible)" v-if="isMobile && !isWatchPage" />
        <!--* bottom bar --->

        <v-app-bar id="top-bar" class="blue lighten-1" :app="!isMobile" clipped-left flat>
            <!--=============================== Top Bar (Regular View) =============================-->

            <template v-if="!isMobile || (isMobile && !searchBarExpanded)">
                <!--================= Back button ⬅️ (Mobile only) ================-->

                <v-app-bar-nav-icon @click.stop="goBack()" v-if="isMobile && isFirstPage">
                    <v-icon>{{ icons.mdiArrowLeft }}</v-icon>
                </v-app-bar-nav-icon>

                <!--================= Logo & Search Bar (Space permitting) ================-->

                <v-app-bar-nav-icon @click.stop="drawer = !drawer" v-if="!isMobile">
                    <v-icon>{{ icons.mdiMenu }}</v-icon>
                </v-app-bar-nav-icon>
                <v-toolbar-title style="overflow: visible">
                    <router-link to="/">
                        <Logo width="24" height="24" style="margin-bottom: -4px" />
                    </router-link>
                    <v-menu bottom offset-y>
                        <template v-slot:activator="{ on, attrs }">
                            <div
                                v-bind="attrs"
                                v-on="on"
                                class="d-inline nav-title"
                                :class="isMobile ? 'nav-title-slim' : ''"
                                style="position: relative"
                            >
                                <transition name="fade" mode="out-in">
                                    <span :key="currentOrg" style="text-decoration: underline">{{
                                        ORGS_PREFIX[currentOrg] || currentOrg
                                    }}</span>
                                </transition>
                                <span class="primary--text text--lighten-2">dex</span>
                                <v-icon
                                    size="30"
                                    class="change-org-icon"
                                    :class="{ 'rotate-180': attrs['aria-expanded'] === 'true' }"
                                >
                                    {{ icons.mdiMenuDown }}
                                </v-icon>
                                <!-- 
                                    <div style="position: absolute; bottom: -6px; left: 0px; font-size: 12px;" 
                                        class="text--secondary">
                                    Select Org</div> -->
                            </div>
                        </template>

                        <v-list style="max-height: 300px; overscroll-behavior: contain" class="overflow-y-auto">
                            <v-list-item
                                v-for="org in ORGS"
                                :key="org"
                                @click="currentOrg = org"
                                :input-value="currentOrg === org"
                            >
                                <v-list-item-title>{{ org }}</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </v-toolbar-title>
                <SearchBar v-if="!isMobile" key="main-search-bar" />

                <!--================= Account [👤] Button (Desktop Only) ================-->

                <v-menu left offset-y transition="slide-y-transition" v-if="!isMobile">
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn icon v-bind="attrs" v-on="on">
                            <v-icon>{{ icons.mdiAccountCircleOutline }}</v-icon>
                        </v-btn>
                    </template>

                    <user-card></user-card>
                    <!--todo user card here. -->
                </v-menu>

                <!--================= Refresh [⟳] Button (Mobile Only) ================-->

                <v-btn
                    icon
                    class="ml-auto"
                    :class="{ 'refresh-rotate': refreshing }"
                    v-if="isMobile"
                    @click="onRefresh"
                >
                    <v-icon>{{ icons.mdiRefresh }}</v-icon>
                </v-btn>

                <!--================= Search [🔍] Button (Mobile Only) ================-->

                <v-btn icon v-if="isMobile" @click="searchBarExpanded = true">
                    <v-icon>{{ icons.mdiMagnify }}</v-icon>
                </v-btn>

                <!--================= Condensed [⋮] Menu (Mobile Only) ================-->

                <v-menu left offset-y v-if="isMobile">
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn icon v-bind="attrs" v-on="on">
                            <v-icon>{{ icons.mdiDotsVertical }}</v-icon>
                        </v-btn>
                    </template>

                    <v-list v-if="isMobile">
                        <!-- <v-list-item
                            v-for="page in pages.filter((item) => item.collapsible)"
                            :key="page.name"
                            :to="page.path"
                        >
                            <v-list-item-title>
                                {{ page.name }}
                            </v-list-item-title>
                        </v-list-item> -->
                        <user-card></user-card>
                        <v-list-item to="/about" key="about">
                            <v-list-item-icon>
                                <v-icon>{{ icons.mdiHelpCircle }}</v-icon>
                            </v-list-item-icon>
                            <v-list-item-title> About </v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </template>

            <!--=========================== END OF Regular View ===========================-->

            <!--===================== Expanded Search Bar (Mobile Only) =======================-->

            <template v-else>
                <v-app-bar-nav-icon @click="searchBarExpanded = false" class="backButton">
                    <v-icon>{{ icons.mdiClose }}</v-icon>
                </v-app-bar-nav-icon>
                <SearchBar :autofocus="isMobile" key="main-search-bar" />
            </template>

            <!--=================== END OF Expanded Search (Mobile Only) =======================-->
        </v-app-bar>
    </div>
</template>

<script>
import * as icons from "@/utils/icons";
import SearchBar from "@/components/common/SearchBar";
// import SearchBar from "@/components/nav/SearchBarSimple";
import Logo from "@/components/common/Logo";
import UserCard from "@/components/user/UserCard";
import { ORGS, ORGS_PREFIX } from "@/utils/consts";
import NavDrawer from "./NavDrawer";
import BottomNav from "./BottomNav";

/**
 * Returns the index of the last element in the array where predicate is true, and -1
 * otherwise.
 * @param array The source array to search in
 * @param {(value: T, index: number, obj: T[]) => boolean} predicate
 *  find calls predicate once for each element of the array, in descending
 * order, until it finds one where predicate returns true. If such an element is found,
 * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
 */
// function findLastIndex(array, predicate) {
//     let l = array.length;
//     // eslint-disable-next-line no-plusplus
//     while (l--) {
//         if (predicate(array[l], l, array)) return l;
//     }
//     return -1;
// }

export default {
    components: {
        SearchBar,
        NavDrawer,
        BottomNav,
        UserCard,
        Logo,
    },
    data() {
        return {
            drawer: null,
            icons,
            favoritesExpanded: false,
            searchBarExpanded: false,
            refreshing: false,
            ORGS,
            ORGS_PREFIX,
        };
    },
    computed: {
        isMobile() {
            return this.$store.state.isMobile;
        },
        isWatchPage() {
            return this.$route.name === "watch_id" || this.$route.name === "watch";
        },
        currentOrg: {
            get() {
                return this.$store.state.currentOrg;
            },
            set(val) {
                return this.$store.commit("setCurrentOrg", val);
            },
        },
        isFirstPage() {
            return this.$store.state.routerHistory.length > 1;
        },
        pages() {
            return [
                {
                    name: this.$t("component.mainNav.home"),
                    path: "/",
                    icon: icons.mdiHome,
                },
                {
                    name: this.$t("component.mainNav.favorites"),
                    path: "/favorites",
                    icon: icons.mdiHeart,
                },
                {
                    name: this.$t("component.mainNav.channels"),
                    path: "/channel",
                    icon: icons.mdiAccountBoxMultiple,
                },
                {
                    name: this.$t("component.mainNav.library"),
                    path: "/library",
                    icon: icons.mdiAnimationPlay,
                },
                {
                    name: this.$t("component.mainNav.about"),
                    path: "/about",
                    icon: icons.mdiHelpCircle,
                    collapsible: true,
                },
                {
                    name: this.$t("component.mainNav.settings"),
                    path: "/settings",
                    icon: icons.mdiCog,
                    collapsible: true,
                },
                // {
                //     name: "Login",
                //     path: "/login",
                //     icon: icons.mdiLoginVariant,
                //     collapsible: true,
                // },
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
        goBack() {
            // this.$router.go(-1);
            // const historyPaths = this.$store.state.routerHistory;
            // const idx = findLastIndex(historyPaths, (v) => v.match("^/watch"));
            // const returnAmount = idx >= 0? idx - historyPaths.length - 1 : 0;
            // debugger;
            // TODO there's some weirdness here, regarding going back > 1 pages
            // coz the router doesn't understand it that well and our history desync's.
            window.history.go(Math.min(-1, 0));
        },
    },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=PT+Sans+Narrow&display=swap");

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

#top-bar {
    background-color: #2b79ad !important;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}
.fade-enter,
.fade-leave-to {
    opacity: 0;
}

.change-org-icon:focus::after {
    opacity: 0 !important;
}

.nav-title {
    text-decoration: none;
    font-size: 24px;
    line-height: 1.2px;
}
.nav-title.nav-title-slim {
    font-family: "PT Sans Narrow", "Arial Narrow", sans-serif;
}

.rotate-180 {
    transform: rotate(180deg);
}
</style>
