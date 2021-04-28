<template>
    <!-- Vertical: -->
    <v-card class="pa-3" v-if="!horizontal">
        <v-row>
            <v-col cols="12" sm="3" md="2" style="border-right: 1px solid white">
                <v-card-title>{{ $t("views.multiview.video.selectLive") }}</v-card-title>
                <!-- Dropdown for breakpoint xs -->
                <v-select
                    :items="orgList"
                    filled
                    v-model="selectedOrg"
                    mandatory
                    v-if="$vuetify.breakpoint.xs"
                ></v-select>
                <!-- Full list for greater than xs -->
                <v-list-item-group v-model="selectedOrg" mandatory v-else>
                    <template v-for="org in orgList">
                        <v-list-item v-if="org.value === 1" :key="org.value">
                            <v-icon class="mr-2">{{ icons.mdiYoutube }}</v-icon>
                            <v-list-item-title>URL</v-list-item-title>
                        </v-list-item>
                        <v-list-item v-else-if="org.value === 2" :key="org.value">
                            <v-icon class="mr-2">{{ mdiTwitch }}</v-icon>
                            <v-list-item-title>URL</v-list-item-title>
                        </v-list-item>
                        <v-list-item v-else :key="org.value">
                            <v-list-item-content>
                                <v-list-item-title>{{ org.text }}</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </template>
                </v-list-item-group>
            </v-col>
            <v-col cols="12" sm="9" md="10" style="max-height: 100%; overflow-y: auto">
                <!-- Custom YT Url should render different content -->
                <template v-if="selectedOrg === 1">
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
                <template v-else-if="selectedOrg === 2">
                    <div class="text-h5">{{ $t("views.multiview.video.addCustomVideo") }}</div>
                    <v-text-field
                        label="Twitch Channel Link"
                        hint="https://www.twitch.tv/..."
                        v-model="customURL"
                        :error="customURLError"
                    ></v-text-field>
                    <v-btn
                        @click="addCustomTwitchVideo"
                        :color="customURL && !customURLError ? 'green' : customURLError ? 'warning' : ''"
                    >
                        <v-icon>{{ icons.mdiCheck }}</v-icon>
                    </v-btn>
                </template>
                <!-- Favorites when not logged in -->
                <template v-else-if="selectedOrg === 0 && !isLoggedIn">
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
                    <LoadingOverlay :isLoading="isLoading" :showError="hasError" />
                    <VideoCardList
                        :videos="live"
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
                    ></VideoCardList>
                </template>
            </v-col>
        </v-row>
    </v-card>
    <!-- Horizontal view for tool bar -->
    <div class="d-flex flex-row align-center" v-else>
        <!-- Drop down -->
        <v-select
            :items="orgList"
            v-model="selectedOrg"
            mandatory
            hide-details
            solo
            style="max-width: 150px; margin-right: 10px"
        ></v-select>
        <v-icon
            class="mr-2"
            @click="loadSelection"
            :class="{ 'refresh-spin': isLoading }"
            v-if="selectedOrg !== 1 && selectedOrg !== 2"
        >
            {{ icons.mdiRefresh }}
        </v-icon>
        <!-- Inline text input for custom yt url -->
        <template v-if="selectedOrg === 1">
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
        <template v-else-if="selectedOrg === 2">
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
                @click="addCustomTwitchVideo"
                :color="customURL && !customURLError ? 'green' : customURLError ? 'warning' : ''"
                icon
            >
                <v-icon>{{ icons.mdiCheck }}</v-icon>
            </v-btn>
        </template>
        <!-- Channel icons -->
        <template v-else>
            <v-tooltip :key="video.id" v-for="video in filteredLive" transition="v-fade-transition" bottom>
                <template v-slot:activator="{ on, attrs }">
                    <div v-on="on" v-bind="attrs" style="position: relative; margin-right: 3px; cursor: pointer">
                        <div
                            class="live-badge"
                            :key="'lvbg' + ticker"
                            :class="video.status === 'live' ? 'red' : 'grey'"
                        >
                            {{ formatDurationLive(video) }}
                        </div>
                        <v-avatar size="50" @click="handleVideoClick(video)">
                            <!-- <v-img :src="resizeChannelPhoto(video.channel.photo, 50)"></v-img> -->
                            <ChannelImg :channel="video.channel" :size="50" noLink />
                        </v-avatar>
                    </div>
                </template>
                <VideoCard :video="video" disableDefaultClick includeChannel style="max-width: 250px"></VideoCard>
            </v-tooltip>

            <!-- Login prompt for favorites -->
            <div class="flex d-flex flex-row align-center" v-if="selectedOrg === 0 && !isLoggedIn">
                <span class="" v-html="$t('views.app.loginCallToAction')"></span>
                <v-btn text :to="isLoggedIn ? '/channel' : '/login'">
                    {{ $t("component.mainNav.login") }}
                </v-btn>
            </div>
        </template>
    </div>
</template>

<script lang="ts">
import api from "@/utils/backend-api";
import VideoCard from "@/components/video/VideoCard.vue";
import VideoCardList from "@/components/video/VideoCardList.vue";
import LoadingOverlay from "@/components/common/LoadingOverlay.vue";
import ChannelImg from "@/components/channel/ChannelImg.vue";
import { ORGS, VIDEO_URL_REGEX } from "@/utils/consts";
import { dayjs } from "@/utils/time";
import { resizeChannelPhoto } from "@/utils/functions";
import { mapGetters, mapState } from "vuex";
import { mdiTwitch } from "@mdi/js";

