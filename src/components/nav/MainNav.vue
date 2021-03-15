<template>
    <div>
        <!-- watch page nav drawer is temporary, but causes layout shifting from hiding/unhiding -->
        <!-- create two different instances as a work around -->
        <NavDrawer :pages="pages" v-model="drawer" v-if="!isMobile && !isWatchPage" />
        <NavDrawer :pages="pages" v-model="drawer" v-if="!isMobile && isWatchPage" :temporary="true" />
        <!--* nav drawer is for the left --->
        <BottomNav :pages="pages.filter((page) => !page.collapsible)" v-if="isMobile" :active="!isWatchPage" />
        <!-- <music-bar></music-bar> -->
        <MusicBar2 />
        <!--* bottom bar --->

        <v-app-bar
            id="top-bar"
            :class="{
                'secondary darken-3': darkMode,
                'primary lighten-1': !darkMode,
            }"
            :app="!isWatchPage"
            clipped-left
            flat
            v-show="!(isMobile && isWatchPage) && !isMultiView"
        >
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
                <v-toolbar-title style="overflow: visible" :class="{ 'pa-0': isMobile }">
                    <router-link to="/">
                        <Logo width="24" height="24" style="margin-bottom: -4px" v-if="!isMobile" />
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
                                    <span
                                        :key="currentOrg"
                                        style="text-decoration: underline"
                                        :class="{
                                            'grey--text text--darken-4': !darkMode,
                                            'grey-text text--lighten-2': darkMode,
                                        }"
                                        >{{ ORGS_PREFIX[currentOrg] || currentOrg }}</span
                                    >
                                </transition>
                                <span
                                    class="primary--text"
                                    :class="{ 'text--lighten-2': darkMode, 'text--darken-4': !darkMode }"
                                    ref="dexBtn"
                                    >dex</span
                                >
                                <v-tooltip
                                    v-model="firstVisitComputed"
                                    right
                                    bottom
                                    z-index="120"
                                    content-class="first-visit-tooltip"
                                >
                                    <template v-slot:activator="{}">
                                        <v-icon
                                            size="30"
                                            class="change-org-icon"
                                            :class="{ 'rotate-180': attrs['aria-expanded'] === 'true' }"
                                            v-on="on"
                                        >
                                            {{ icons.mdiMenuDown }}
                                        </v-icon>
                                    </template>
                                    <div>{{ $t("views.app.nowSupportsMultiOrg") }}</div>
                                    <div>{{ $t("views.app.loginCallToAction") }}</div>
                                </v-tooltip>

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
                            <v-icon v-if="!($store.state.userdata && $store.state.userdata.user)">{{
                                icons.mdiAccountCircleOutline
                            }}</v-icon>
                            <v-avatar size="40" v-else>
                                <img
                                    :src="`https://avatars.dicebear.com/api/jdenticon/${$store.state.userdata.user.id}.svg`"
                                    alt="Avatar generated by your user ID"
                                />
                            </v-avatar>
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
                            <v-list-item-title> {{ $t("component.mainNav.about") }} </v-list-item-title>
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
import { mdiInfinity } from "@mdi/js";
import { mapState } from "vuex";
import NavDrawer from "./NavDrawer";
import BottomNav from "./BottomNav";
import MusicBar2 from "./MusicBar2";

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
        MusicBar2,
        MusicBar: () => import("./MusicBar"),
    },
    data() {
        return {
            drawer: null,
            temporary: false,
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
        darkMode() {
            return this.$store.state.settings.darkMode;
        },
        isWatchPage() {
            return ["watch_id", "watch", "mugen-clips", "edit_video", "multiview"].includes(this.$route.name);
        },
        isMultiView() {
            return this.$route.name === "multiview";
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
        firstVisitComputed: {
            get() {
                return this.$store.state.firstVisit;
            },
            set() {
                return this.$store.commit("setVisited");
            },
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
                    name: "MultiView",
                    path: "/multiview",
                    icon: icons.mdiDotsGrid,
                    collapsible: true,
                },
                {
                    name: this.$t("component.mainNav.MugenClips"),
                    path: "/infinite",
                    icon: mdiInfinity,
                    collapsible: true,
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
        ...mapState(["firstVisit"]),
    },
    created() {
        // eslint-disable-next-line no-unused-vars
        this.$router.afterEach((to, from) => {
            this.refreshing = false;
        });

        if (this.$store.state.firstVisit) {
            const vm = this;
            setTimeout(() => {
                vm.$store.commit("setVisited");
            }, 30000);
            setTimeout(() => {
                // eslint-disable-next-line no-unused-vars
                const menu = vm.$refs.dexBtn;
                menu.click();
            }, 10000);
        }
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
    watch: {
        isWatchPage() {
            // close drawer on watch page
            this.drawer = !this.isWatchPage;
        },
    },
};
</script>

<style scoped>
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
    /* background-color: #2b79ad !important; */
    padding-left: min(calc(env(safe-area-inset-left)), 30px);
    padding-right: min(calc(env(safe-area-inset-right)), 30px);
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

.first-visit-tooltip {
    width: 80%;
    max-width: 480px;
    background: rgb(91, 157, 211);
    font-weight: 500;
    box-shadow: 2px 2px 4px black;
}
.first-visit-tooltip:before {
    content: "";
    position: absolute;
    top: -10px;
    left: 105px;
    width: 0;
    border-bottom: 10px solid rgb(91, 157, 211);
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
}
.nav-title {
    text-decoration: none;
    font-size: 24px;
    line-height: 1.2px;
}

.rotate-180 {
    transform: rotate(180deg);
}
</style>
