<template>
  <v-container
    v-touch="{
      right: (e) => {
        if(e.offsetX < 50) return;
        tab = Math.max(tab - 1, 0);
        changeTab(false);
      },
      left: (e) => {
        if(e.offsetX > -50) return;
        tab = Math.min(tab + 1, 2);
        changeTab(false);
      },
    }"
    fluid
    style="min-height: 100%"
    class="d-flex flex-column"
  >
    <!-- Teleport tabs to nav extension slot -->
    <portal to="mainNavExt" :disabled="!$vuetify.breakpoint.xs || !isActive" style="position: sticky; top: 56px; z-index: 2">
      <v-tabs
        v-model="tab"
        :centered="$vuetify.breakpoint.xs"
        :class="$store.state.settings.darkMode ? 'secondary darken-1' : 'primary lighten-1'"
        :active-class="
          $store.state.settings.darkMode ? 'primary--text text--lighten-3' : 'primary--text text--darken-2'
        "
        @change="changeTab(false)"
      >
        <v-tab class="pa-2">
          {{ liveUpcomingHeaderSplit[1] }}
          <span class="stream-count-chip mx-1 rounded-md primary white--text rounded-lg pa-1">
            {{ lives.length }}
          </span>
          {{ liveUpcomingHeaderSplit[2] }}
          <span class="stream-count-chip ml-1 rounded-md primary white--text rounded-lg pa-1">
            {{ upcoming.length }}
          </span>
        </v-tab>
        <v-tab class="pa-2">
          {{ $t("views.home.recentVideoToggles.official") }}
        </v-tab>
        <v-tab class="pa-2">
          {{ $t("views.home.recentVideoToggles.subber") }}
        </v-tab>
        <v-tab class="pa-2">
          {{ $t("views.home.recentVideoToggles.collabs") }}
        </v-tab>
        <portal-target v-if="!$vuetify.breakpoint.xs" :name="`date-selector${isFavPage}`" class=" v-tab ml-auto" />
      </v-tabs>
    </portal>

    <template v-if="isFavPage && !(isLoggedIn && favoriteChannelIDs.size > 0)">
      <div class="ma-auto d-flex flex-column align-center">
        <v-icon color="primary" large>
          {{ icons.mdiHeart }}
        </v-icon>
        <div class="text-body-1 text-center" v-html="$t('views.favorites.promptForAction')" />
        <v-btn :to="isLoggedIn ? '/channel' : '/login'">
          {{ isLoggedIn ? $t("views.favorites.manageFavorites") : $t("component.mainNav.login") }}
        </v-btn>
      </div>
    </template>

    <LoadingOverlay :is-loading="false" :show-error="hasError" />
    <connected-video-list
      ref="videoList"
      :is-fav-page="isFavPage"
      :tab="tab"
      :is-active="isActive"
    />
  </v-container>
</template>

<script lang="ts">
import { mapState, mapGetters } from "vuex";
import reloadable from "@/mixins/reloadable";
import isActive from "@/mixins/isActive";
import ConnectedVideoList from "@/components/video/ConnectedVideoList.vue";
import LoadingOverlay from "@/components/common/LoadingOverlay.vue";

