<template>
    <!-- Vertical: -->
    <v-card class="pa-3" v-if="!horizontal">
        <v-row class="flex-column flex-nowrap flex-sm-wrap" style="height: 80vh">
            <v-col class="org-dropdown" cols="12" sm="4" md="3" lg="2" mandatory v-if="$vuetify.breakpoint.xs">
                <!-- Dropdown for breakpoint xs -->
                <v-card-title>{{ $t("views.multiview.video.selectLive") }}</v-card-title>

                <org-panel-picker horizontal @changed="handlePicker" />
            </v-col>
            <!-- Full list for greater than xs -->
            <v-col class="org-list" cols="12" sm="4" md="3" lg="2" mandatory style="min-height: 100%" v-else>
                <v-card-title>{{ $t("views.multiview.video.selectLive") }}</v-card-title>

                <org-panel-picker @changed="handlePicker" />
            </v-col>
            <v-col class="video-list" cols="12" sm="8" md="9" lg="10">
                <!-- Custom YT Url should render different content -->
                <template v-if="selectedOrg.name === 'YouTubeURL'">
                    <div class="text-h5">{{ $t("views.multiview.video.addCustomVideo") }}</div>
                    <v-text-field
                        label="Youtube Video Link"
                        hint="https://www.youtube.com/watch?v=..."
                        v-model="customURL"
                        :error="customURLError"
                    ></v-text-field>
                    <v-btn
                        @click="addCustomVideo"
                        :color="customURL && !customURLError ? 'green' : customURLError ? 'warning' : ''"
                    >
                        <v-icon>{{ icons.mdiCheck }}</v-icon>
                    </v-btn>
                </template>
                <!-- Custom Twitch URL -->
                <template v-else-if="selectedOrg.name === 'TwitchURL'">
                    <div class="text-h5">{{ $t("views.multiview.video.addCustomVideo") }}</div>
                    <v-text-field
                        label="Twitch Channel Link"
                        hint="https://www.twitch.tv/..."
                        v-model="customURL"
                        :error="customURLError"
                    ></v-text-field>
                    <v-btn
                        @click="addCustomVideo"
                        :color="customURL && !customURLError ? 'green' : customURLError ? 'warning' : ''"
                    >
                        <v-icon>{{ icons.mdiCheck }}</v-icon>
                    </v-btn>
                </template>
                <!-- Favorites when not logged in -->
                <template v-else-if="selectedOrg.name === 'Favorites' && !isLoggedIn">
                    <div class="pa-3">
                        <div class="text-body-1 text-center" v-html="$t('views.favorites.promptForAction')"></div>
                        <center>
                            <v-btn :to="isLoggedIn ? '/channel' : '/login'">
                                {{ isLoggedIn ? $t("views.favorites.manageFavorites") : $t("component.mainNav.login") }}
                            </v-btn>
                        </center>
                    </div>
                </template>
                <!-- Video Card List for normal content -->
                <template v-else>
                    <h4 class="pa-1">{{ selectedOrg.name }}</h4>
                    <LoadingOverlay :isLoading="isLoading" :showError="hasError" />
                    <VideoCardList
                        :videos="modalFilteredLive"
                        @videoClicked="handleVideoClick"
                        disableDefaultClick
                        includeChannel
                        :cols="{
                            xs: 1,
                            sm: 1,
                            md: 2,
                            lg: 4,
                            xl: 5,
                        }"
                        :horizontal="$vuetify.breakpoint.mdAndDown"
                        dense
                        hideIgnoredTopics
                        :hideCollabs="shouldHideCollabs"
                    ></VideoCardList>
                    <div class="d-block" style="height: 120px"></div>
                </template>
            </v-col>
        </v-row>
    </v-card>
    <!-- Horizontal view for tool bar -->
    <div class="d-flex flex-row align-center" v-else>
        <!-- Drop down -->
        <org-panel-picker horizontal @changed="handlePicker"></org-panel-picker>
        <v-icon
            class="mr-2 ml-1"
            @click="loadSelection(true)"
            :class="{ 'refresh-spin': isLoading }"
            v-if="selectedOrg.name !== 'YouTubeURL' && selectedOrg.name !== 'TwitchURL'"
        >
            {{ icons.mdiRefresh }}
        </v-icon>
        <!-- Inline text input for custom yt url -->
        <template v-if="selectedOrg.name === 'YouTubeURL'">
            <v-text-field
                label="Youtube Video Link"
                placeholder="https://www.youtube.com/watch?v=..."
                v-model="customURL"
                :error="customURLError"
                hide-details
                solo
                style="width: 100%"
            ></v-text-field>
            <v-btn
                @click="addCustomVideo"
                :color="customURL && !customURLError ? 'green' : customURLError ? 'warning' : ''"
                icon
            >
                <v-icon>{{ icons.mdiCheck }}</v-icon>
            </v-btn>
        </template>
        <!-- Inline text input for custom twitch url -->
        <template v-else-if="selectedOrg.name === 'TwitchURL'">
            <v-text-field
                label="Twitch Channel Link"
                placeholder="https://www.twitch.tv/..."
                v-model="customURL"
                :error="customURLError"
                hide-details
                solo
                style="width: 100%"
            ></v-text-field>
            <v-btn
                @click="addCustomVideo"
                :color="customURL && !customURLError ? 'green' : customURLError ? 'warning' : ''"
                icon
            >
                <v-icon>{{ icons.mdiCheck }}</v-icon>
            </v-btn>
        </template>
        <!-- Login prompt for favorites -->
        <template v-else-if="selectedOrg === 0 && !isLoggedIn">
            <div class="flex d-flex flex-row align-center">
                <span class="" v-html="$t('views.app.loginCallToAction')"></span>
                <v-btn text :to="isLoggedIn ? '/channel' : '/login'">
                    {{ $t("component.mainNav.login") }}
                </v-btn>
            </div>
        </template>
        <!-- Channel icons -->
        <template v-else>
            <v-tooltip :key="video.id" v-for="video in topFilteredLive" transition="v-fade-transition" bottom>
                <template v-slot:activator="{ on, attrs }">
                    <div
                        v-on="on"
                        v-bind="attrs"
                        style="position: relative; margin-right: 3px; cursor: pointer"
                        draggable="true"
                        v-on:dragstart="(ev) => dragVideo(ev, video)"
                    >
                        <div class="live-badge" :key="'lvbg' + tick" :class="video.status === 'live' ? 'red' : 'grey'">
                            {{ formatDurationLive(video) }}
                        </div>
                        <v-avatar size="50" @click="handleVideoClick(video)">
                            <ChannelImg :channel="video.channel" :size="50" noLink />
                        </v-avatar>
                    </div>
                </template>
                <VideoCard :video="video" disableDefaultClick includeChannel style="max-width: 250px"></VideoCard>
            </v-tooltip>
        </template>
    </div>
