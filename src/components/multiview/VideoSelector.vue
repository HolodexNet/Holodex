<template>
  <!-- Vertical: -->
  <v-card v-if="!horizontal" class="pa-3">
    <v-row class="flex-column flex-nowrap flex-sm-wrap" style="height: 80vh">
      <v-col
        v-if="$vuetify.breakpoint.xs"
        class="org-dropdown"
        cols="12"
        sm="4"
        md="3"
        lg="2"
        mandatory
      >
        <!-- Dropdown for breakpoint xs -->
        <v-card-title>{{ $t("views.multiview.video.selectLive") }}</v-card-title>

        <org-panel-picker horizontal @changed="handlePicker" />
      </v-col>
      <!-- Full list for greater than xs -->
      <v-col
        v-else
        class="org-list"
        cols="12"
        sm="4"
        md="3"
        lg="2"
        mandatory
        style="min-height: 100%"
      >
        <v-card-title>{{ $t("views.multiview.video.selectLive") }}</v-card-title>

        <org-panel-picker @changed="handlePicker" />
      </v-col>
      <v-col
        ref="container"
        class="video-list"
        cols="12"
        sm="8"
        md="9"
        lg="10"
      >
        <template v-if="isUrl">
          <h4 class="pa-1">
            {{ $t("views.multiview.video.addCustomVideo") }}
          </h4>
          <custom-url-field
            :twitch="selectedOrg.name === 'TwitchURL'"
            @onSuccess="handleVideoClick"
          />
        </template>
        <!-- Favorites when not logged in -->
        <template v-else-if="selectedOrg.name === 'Favorites' && !isLoggedIn">
          <div class="pa-3">
            <div class="text-body-1 text-center" v-html="$t('views.favorites.promptForAction')" />
            <v-btn :to="isLoggedIn ? '/channel' : '/login'">
              {{ isLoggedIn ? $t("views.favorites.manageFavorites") : $t("component.mainNav.login") }}
            </v-btn>
          </div>
        </template>
        <!-- Video Card List for normal content -->
        <template v-else>
          <h4 class="pa-1">
            {{ selectedOrg.name }}
          </h4>
          <div v-if="selectedOrg.name !== 'Playlist'" class="d-flex flex-row">
            <v-btn-toggle v-model="tab" dense>
              <v-btn :value="0">
                {{ $t("views.home.liveOrUpcomingHeading") }}
              </v-btn>
              <v-btn :value="1">
                {{ $t("views.home.recentVideoToggles.official") }}
              </v-btn>
            </v-btn-toggle>
            <portal-target name="date-selector-multiview" class="v-tab ml-auto" />
          </div>
          <VideoCardList
            v-if="selectedOrg.name === 'Playlist'"
            :videos="savedVideosList"
            include-channel
            horizontal
            dense
            disable-default-click
            in-multi-view-selector
            @videoClicked="handleVideoClick"
          />
          <ConnectedVideoList
            v-else
            :tab="tab"
            :is-fav-page="selectedOrg.name === 'Favorites'"
            :hide-placeholder="false"
            :live-content="baseFilteredLive"
            disable-default-click
            dense
            date-portal-name="date-selector-multiview"
            in-multi-view-selector
            @videoClicked="handleVideoClick"
          />
          <div class="d-block" style="height: 120px" />
        </template>
      </v-col>
    </v-row>
  </v-card>
  <!-- Horizontal view for tool bar -->
  <div
    v-else
    class="d-flex align-center overflow-hidden"
  >
    <!-- Drop down -->
    <org-panel-picker horizontal class="d-flex" @changed="handlePicker" />
    <v-icon
      v-if="!isUrl"
      class="d-flex mr-2 ml-1"
      :class="{ 'refresh-spin': isLoading }"
      @click="loadSelection(true)"
    >
      {{ icons.mdiRefresh }}
    </v-icon>
    <!-- Inline text input for custom url -->
    <template v-if="isUrl">
      <custom-url-field
        :twitch="selectedOrg.name === 'TwitchURL'"
        slim
        @onSuccess="handleVideoClick"
      />
    </template>
    <!-- Login prompt for favorites -->
    <template v-else-if="selectedOrg.name === 'Favorites' && !isLoggedIn">
      <div class="d-flex align-center">
        <span class="" v-html="$t('views.app.loginCallToAction')" />
        <v-btn text :to="isLoggedIn ? '/channel' : '/login'">
          {{ $t("component.mainNav.login") }}
        </v-btn>
      </div>
    </template>
    <!-- Channel icons -->
    <template v-else>
      <div ref="videosBar" class="videos-bar d-flex flex-shrink-1 overflow-x-auto overflow-y-hidden" @wheel="scrollHandler">
        <v-tooltip
          v-for="video in topFilteredLive"
          :key="video.id"
          transition="v-fade-transition"
          bottom
        >
          <template #activator="{ on, attrs }">
            <div
              v-bind="attrs"
              style="position: relative; margin-right: 3px; cursor: pointer"
              draggable="true"
              v-on="on"
              @dragstart="(ev) => dragVideo(ev, video)"
            >
              <div
                v-if="video && video.link"
                class="live-badge purple"
                style="left: 0; width: 20px"
              >
                <v-icon small>
                  {{ mdiTwitch }}
                </v-icon>
              </div>

              <div :key="'lvbg' + tick" class="live-badge" :class="video.status === 'live' ? 'red' : 'grey'">
                {{ formatDurationLive(video) }}
              </div>
              <v-avatar size="50" @click="handleVideoClick(video)">
                <ChannelImg :channel="video.channel" :size="50" no-link />
              </v-avatar>
            </div>
          </template>
          <VideoCard
            :video="video"
            disable-default-click
            include-channel
            style="width: 250px"
          />
        </v-tooltip>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import VideoCard from "@/components/video/VideoCard.vue";
