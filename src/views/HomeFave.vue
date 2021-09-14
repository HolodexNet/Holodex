<template>
  <v-container
    v-touch="{
      right: () => {
        tab = Math.max(tab - 1, 0);
        changeTab(false);
      },
      left: () => {
        tab = Math.min(tab + 1, 2);
        changeTab(false);
      },
    }"
    fluid
    style="min-height: 100%"
    class="d-flex flex-column"
  >
    <!-- Teleport tabs to nav extension slot -->
    <portal to="mainNavExt" :disabled="!$vuetify.breakpoint.xs || !isActive">
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
        <portal-target v-if="!$vuetify.breakpoint.xs" name="date-selector" class=" v-tab ml-auto" />
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
    <div v-show="!hasError && !(isFavPage && !(isLoggedIn && favoriteChannelIDs.size > 0))">
      <template v-if="tab === Tabs.LIVE_UPCOMING">
        <SkeletonCardList v-if="isLoading" :cols="colSizes" :dense="currentGridSize > 0" />
        <div v-if="lives.length || upcoming.length">
          <VideoCardList
            :videos="lives"
            include-channel
            :include-avatar="shouldIncludeAvatar"
            :cols="colSizes"
            :dense="currentGridSize > 0"
            hide-ignored-topics
            :for-org="isFavPage?'none':null"
            :hide-collabs="shouldHideCollabs"
          />
          <v-divider v-if="lives.length" class="my-3 secondary" />
          <VideoCardList
            :videos="upcoming"
            include-channel
            :include-avatar="shouldIncludeAvatar"
            :cols="colSizes"
            :dense="currentGridSize > 0"
            hide-ignored-topics
            :for-org="isFavPage?'none':null"
            :hide-collabs="shouldHideCollabs"
          />
        </div>
        <div v-show="!isLoading && lives.length == 0 && upcoming.length == 0" class="ma-auto pa-5 text-center">
          {{ $t("views.home.noStreams") }}
        </div>
      </template>

      <template v-else>
        <!-- Archive and Clips section -->
        <v-col
          v-show="!$vuetify.breakpoint.isXs"
          xs="4"
          sm="4"
          style="display: flex; justify-content: flex-end;"
          class="ma-0 pb-0"
        >
          <portal to="date-selector" :disabled="$vuetify.breakpoint.xs">
            <v-menu
              v-model="datePicker"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              left
              min-width="auto"
            >
              <template #activator="{ on, attrs }">
                <v-text-field
                  v-model="toDate"
                  label="Up to"
                  :prepend-icon="mdiCalendarEnd"
                  readonly
                  hide-details
                  dense
                  regular
                  clearable
                  single-line
                  style="opacity: 0.7; max-width: 170px;"
                  v-bind="attrs"
                  v-on="on"
                />
              </template>
              <v-date-picker
                v-model="toDate"
                @input="datePicker = false"
              />
            </v-menu>
          </portal>
        </v-col>

        <keep-alive>
          <generic-list-loader
            v-slot="{ data, isLoading: lod }"
            :key="'vlx-' + tab + identifier + isFavPage"
            :infinite-load="scrollMode"
            :paginate="!scrollMode"
            :per-page="pageLength"
            :load-fn="getLoadFn()"
          >
            <!-- only keep VideoCardList rendered if scrollMode OR it's not loading. -->
            <VideoCardList
              v-show="scrollMode || !lod"
              :videos="data"
              include-channel
              :cols="colSizes"
              :dense="currentGridSize > 0"
              hide-ignored-topics
              :hide-collabs="shouldHideCollabs"
              :for-org="isFavPage?'none':null"
            />
            <!-- only show SkeletonCardList if it's loading -->
            <SkeletonCardList v-if="lod" :cols="colSizes" :dense="currentGridSize > 0" />
          </generic-list-loader>
        </keep-alive>
      </template>
    </div>
  </v-container>
</template>

<script lang="ts">
import { mapState, mapGetters } from "vuex";
import { mdiCalendarEnd } from "@mdi/js";

import reloadable from "@/mixins/reloadable";
import isActive from "@/mixins/isActive";
import backendApi from "@/utils/backend-api";

import GenericListLoader from "@/components/video/GenericListLoader.vue";
import SkeletonCardList from "@/components/video/SkeletonCardList.vue";
import VideoCardList from "@/components/video/VideoCardList.vue";
import LoadingOverlay from "@/components/common/LoadingOverlay.vue";
import { localizedDayjs } from "@/utils/time";

