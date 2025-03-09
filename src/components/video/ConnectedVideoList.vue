<template>
  <div
    v-show="
      !hasError && !(isFavPage && !(isLoggedIn && favoriteChannelIDs.size > 0))
    "
  >
    <v-col
      v-show="!$vuetify.breakpoint.isXs"
      xs="4"
      sm="4"
      class="ma-0 pb-0 pt-0"
    >
      <portal
        :to="portalName"
        :disabled="$vuetify.breakpoint.xs"
        class="justify-space-between d-flex flex-grow-1 mx-n2"
      >
        <!-- <v-btn text icon to="/login#calendar">
          <v-icon>{{ mdiCalendar }}</v-icon>
        </v-btn> -->

        <v-menu
          :close-on-content-click="false"
          offset-y
          left
          min-width="300px"
          max-width="300px"
        >
          <template #activator="{ on, attrs }">
            <v-btn
              text
              icon
              v-bind="attrs"
              v-on="on"
            >
              <v-icon>{{ mdiFilterVariant }}</v-icon>
            </v-btn>
          </template>
          <v-sheet class="pa-6" rounded="none" border-color="primary">
            <v-select
              v-if="tab === Tabs.LIVE_UPCOMING"
              v-model="sortBy"
              label="Sort By"
              :items="sortOptions"
              hide-details
            />
            <v-menu
              v-show="isActive"
              v-if="tab !== Tabs.LIVE_UPCOMING"
              v-model="datePicker"
              :close-on-content-click="false"
              offset-y
              offset-x
              left
              min-width="auto"
            >
              <template #activator="{ on, attrs }">
                <v-text-field
                  v-model="toDate"
                  label="Uploaded Before"
                  readonly
                  hide-details
                  regular
                  clearable
                  v-bind="attrs"
                  v-on="on"
                />
              </template>
              <v-date-picker v-model="toDate" @input="datePicker = false" />
            </v-menu>
            <video-list-filters />
          </v-sheet>
        </v-menu>

        <v-btn text icon @click="toggleDisplayMode">
          <v-icon>{{ displayIcon }}</v-icon>
        </v-btn>
      </portal>
    </v-col>
    <template v-if="tab === Tabs.LIVE_UPCOMING">
      <SkeletonCardList
        v-if="isLoading"
        :cols="colSizes"
        :dense="currentGridSize > 0"
      />
      <div v-if="lives.length || upcoming.length">
        <VideoCardList
          :videos="homeViewMode === 'grid' ? lives : live"
          include-channel
          :include-avatar="shouldIncludeAvatar"
          :cols="colSizes"
          :dense="currentGridSize > 0"
          :filter-config="filterConfig"
          :dense-list="homeViewMode === 'denseList'"
          :horizontal="homeViewMode === 'list'"
          v-bind="$attrs"
          v-on="$listeners"
        />
        <template v-if="homeViewMode === 'grid'">
          <v-divider v-if="lives.length" class="my-3 secondary" />
          <VideoCardList
            :videos="upcoming"
            include-channel
            :include-avatar="shouldIncludeAvatar"
            :cols="colSizes"
            :dense="currentGridSize > 0"
            :filter-config="filterConfig"
            :dense-list="homeViewMode === 'denseList'"
            :horizontal="homeViewMode === 'list'"
            v-bind="$attrs"
            v-on="$listeners"
          />
        </template>
      </div>
      <div
        v-show="!isLoading && lives.length == 0 && upcoming.length == 0"
        class="ma-auto pa-5 text-center"
      >
        {{ $t("views.home.noStreams") }}
      </div>
    </template>

    <template v-else>
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
            :filter-config="filterConfig"
            v-bind="$attrs"
            :dense-list="homeViewMode === 'denseList'"
            :horizontal="homeViewMode === 'list'"
            v-on="$listeners"
          />
          <!-- only show SkeletonCardList if it's loading -->
          <SkeletonCardList
            v-if="lod"
            :cols="colSizes"
            :dense="currentGridSize > 0"
            :dense-list="homeViewMode === 'denseList'"
            :horizontal="homeViewMode === 'list'"
          />
        </generic-list-loader>
      </keep-alive>
    </template>
  </div>
