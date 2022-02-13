<template>
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
          v-bind="$attrs"
          v-on="$listeners"
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
          v-bind="$attrs"
          v-on="$listeners"
        />
      </div>
      <div v-show="!isLoading && lives.length == 0 && upcoming.length == 0" class="ma-auto pa-5 text-center">
        {{ $t("views.home.noStreams") }}
      </div>
    </template>

    <template v-if="tab === Tabs.LIST">
        <VideoCondensedList
            :videos="[...lives, ...upcoming]"
        />
    </template>

    <template v-else>
      <!-- Archive and Clips section -->
      <v-col
        v-show="!$vuetify.breakpoint.isXs"
        xs="4"
        sm="4"
        style="display: flex; justify-content: flex-end;"
        class="ma-0 pb-0 pt-0"
      >
        <portal :to="portalName" :disabled="$vuetify.breakpoint.xs">
          <v-menu
            v-show="isActive"
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
            v-bind="$attrs"
            v-on="$listeners"
          />
          <!-- only show SkeletonCardList if it's loading -->
          <SkeletonCardList v-if="lod" :cols="colSizes" :dense="currentGridSize > 0" />
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
import VideoCondensedList from "@/components/video/VideoCondensedList.vue";
// import LoadingOverlay from "@/components/common/LoadingOverlay.vue";
import { dayjs } from "@/utils/time";
import { mdiCalendarEnd } from "@mdi/js";

function nearestUTCDate(date) {
    return date.add(1, "day").toDate().toISOString();
}

export default {
    name: "ConnectedVideoList",
    components: {
        VideoCardList,
        VideoCondensedList,
        // LoadingOverlay,
        GenericListLoader,
        SkeletonCardList,
    },
    props: {
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
            identifier: Date.now(),
            pageLength: 24,
            Tabs: Object.freeze({
                LIVE_UPCOMING: 0,
                ARCHIVE: 1,
                CLIPS: 2,
                LIST: 3,
            }),
            datePicker: false,
            toDate: null,
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
    },
    methods: {
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
        },
        reload() {
            this.init();
        },
        getLoadFn() {
            if (this.isFavPage) {
                return async (offset, limit) => {
                    const res = await backendApi
                        .favoritesVideos(this.$store.state.userdata.jwt, {
                            status: this.tab === this.Tabs.ARCHIVE ? "past,missing" : "past",
                            ...{ type: this.tab === this.Tabs.ARCHIVE ? "stream" : "clip" },
                            include: "clips",
                            lang: this.$store.state.settings.clipLangs.join(","),
                            paginated: !this.scrollMode,
                            to: nearestUTCDate(dayjs(this.toDate ?? undefined)),
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
                    status: this.tab === this.Tabs.ARCHIVE ? "past,missing" : "past",
                    ...{ type: this.tab === this.Tabs.ARCHIVE ? "stream" : "clip" },
                    include: "clips",
                    org: this.$store.state.currentOrg.name,
                    lang: this.$store.state.settings.clipLangs.join(","),
                    paginated: !this.scrollMode,
                    to: nearestUTCDate(dayjs(this.toDate ?? undefined)),
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

</style>
