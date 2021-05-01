<template>
    <div>
        <!-- watch page nav drawer is temporary, but causes layout shifting from hiding/unhiding -->
        <!-- create two different instances as a work around -->
        <NavDrawer :pages="pages" v-model="navDrawer" :temporary="isMobile || isWatchPage">
            <!-- <NavDrawer :pages="pages" v-model="drawer2" v-if="isMobile || isWatchPage"  -->
            <template v-if="isMobile">
                <InstallPrompt></InstallPrompt>
                <user-card noSetting inNavDrawer style="background-color: inherit"></user-card>
                <v-divider />
            </template>
        </NavDrawer>
        <!--* nav drawer is for the left --->
        <BottomNav :pages="pages.filter((page) => !page.collapsible)" v-if="isMobile" :active="!isWatchPage" />
        <!-- <music-bar></music-bar> -->
        <MusicBar2 v-if="$store.state.music.isOpen" />
        <!--* bottom bar --->

        <v-app-bar
            id="top-bar"
            :class="{
                'secondary darken-1': darkMode,
                'primary lighten-1': !darkMode,
            }"
            :app="!isWatchPage"
            clipped-left
            flat
            v-show="!(isMobile && isWatchPage) && !isMultiView"
        >
            <!--=============================== Top Bar (Regular View) =============================-->

            <template v-if="!isMobile || (isMobile && !searchBarExpanded)">
                <!--================= Logo & Search Bar (Space permitting) ================-->

                <v-app-bar-nav-icon @click.stop="navDrawer = !navDrawer">
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

                <v-slide-y-transition>
                    <v-btn
                        icon
                        @click="$store.commit('music/openBar')"
                        class="music-bar-open-btn"
                        v-if="!isMobile && $store.state.music.playlist.length > 0 && !$store.state.music.isOpen"
                    >
                        <v-icon>{{ icons.mdiMusic }}</v-icon>
                    </v-btn>
                </v-slide-y-transition>
                <v-menu left offset-y transition="slide-y-transition" v-if="!isMobile">
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn icon v-bind="attrs" v-on="on" class="ml-2">
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

                    <!------- USER CARD ------->
                    <user-card></user-card>
                    <!------- END USER CARD ------->
                </v-menu>

                <!--================= Search [🔍] Button (Mobile Only) ================-->

                <v-btn icon v-if="isMobile" @click="searchBarExpanded = true" class="ml-auto">
                    <v-icon>{{ icons.mdiMagnify }}</v-icon>
                </v-btn>
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
            <div
                :class="{
                    'secondary darken-3': darkMode,
                    'primary lighten-1': !darkMode,
                }"
                style="
                    position: absolute;
                    top: calc(-1 * env(safe-area-inset-top));
                    left: 0px;
                    right: 0px;
                    width: 100%;
                    height: env(safe-area-inset-top);
                    z-index: 300;
                "
            >
                <!-- this is just the element that covers up the notch. don't worry about it. -->
            </div>
        </v-app-bar>
    </div>
</template>

<script lang="ts">
import * as icons from "@/utils/icons";
import SearchBar from "@/components/common/SearchBar.vue";
// import SearchBar from "@/components/nav/SearchBarSimple.vue";
import Logo from "@/components/common/Logo.vue";
import UserCard from "@/components/user/UserCard.vue";
import { ORGS, ORGS_PREFIX } from "@/utils/consts";
import { mdiInfinity } from "@mdi/js";
import { mapState } from "vuex";
import InstallPrompt from "@/components/common/InstallPrompt.vue";
import NavDrawer from "./NavDrawer.vue";
import BottomNav from "./BottomNav.vue";

export default {
    components: {
        SearchBar,
        NavDrawer,
        BottomNav,
        UserCard,
        Logo,
        InstallPrompt,
        MusicBar2: () => import("./MusicBar2.vue"),
    },
    data() {
        return {
            icons,
            favoritesExpanded: false,
            searchBarExpanded: false,
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
                if (this.$route.name === "favorites") this.$router.push({ name: "home" });
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
        navDrawer: {
            get() {
                return this.$store.state.navDrawer;
            },
            set(val) {
                return this.$store.commit("setNavDrawer", val);
            },
        },
        pages() {
            return [
                {
                    name: this.$t("component.mainNav.home"),
                    path: "/home",
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
                    divider: true,
                },
                {
                    name: this.$t("component.mainNav.multiview"),
                    path: "/multiview",
                    icon: icons.mdiViewDashboard,
                    collapsible: true,
                },
                {
                    name: this.$t("component.mainNav.music"),
                    path: "/music",
                    icon: icons.mdiMusic,
                    collapsible: true,
                },
                {
                    name: this.$t("component.mainNav.MugenClips"),
                    path: "/infinite",
                    icon: mdiInfinity,
                    collapsible: true,
                    divider: true,
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
            ];
        },
        // getHeight() {
        //     console.log(this.$vuetify.breakpoint.width);
        //     // ^ very important, causes the function to link reactivity to width changes.
        //     return Number.parseFloat(
        //         getComputedStyle(document.documentElement).getPropertyValue("--sat")) / 1.5 + 64;
        // },
        ...mapState(["firstVisit"]),
    },
    created() {
        if (this.$store.state.firstVisit) {
            const vm = this;
            setTimeout(() => {
                vm.$store.commit("setVisited");
            }, 30000);
        }

        // always pop out nav drawer if it's not watch page or collapsed
        if (
            !window.location.pathname.match("^/watch|^/multiview|^/infinite") &&
            !this.isMobile &&
            !this.$vuetify.breakpoint.md
        ) {
            this.navDrawer = true;
        }
    },
    watch: {
        // toggle navdrawer when navigating between watch pages on desktop
        isWatchPage() {
            if (this.isMobile) return;
            this.navDrawer = !this.isWatchPage;
        },
        // if user is flipping between mobile/desktop breakpoints, keep navdrawer closed
        isMobile() {
            this.navDrawer = false;
        },
    },
};
</script>

<style scoped>
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
    /* padding-top: min(calc(env(safe-area-inset-top) / 2), 30px); */
    /* height: calc(env(safe-area-inset-top,0px) + 30px); */
    padding-top: 0px;
    margin-top: env(safe-area-inset-top, 0px) !important;
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

.music-bar-open-btn {
    animation-timing-function: ease-in-out;
    animation: fadein 5s;
    animation-iteration-count: 1;
}

@keyframes fadein {
    0% {
        opacity: 1;
        background-color: #f06291;
    }
    100% {
        opacity: 1;
        background-color: #f0629100;
    }
}
</style>