</template>

<script lang="ts">
import { mapState, mapGetters } from "vuex";
import backendApi from "@/utils/backend-api";

import GenericListLoader from "@/components/video/GenericListLoader.vue";
import SkeletonCardList from "@/components/video/SkeletonCardList.vue";
import VideoCardList from "@/components/video/VideoCardList.vue";
import { dayjs } from "@/utils/time";
import {
    mdiCalendarEnd,
    mdiFilterVariant,
    mdiFormatListBulleted,
    mdiViewList,
} from "@mdi/js";
import { syncState } from "@/utils/functions";
import VideoListFilters from "../setting/VideoListFilters.vue";

function nearestUTCDate(date) {
    return date.add(1, "day").toDate().toISOString();
}

export default {
    name: "ConnectedVideoList",
    components: {
        VideoCardList,
        // VideoCondensedList,
        // LoadingOverlay,
        GenericListLoader,
        SkeletonCardList,
        VideoListFilters,
    },
    props: {
        liveContent: {
            type: Array,
            default: null,
        },
        isFavPage: {
            type: Boolean,
            default: false,
        },
        tab: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        datePortalName: {
            type: String,
            default: "",
        },
    },
    data() {
        return {
            mdiCalendarEnd,
            mdiFilterVariant,
            mdiFormatListBulleted,
            mdiViewList,
            identifier: Date.now(),
            pageLength: 24,
            Tabs: Object.freeze({
                LIVE_UPCOMING: 0,
                ARCHIVE: 1,
                CLIPS: 2,
                COLLABS: 3,
                // LIST: 4,
            }),
            datePicker: false,
            toDate: null,
            sortBy: "latest",
            sortOptions: [
                {
                    text: "Latest",
                    value: "latest",
                },
                {
                    text: "Most Viewers",
                    value: "viewers",
                },
            ],
        };
    },
    computed: {
        ...syncState("settings", ["homeViewMode"]),
        ...mapState("home", {
            h_live: "live",
            h_isLoading: "isLoading",
            h_hasError: "hasError",
        }),
        ...mapState("favorites", {
            f_live: "live",
            f_isLoading: "isLoading",
            f_hasError: "hasError",
        }),
        ...mapGetters("favorites", ["favoriteChannelIDs"]),
        isLoggedIn() {
            return this.$store.getters.isLoggedIn;
        },
        live() {
            let live = (this.liveContent?.length && this.liveContent)
                || (this.isFavPage ? this.f_live : this.h_live);
            if (this.sortBy === "viewers") {
                live = [...live].sort(
                    (a, b) => (b.live_viewers || 0) - (a.live_viewers || 0),
                );
            }
            return live;
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
            return (
                this.tab !== this.Tabs.CLIPS
                && this.$store.state.settings.hideCollabStreams
                && (this.isFavPage
                    ? true
                    : this.$store.state.currentOrg.name !== "All Vtubers")
            );
        },
        lives() {
            return this.live.filter((v) => v.status === "live");
        },
        upcoming() {
            const upcoming = this.live.filter((v) => v.status === "upcoming");
            upcoming.sort((v1, v2) => {
                if (v1.available_at !== v2.available_at) return 0;
                const v1IsPlaceholder = v1.type === "placeholder";
                const v2IsPlaceholder = v2.type === "placeholder";
                if (v1IsPlaceholder && v2IsPlaceholder) return 0;
                return v1IsPlaceholder ? 1 : -1;
            });
            return upcoming;
        },
        portalName() {
            return this.datePortalName || `date-selector${this.isFavPage}`;
        },
        filterConfig() {
            return {
                forOrg: this.isFavPage ? "none" : null,
                hideCollabs: this.shouldHideCollabs,
                hidePlaceholder: this.$store.state.settings.hidePlaceholder,
                hideMissing: this.$store.state.settings.hideMissing,
            };
        },

        displayIcon() {
            switch (true) {
                case this.homeViewMode === "list":
                    return mdiFormatListBulleted;
                case this.homeViewMode === "denseList":
                    return this.icons.mdiViewGrid;
                case this.currentGridSize === 1:
                    return this.icons.mdiViewComfy;
                case this.currentGridSize === 2:
                    return mdiViewList;
                default:
                    return this.icons.mdiViewModule;
            }
        },
    },
    watch: {
        // eslint-disable-next-line func-names
        "$store.state.currentOrg": function () {
            this.init();
        },
        toDate() {
            this.identifier = Date.now();
        },
        tab() {
            // Scroll to top
            this.$nextTick(() => {
                window.scrollTo(0, 0);
            });
        },
    },
    created() {
        console.log("Created, so adding refresh timer to HomeFav");
        this.init(true); // try updating favorites if it's actually favorites page.
        this.tabToQueryMap = Object.freeze({
            [this.Tabs.ARCHIVE]: Object.freeze({
                status: "past,missing",
                type: "stream",
                include: "mentions,clips",
            }),
            [this.Tabs.CLIPS]: Object.freeze({
                status: "past",
                type: "clip",
                include: "mentions",
            }),
            [this.Tabs.COLLABS]: Object.freeze({
                // status: "new,upcoming,live,past,missing", // Include all status
                type: "stream",
                include: "mentions",
            }),
        });
    },
    methods: {
        toggleDisplayMode() {
            const viewModes = ["grid", "list", "denseList"];
            const nextViewMode = viewModes[
                (viewModes.indexOf(this.homeViewMode) + 1) % viewModes.length
            ];

            if (this.homeViewMode === "grid" && this.currentGridSize < 2) {
                this.currentGridSize += 1;
            } else {
                this.homeViewMode = nextViewMode;
                this.currentGridSize = 0;
            }
        },
        init(updateFavorites) {
            if (this.isFavPage) {
                if (updateFavorites) this.$store.dispatch("favorites/fetchFavorites");
                if (this.favoriteChannelIDs.size > 0 && this.isLoggedIn) {
                    this.$store.dispatch("favorites/fetchLive", {
                        force: true,
                        minutes: 2,
                    });
                }
            } else if (!this.liveContent?.length) {
                this.$store.commit("home/resetState");
                this.$store.dispatch("home/fetchLive", { force: true });
            }
            this.identifier = Date.now();
        },
        reload() {
            this.init();
        },
        getLoadFn() {
            const query = {
                ...(this.tabToQueryMap[this.tab] ?? {}),
                lang: this.$store.state.settings.clipLangs.join(","),
                paginated: !this.scrollMode,
                ...(this.toDate && {
                    to: nearestUTCDate(dayjs(this.toDate ?? undefined)),
                }),
                max_upcoming_hours: 1,
            };
            return async (offset: any, limit: any) => {
                let res = null;
                // Handle backend query depending on page
                if (this.isFavPage) {
                    // Favourites Page
                    res = await backendApi
                        .favoritesVideos(this.$store.state.userdata.jwt, {
                            ...query,
                            limit,
                            offset,
                        })
                        .catch((err) => {
                            console.error(err);
                            this.$store.dispatch("loginVerify", { bounceToLogin: true }); // check if the user is actually logged in.
                            throw err;
                        });
                } else {
                    // Home Page
                    res = await backendApi
                        .videos({
                            ...query,
                            org: this.$store.state.currentOrg.name,
                            limit,
                            offset,
                        });
                }
                // Handle collab tab
                if (this.tab === this.Tabs.COLLABS) {
                    res.data.items = res.data.items.filter(
                        // Filter only for videos with mentions (collabs)
                        (obj) => (Array.isArray(obj.mentions) && obj.mentions.length > 0),
                    );
                }
                return res?.data;
            };
        },
    },
};
</script>

<style></style>