import VideoCardList from "@/components/video/VideoCardList.vue";
import ConnectedVideoList from "@/components/video/ConnectedVideoList.vue";
// import LoadingOverlay from "@/components/common/LoadingOverlay.vue";
import ChannelImg from "@/components/channel/ChannelImg.vue";
import { dayjs, formatDurationShort } from "@/utils/time";
import { mapGetters, mapState } from "vuex";
import OrgPanelPicker from "@/components/multiview/OrgPanelPicker.vue";
import filterVideos from "@/mixins/filterVideos";
import { mdiTwitch } from "@mdi/js";
import { syncState } from "@/utils/functions";
import CustomUrlField from "./CustomUrlField.vue";

export default {
    name: "VideoSelector",
    components: {
        VideoCard,
        VideoCardList,
        ConnectedVideoList,
        // LoadingOverlay,
        ChannelImg,
        OrgPanelPicker,
        CustomUrlField,
    },
    mixins: [filterVideos],
    props: {
        horizontal: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        hidePlaceholder: {
            default: true,
            type: Boolean,
        },
        hideMissing: {
            default: true,
            type: Boolean,
        },
    },
    data() {
        return {
            live: [],
            selectedOrg: {},
            isLoading: false,
            hasError: false,
            tick: Date.now(),
            ticker: null,
            refreshTimer: null,
            tab: 0,
            mdiTwitch,
        };
    },
    computed: {
        ...mapGetters("multiview", ["activeVideos"]),
        ...mapState("favorites", { favUpdateTick: "lastLiveUpdate" }),
        ...mapState("home", { homeUpdateTick: "lastLiveUpdate" }),
        ...mapState("playlist", ["active"]),
        ...syncState("settings", [
            "hideCollabStreams",
            "hidePlaceholder",
        ]),
        baseFilteredLive() {
            const filterConfig = {
                ignoreBlock: false,
                // only hide collabs when favorites tab
                hideCollabs: this.shouldHideCollabs,
                forOrg: this.isRealOrg ? this.selectedOrg.name : "none",
                hideIgnoredTopics: true,
                hidePlaceholder: this.hidePlaceholder,
                hideMissing: this.hideMissing,
                hideGroups: true,
            };
            const isTwitchPlaceholder = (v) => (v.type === "placeholder" && v.link?.includes("twitch.tv"));
            const isPlayable = (v) => (v.type === "stream" || isTwitchPlaceholder(v));
            return this.live.filter((l) => this.filterVideos(l, filterConfig) && isPlayable(l));
        },
        topFilteredLive() {
            // Filter out lives for top bar
            let count = 0;
            const limitCount = this.baseFilteredLive.filter((l) => {
                count += 1;
                // Select all live and streams within 2 hours, and expand to 6 hours if cnt < 8
                return (
                    l.status === "live"
                    || dayjs().isAfter(dayjs(l.start_scheduled).subtract(2, "h"))
                    || (count < 8 && dayjs().isAfter(dayjs(l.start_scheduled).subtract(6, "h")))
                );
            })
                .filter((l) => !this.activeVideos.find((v) => v.id === l.id || (v.link && l.link && v.link === l.link)));

            return limitCount;
        },
        isLoggedIn() {
            return this.$store.getters.isLoggedIn;
        },
        savedVideosList() {
            return this.active.videos;
        },
        shouldHideCollabs() {
            return (this.selectedOrg?.name === "Favorites" || this.isRealOrg) && this.$store.state.settings.hideCollabStreams;
        },
        isRealOrg() {
            return !["Favorites", "Playlist", "YouTubeURL", "TwitchURL"].includes(this.selectedOrg.name);
        },
        isUrl() {
            return ["YouTubeURL", "TwitchURL"].includes(this.selectedOrg.name);
        },
    },
    watch: {
        // Watch lastLiveUpdate from favorites module, and fetch new state
        favUpdateTick() {
            if (this.selectedOrg.name === "Favorites") this.live = this.$store.state.favorites.live;
        },
        homeUpdateTick() {
            if (this.isRealOrg) this.live = this.$store.state.home.live;
        },
        // savedVideosList() {
        //     if (this.selectedOrg.name === "Playlist") this.live = this.active.videos;
        // },
        // eslint-disable-next-line func-names
        "$store.state.visibilityState": function () {
            if (this.$store.state.visibilityState === "visible") {
                this.loadSelection();
            }
        },
        isActive(nw) {
            if (nw) this.loadSelection();
        },
    },
    created() {
        this.setAutoRefresh();
        // Start timer to update live time stamps
        this.ticker = setInterval(() => {
            this.tick = Date.now();
        }, 60000);
    },
    beforeDestroy() {
        if (this.ticker) clearInterval(this.ticker);
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    },
    methods: {
        scrollHandler(e) {
            this.$refs.videosBar.scrollLeft += Math.max(-53, Math.min(53, e.deltaY));
        },
        setAutoRefresh() {
            if (this.refreshTimer) clearInterval(this.refreshTimer);
            this.refreshTimer = setInterval(() => {
                this.loadSelection();
            }, 2 * 60 * 1000);
        },
        // Returns a short hand form of time (ie. 33m, 2h)
        formatDurationLive(video) {
            const scheduled = dayjs(video.start_actual || video.start_scheduled);
            // use start_actual or start_scheduled if it has one
            const secs = dayjs(scheduled).diff(dayjs()) / 1000;
            return formatDurationShort(Math.abs(secs));
        },
        handleVideoClick(video) {
            this.$emit("videoClicked", video);
        },
        // Load selected option
        loadSelection(force) {
            // Stop caring about changes if hidden
            if (!this.isActive) return;
            this.isLoading = false;
            this.hasError = false;
            // Do nothing for custom URLs
            if (this.selectedOrg.name === "YouTubeURL" || this.selectedOrg.name === "TwitchURL") {
                return;
            }
            // Delegate dfferent function for favorites
            if (this.selectedOrg.name === "Favorites") {
                this.live = [];
                this.isLoading = true;
                this.$store.dispatch("favorites/fetchLive", { minutes: 2, force }).finally(() => {
                    if (this.selectedOrg.name === "Favorites") {
                        this.isLoading = false;
                        this.live = this.$store.state.favorites.live;
                    }
                });
                return;
            }
            // Delegate for library
            if (this.selectedOrg.name === "Playlist") {
                this.live = this.active.videos;
                return;
            }

            this.live = [];
            this.isLoading = true;
            this.$store.dispatch("home/fetchLive", { force }).finally(() => {
                this.isLoading = false;
                this.live = this.$store.state.home.live;
            });
        },
        dragVideo(ev, video) {
            ev.dataTransfer.setData("text", `https://holodex.net/watch/${video.id}`);
            ev.dataTransfer.setData("application/json", JSON.stringify(video));
        },
        handlePicker(panel) {
            if (this.selectedOrg === panel) return;
            this.selectedOrg = panel;
            this.loadSelection(true);
            if (this.$refs.container) this.$refs.container.scrollTop = 0;
        },
    },
};
</script>

<style>
.org-dropdown {
    flex: 0 0;
}

.org-list {
    flex: 1 1 auto;
    min-height: 0px;
    overflow-y: auto;
    border-right: 1px solid white;
}

.video-list {
    flex: 1 1 auto;
    min-height: 0px;
    overflow-y: auto;
}

.live-badge {
    position: absolute;
    bottom: 0;
    right: 0;
    z-index: 10;
    font-size: 12px;
    border-radius: 4px;
    padding: 0px 2px;
}

.refresh-spin {
    animation: spin 1.1s infinite linear;
}

.videos-bar::-webkit-scrollbar-track {
    background: rgba(99, 46, 46, 0.5);
}

.videos-bar::-webkit-scrollbar-thumb {
    background: #f06291a2;
}
</style>