export default {
    name: "HomeFave",
    metaInfo() {
        const vm = this;
        return {
            get title() {
                if (vm.isFavPage) return `${vm.$t("component.mainNav.favorites")} - Holodex`;
                return "Holodex";
            },
        };
    },
    components: {
        LoadingOverlay,
        ConnectedVideoList,
    },
    mixins: [reloadable, isActive],
    props: {
        isFavPage: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            tab: 0,
            Tabs: Object.freeze({
                LIVE_UPCOMING: 0,
                ARCHIVE: 1,
                CLIPS: 2,
                COLLABS: 3,
                LIST: 4,
            }),
            refreshTimer: null,
        };
    },
    computed: {
        ...mapState("home", { h_live: "live", h_isLoading: "isLoading", h_hasError: "hasError" }),
        ...mapState("favorites", { f_live: "live", f_isLoading: "isLoading", f_hasError: "hasError" }),
        ...mapGetters("favorites", ["favoriteChannelIDs"]),
        isLoggedIn() {
            return this.$store.getters.isLoggedIn;
        },
        live() {
            return this.isFavPage ? this.f_live : this.h_live;
        },
        isLoading() {
            return this.isFavPage ? this.f_isLoading : this.h_isLoading;
        },
        hasError() {
            return this.isFavPage ? this.f_hasError : this.h_hasError;
        },
        lives() {
            return this.live.filter((v) => v.status === "live");
        },
        upcoming() {
            return this.live.filter((v) => v.status === "upcoming");
        },
        liveUpcomingHeaderSplit() {
            return this.$t("views.home.liveOrUpcomingHeading").match(/(.+)([\\/／・].+)/);
        },
    },
    watch: {
        favoriteChannelIDs: {
            deep: true,
            handler() {
                if (this.isFavPage) this.init(false);
                // otherwise ignore.
            },
        },
        // eslint-disable-next-line func-names
        "$store.state.currentOrg": function () {
            this.init();
        },
        // eslint-disable-next-line func-names
        "$store.state.visibilityState": function () {
            console.log("visibility state changed (in HomeFave)");
            if (this.isActive && this.$store.state.visibilityState === "visible") {
                console.log("attempting refetching (if cadence allows)");
                if (this.isFavPage) {
                    this.$store.dispatch("favorites/fetchLive", { force: false });
                } else {
                    this.$store.dispatch("home/fetchLive", { force: false });
                }
            }
        },
        tab() {
            // Scroll to top
            this.$nextTick(() => {
                window.scrollTo(0, 0);
            });
            this.changeTab();
        },
    },
    created() {
        console.log("Created, so adding refresh timer to HomeFav");
        this.init(true); // try updating favorites if it's actually favorites page.
        this.setAutoRefresh();
    },
    activated() {
        console.log("Activated, so adding refresh timer to HomeFav");
        this.changeTab(true);
        this.setAutoRefresh();
    },
    deactivated() {
        if (this.refreshTimer) {
            console.log("Navigating away, so deleting the refresh timer in HomeFav");
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    },
    beforeDestroy() {
        console.log("Destroying, so deleting the refresh timer in HomeFav");
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    },
    methods: {
        setAutoRefresh() {
            if (this.refreshTimer) clearInterval(this.refreshTimer);
            this.refreshTimer = setInterval(() => {
                if (this.isFavPage) {
                    this.$store.dispatch("favorites/fetchLive", { force: false });
                } else {
                    this.$store.dispatch("home/fetchLive", { force: false });
                }
            }, 2 * 60 * 1000);
        },
        changeTab(preservePage = true) {
            // Sync the hash to current tab
            const toHash = {
                0: "",
                1: "archive",
                2: "clips",
                3: "collabs",
                4: "list",
            };
            this.$router
                .replace({
                    // set page to 0 if on scroll mode
                    query: preservePage && {
                        ...this.$route.query,
                    },
                    hash: toHash[this.tab] || "",
                })
                .catch(() => {
                    // Navigation duplication error expected, catch it and move on
                });
        },
        // updateFavorites
        init(updateFavorites = false) {
            switch (this.$route.hash) {
                case "#archive":
                    this.tab = this.Tabs.ARCHIVE;
                    break;
                case "#clips":
                    this.tab = this.Tabs.CLIPS;
                    break;
                case "#collabs":
                    this.tab = this.Tabs.COLLABS;
                    break;
                case "#list":
                    this.tab = this.Tabs.LIST;
                    break;
                default:
                    this.tab = this.Tabs.LIVE_UPCOMING;
                    break;
            }
            this.$refs.videoList?.init(updateFavorites);
        },
        // called from mixin, simulate reload
        reload() {
            this.init();
        },
    },
};
</script>

<style>
.v-slide-group__prev--disabled {
    display: none !important;
}
/* shared with favorites.vue */
.stream-count-chip {
    letter-spacing: normal;
    min-width: 24px;
}
</style>