</template>

<script lang="ts">
import VideoCard from "@/components/video/VideoCard.vue";
import VideoCardList from "@/components/video/VideoCardList.vue";
import LoadingOverlay from "@/components/common/LoadingOverlay.vue";
import ChannelImg from "@/components/channel/ChannelImg.vue";
import { dayjs } from "@/utils/time";
import { getVideoIDFromUrl } from "@/utils/functions";
import { mapGetters, mapState } from "vuex";
import OrgPanelPicker from "@/components/multiview/OrgPanelPicker.vue";
import filterVideos from "@/mixins/filterVideos";

export default {
    name: "VideoSelector",
    mixins: [filterVideos],
    components: {
        VideoCard,
        VideoCardList,
        LoadingOverlay,
        ChannelImg,
        OrgPanelPicker,
    },
    props: {
        horizontal: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            live: [],
            selectedOrg: {},
            isLoading: false,
            hasError: false,

            customURL: "",
            customURLError: false,

            tick: Date.now(),
            ticker: null,
            refreshTimer: null,
        };
    },
    mounted() {
        // Start timer to update live time stamps
        this.setAutoRefresh();
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
    watch: {
        // Watch lastLiveUpdate from favorites module, and fetch new state
        favUpdateTick() {
            if (this.selectedOrg.name === "Favorites") this.live = this.$store.state.favorites.live;
        },
        homeUpdateTick() {
            const { name } = this.selectedOrg;
            if (name !== "Favorites" && name !== "Playlist") this.live = this.$store.state.home.live;
        },
        savedVideosList() {
            if (this.selectedOrg.name === "Playlist") this.live = this.active.videos;
        },
        // eslint-disable-next-line func-names
        "$store.state.visibilityState": function () {
            if (this.$store.state.visibilityState === "visible") {
                this.loadSelection();
            }
        },
    },
    computed: {
        ...mapGetters("multiview", ["activeVideos"]),
        ...mapState("favorites", { favUpdateTick: "lastLiveUpdate" }),
        ...mapState("home", { homeUpdateTick: "lastLiveUpdate" }),
        ...mapState("playlist", ["active"]),
        modalFilteredLive() {
            return this.live.filter(
                (l) =>
                    !this.activeVideos.find((v) => v.id === l.id) &&
                    !this.$store.getters["settings/blockedChannelIDs"].has(l.channel.id),
            );
        },
        topFilteredLive() {
            // Filter out lives for top bar
            let count = 0;
            const filterConfig = {
                ignoreBlock: false,
                // only hide collabs when favorites tab
                hideCollabs: this.shouldHideCollabs,
                hideIgnoredTopics: true,
            };
            const filtered = this.live
                .filter((l) => this.filterVideos(l, filterConfig))
                .filter((l) => {
                    count += 1;
                    // Select all live and streams within 30 mins, and expand to 6 hours if cnt < 5
                    return (
                        l.status === "live" ||
                        dayjs().isAfter(dayjs(l.start_scheduled).subtract(30, "m")) ||
                        (count < 8 && dayjs().isAfter(dayjs(l.start_scheduled).subtract(6, "h")))
                    );
                })
                .filter((l) => !this.activeVideos.find((v) => v.id === l.id));

            return filtered;
        },
        isLoggedIn() {
            return this.$store.getters.isLoggedIn;
        },
        savedVideosList() {
            return this.active.videos;
        },
        shouldHideCollabs() {
            return this.selectedOrg?.name === "Favorites" && this.$store.state.settings.hideCollabStreams;
        },
    },
    methods: {
        setAutoRefresh() {
            if (this.refreshTimer) clearInterval(this.refreshTimer);
            this.refreshTimer = setInterval(() => {
                this.loadSelection();
            }, 2 * 60 * 1000);
        },
        // Returns a short hand form of time (ie. 33m, 2h)
        formatDurationLive(video) {
            const now = dayjs();
            const scheduled = dayjs(video.start_actual || video.start_scheduled);
            // use start_actual or start_scheduled if it has one
            const secs = now.isAfter(scheduled)
                ? dayjs(/* this.now */).diff(dayjs(video.start_actual)) / 1000
                : scheduled.diff(dayjs()) / 1000;

            const h = Math.floor(secs / (60 * 60));
            const m = Math.floor((secs % (60 * 60)) / 60);
            if (secs < 0) return "0m";
            return h ? `${h}h` : `${m}m`;
        },
        handleVideoClick(video) {
            this.$emit("videoClicked", video);
        },
        addCustomVideo() {
            const content = getVideoIDFromUrl(this.customURL);
            if (content && content.id) {
                this.customURLError = false;
                this.$emit("videoClicked", content);
            } else {
                this.customURLError = true;
            }
        },
        // Load selected option
        loadSelection(force) {
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
            // console.log(panel);
            if (this.selectedOrg === panel) return;
            this.selectedOrg = panel;
            this.loadSelection(true);
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
</style>