function localToUTC(date) {
    return localizedDayjs(date).add(1, "day").toDate().toISOString();
}

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
        VideoCardList,
        LoadingOverlay,
        GenericListLoader,
        SkeletonCardList,
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
            identifier: Date.now(),
            pageLength: 24,
            tab: 0,
            Tabs: Object.freeze({
                LIVE_UPCOMING: 0,
                ARCHIVE: 1,
                CLIPS: 2,
            }),
            refreshTimer: null,
            datePicker: false,
            toDate: null,

            mdiCalendarEnd,
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
        scrollMode() {
            return this.$store.state.settings.scrollMode;
        },
        currentGridSize: {
            get() {
                return this.$store.state.currentGridSize;
            },
            set(val) {
                this.$store.commit("setCurrentGridSize", val);
            },
        },
        colSizes() {
            return {
                xs: 1 + this.currentGridSize,
                sm: 2 + this.currentGridSize,
                md: 3 + this.currentGridSize,
                lg: 4 + this.currentGridSize,
                xl: 5 + this.currentGridSize,
            };
        },
        shouldIncludeAvatar() {
            if (this.$vuetify.breakpoint.md && this.currentGridSize > 1) return false;
            if (this.$vuetify.breakpoint.sm && this.currentGridSize > 0) return false;
            if (this.$vuetify.breakpoint.xs && this.currentGridSize > 0) return false;
            return true;
        },
        shouldHideCollabs() {
            return this.tab !== this.Tabs.CLIPS && this.$store.state.settings.hideCollabStreams && (this.isFavPage ? true : this.$store.state.currentOrg.name !== "All Vtubers");
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
            if (this.isActive && this.$store.state.visibilityState === "visible") {
                this.$store.dispatch("home/fetchLive", { force: false });
            }
        },
        tab() {
            // Scroll to top
            this.$nextTick(() => {
                window.scrollTo(0, 0);
            });
            this.changeTab();
        },
        toDate() {
            this.identifier = Date.now();
        },
    },
    created() {
        this.init(true); // try updating favorites if it's actually favorites page.
        this.setAutoRefresh();
    },
    activated() {
        this.changeTab(true);
        this.setAutoRefresh();
    },
    deactivated() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    },
    beforeDestroy() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    },
    methods: {
        setAutoRefresh() {
            if (this.refreshTimer) clearInterval(this.refreshTimer);
            this.refreshTimer = setInterval(() => {
                this.$store.dispatch("home/fetchLive", { force: false });
            }, 2 * 60 * 1000);
        },
        changeTab(preservePage = true) {
            // Sync the hash to current tab
            const toHash = {
                0: "",
                1: "archive",
                2: "clips",
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
        init(updateFavorites) {
            if (this.isFavPage) {
                if (updateFavorites) this.$store.dispatch("favorites/fetchFavorites");
                if (this.favoriteChannelIDs.size > 0 && this.isLoggedIn) {
                    this.$store.dispatch("favorites/fetchLive", { force: true, minutes: 2 });
                }
            } else {
                this.$store.commit("home/resetState");
                this.$store.dispatch("home/fetchLive", { force: true });
            }
            this.identifier = Date.now();

            switch (this.$route.hash) {
                case "#archive":
                    this.tab = this.Tabs.ARCHIVE;
                    break;
                case "#clips":
                    this.tab = this.Tabs.CLIPS;
                    break;
                default:
                    this.tab = this.Tabs.LIVE_UPCOMING;
                    break;
            }
        },
        // called from mixin, simulate reload
        reload() {
            this.init();
        },
        getLoadFn() {
            if (this.isFavPage) {
                return async (offset, limit) => {
                    const res = await backendApi
                        .favoritesVideos(this.$store.state.userdata.jwt, {
                            status: "past",
                            ...{ type: this.tab === this.Tabs.ARCHIVE ? "stream" : "clip" },
                            include: "clips",
                            lang: this.$store.state.settings.clipLangs.join(","),
                            paginated: !this.scrollMode,
                            to: this.toDate ? this.toDate : undefined,
                            limit,
                            offset,
                        })
                        .catch((err) => {
                            console.error(err);
                            this.$store.dispatch("loginVerify"); // check if the user is actually logged in.
                            throw err;
                        });
                    return res.data;
                };
            }
            // home page function
            return async (offset, limit) => {
                const res = await backendApi.videos({
                    status: "past",
                    ...{ type: this.tab === this.Tabs.ARCHIVE ? "stream" : "clip" },
                    include: "clips",
                    org: this.$store.state.currentOrg.name,
                    lang: this.$store.state.settings.clipLangs.join(","),
                    paginated: !this.scrollMode,
                    to: this.toDate ? localToUTC(this.toDate) : undefined,
                    limit,
                    offset,
                });
                return res.data;
            };
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