export default {
    name: "VideoSelector",
    components: {
        VideoCard,
        VideoCardList,
        LoadingOverlay,
        ChannelImg,
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
            selectedOrg: 0,
            ORGS,
            isLoading: false,
            hasError: false,

            customURL: "",
            customURLError: false,

            tick: Date.now(),
            ticker: null,

            mdiTwitch,

            lastUpdate: Date.now(),
        };
    },
    mounted() {
        // Set tab to favorites if logged in or currentOrg otherwise
        if (this.$store.getters.isLoggedIn) {
            this.$store.dispatch("favorites/fetchLive", { minutes: 2 });
            this.loadFavorites();
        } else {
            this.selectedOrg = this.orgList.find((x) => x.text === this.$store.state.currentOrg).value;
        }

        // Start timer to update live time stamps
        this.ticker = setInterval(() => {
            this.tick = Date.now();
            this.tryUpdateLives();
        }, 60000);
    },
    beforeDestroy() {
        if (this.ticker) clearInterval(this.ticker);
    },
    watch: {
        // Watch lastLiveUpdate from favorites module, and fetch new state
        lastLiveUpdate() {
            if (this.selectedOrg === 0) this.loadFavorites();
        },
        // Watch dropdown selection change
        selectedOrg() {
            this.loadSelection();
        },
    },
    computed: {
        ...mapGetters("multiview", ["activeVideos"]),
        ...mapState("favorites", ["lastLiveUpdate"]),
        orgList() {
            const arr = [
                {
                    text: "Favorites",
                    value: 0,
                },
                {
                    text: "Youtube URL",
                    value: 1,
                },
                {
                    text: "Twitch URL",
                    value: 2,
                },
                ...this.ORGS.filter((x) => x !== "All Vtubers").map((orgName, index) => {
                    return {
                        text: orgName,
                        value: index + 3,
                    };
                }),
            ];
            return arr;
        },
        filteredLive() {
            // Filter out lives for top bar
            let filtered = this.live
                .filter((l) => {
                    return l.status === "live" || dayjs().isAfter(dayjs(l.start_scheduled).subtract(30, "m"));
                })
                .filter((l) => !this.activeVideos.find((v) => v.id === l.id));

            // expand search if 30m limit yields less than 5 results
            if (filtered.length < 5) {
                filtered = this.live
                    .filter((l) => {
                        return l.status === "live" || dayjs().isAfter(dayjs(l.start_scheduled).subtract(6, "h"));
                    })
                    .splice(0, 5)
                    .filter((l) => !this.activeVideos.find((v) => v.id === l.id));
            }
            return filtered;
        },
        isLoggedIn() {
            return this.$store.getters.isLoggedIn;
        },
    },
    methods: {
        resizeChannelPhoto,
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
            const match = this.customURL.match(VIDEO_URL_REGEX);
            if (match && match[1] && match[1].length === 11) {
                this.customURLError = false;
                this.$emit("videoClicked", {
                    id: match[1],
                    channel: {
                        name: match[1],
                    },
                });
            } else {
                this.customURLError = true;
            }
        },
        addCustomTwitchVideo() {
            const regex = /(?:https:\/\/)?twitch\.tv\/([\w\-_]*)/i;
            const match = this.customURL.match(regex);
            if (match && match[1]) {
                this.customURLError = false;
                this.$emit("videoClicked", {
                    id: match[1],
                    cellVideoType: "twitch",
                    channel: {
                        name: match[1],
                    },
                });
            } else {
                this.customURLError = true;
            }
        },
        loadFavorites() {
            this.live = this.$store.state.favorites.live;
            // Sort by upcoming time (backend data does not come sorted for favorites)
            this.live = this.live.sort((a, b) => {
                // Keep sort order consistent, but sorting by id when times are equal
                if ((a.start_actual || a.start_scheduled) === (b.start_actual || b.start_scheduled)) {
                    return a.channel.id - b.channel.id;
                }
                if ((a.start_actual || a.start_scheduled) > (b.start_actual || b.start_scheduled)) return 1;
                return -1;
            });
        },
        // Check if 5 minutes have past since last update
        tryUpdateLives() {
            if (this.selectedOrg > 2 && Date.now() - this.lastUpdate > 1000 * 60 * 5) {
                this.lastUpdate = Date.now();
                this.loadOrg(this.orgList[this.selectedOrg].text);
            }
        },
        // Load selected option
        loadSelection() {
            // Do nothing for custom URLs
            if (this.selectedOrg === 1 || this.selectedOrg === 2) {
                return;
            }
            // Delegate dfferent function for favorites
            if (this.selectedOrg === 0) {
                this.isLoading = true;
                this.$store.dispatch("favorites/fetchLive", { minutes: 2, force: true }).finally(() => {
                    this.isLoading = false;
                });
                this.loadFavorites();
                return;
            }
            // Call api for specific org
            this.loadOrg(this.orgList[this.selectedOrg].text);
        },
        loadOrg(orgName) {
            this.live = [];
            this.isLoading = true;
            api.live({
                org: orgName,
            })
                .then((res) => {
                    this.live = res;
                })
                .catch((e) => {
                    console.error(e);
                    this.hasError = false;
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
    },
};
</script>

<style>
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
