<template>
    <v-card class="pa-3" v-if="!horizontal">
        <v-row>
            <v-col cols="12" sm="4" md="2" style="border-right: 1px solid white">
                <v-card-title>{{ $t("views.multiview.video.selectLive") }}</v-card-title>
                <v-select
                    :items="orgList"
                    filled
                    v-model="selectedOrg"
                    mandatory
                    v-if="$vuetify.breakpoint.name === 'xs'"
                ></v-select>
                <v-list-item-group v-model="selectedOrg" mandatory v-else>
                    <template v-for="org in orgList">
                        <v-list-item v-if="org.value !== 1" :key="org.value">
                            <v-list-item-content>
                                <v-list-item-title>{{ org.text }}</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        <!-- Custom! -->
                        <v-list-item v-else :key="org.value">
                            <!-- <v-list-item-content> -->
                            <v-icon class="mr-2">{{ icons.mdiYoutube }}</v-icon>
                            <v-list-item-title>URL</v-list-item-title>
                            <!-- </v-list-item-content> -->
                        </v-list-item>
                    </template>
                </v-list-item-group>
            </v-col>
            <v-col cols="12" sm="8" md="10" style="max-height: 100%; overflow-y: auto">
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
                <template v-else-if="selectedOrg === 0 && !$store.getters.isLoggedIn">
                    <div class="pa-3">
                        <div class="text-body-1 text-center" v-html="$t('views.favorites.promptForAction')"></div>
                        <center>
                            <v-btn :to="isLoggedIn ? '/channel' : '/login'">
                                {{ isLoggedIn ? $t("views.favorites.manageFavorites") : $t("component.mainNav.login") }}
                            </v-btn>
                        </center>
                    </div>
                </template>
                <template v-else>
                    <LoadingOverlay :isLoading="isLoading" :showError="hasError" />
                    <VideoCardList
                        :videos="live"
                        horizontal
                        @videoClicked="handleVideoClick"
                        disableDefaultClick
                        includeChannel
                    ></VideoCardList>
                </template>
            </v-col>
        </v-row>
    </v-card>
    <div class="d-flex flex-row align-center" v-else>
        <v-select
            :items="orgList"
            v-model="selectedOrg"
            mandatory
            hide-details
            solo
            style="max-width: 150px; margin-right: 10px"
        ></v-select>
        <template v-if="selectedOrg === 1">
            <v-text-field
                label="Youtube Video Link"
                hint="https://www.youtube.com/watch?v=..."
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
        <template v-else>
            <div :key="video.id" v-for="video in filteredLive" style="position: relative; margin-right: 3px">
                <div class="live-badge" :class="video.status === 'live' ? 'red' : 'grey'">
                    {{ formatDurationLive(video) }}
                </div>
                <v-avatar size="50" @click="handleVideoClick(video)">
                    <v-img :src="video.channel.photo"></v-img>
                </v-avatar>
            </div>
        </template>
    </div>
</template>

<script lang="ts">
import api from "@/utils/backend-api";
import VideoCardList from "@/components/video/VideoCardList.vue";
import LoadingOverlay from "@/components/common/LoadingOverlay.vue";
import { ORGS, VIDEO_URL_REGEX } from "@/utils/consts";
import { dayjs } from "@/utils/time";
import { mapGetters } from "vuex";

export default {
    name: "VideoSelector",
    components: {
        VideoCardList,
        LoadingOverlay,
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
        };
    },
    mounted() {
        if (this.$store.getters.isLoggedIn) {
            this.loadFavorites();
        } else {
            this.selectedOrg = 3;
        }
    },
    watch: {
        selectedOrg() {
            if (this.selectedOrg === 1) {
                return;
            }
            if (this.selectedOrg === 0) {
                this.loadFavorites();
                return;
            }
            this.loadOrg(this.orgList[this.selectedOrg].text);
        },
    },
    computed: {
        ...mapGetters("multiview", ["activeVideos"]),
        orgList() {
            const arr = [
                {
                    text: "Favorites",
                    value: 0,
                },
                {
                    text: "Custom",
                    value: 1,
                },
                ...this.ORGS.filter((x) => x !== "All Vtubers").map((orgName, index) => {
                    return {
                        text: orgName,
                        value: index + 2,
                    };
                }),
            ];
            return arr;
        },
        filteredLive() {
            return this.live
                .filter((l) => {
                    return l.status === "live" || dayjs().isAfter(dayjs(l.start_scheduled).subtract(30, "minutes"));
                })
                .filter((l) => !this.activeVideos.find((v) => v.id === l.id));
        },
    },
    methods: {
        formatDurationLive(video) {
            const now = dayjs();
            const scheduled = dayjs(video.start_scheduled);
            // use start_actual or start_scheduled if it has one
            const secs = now.isAfter(scheduled)
                ? dayjs(/* this.now */).diff(dayjs(video.start_actual)) / 1000
                : scheduled.diff(dayjs()) / 1000;

            const h = Math.floor(secs / (60 * 60));
            const m = Math.floor((secs % (60 * 60)) / 60);
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
        loadFavorites() {
            this.live = [];
            this.isLoading = true;
            api.favoritesLive({
                channels: this.$store.state.favorites.favorites.map((f) => f.id).join(","),
            })
                .then((data) => {
                    data.sort((a, b) => {
                        const dateA = new Date(a.available_at).getTime();
                        const dateB = new Date(b.available_at).getTime();
                        return dateA > dateB ? 1 : -1;
                    });
                    this.live = data;
                })
                .catch((e) => {
                    console.error(e);
                    this.hasError = false;
                })
                .finally(() => {
                    this.isLoading = false;
                });
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
</style>
