<template>
    <v-container
        fluid
        v-touch="{
            right: () => (tab = Math.max(tab - 1, 0)),
            left: () => (tab = Math.min(tab + 1, 2)),
        }"
        style="min-height: 100%"
        class="d-flex flex-column"
    >
        <!-- Teleport tabs to nav extension slot -->
        <portal to="mainNavExt" :disabled="!$vuetify.breakpoint.xs || !isActive">
            <v-tabs
                @change="$router.replace({ query: null })"
                v-model="tab"
                :centered="$vuetify.breakpoint.xs"
                :class="$store.state.settings.darkMode ? 'secondary darken-1' : 'primary lighten-1'"
                :active-class="
                    $store.state.settings.darkMode ? 'primary--text text--lighten-3' : 'primary--text text--darken-2'
                "
            >
                <v-tab>
                    {{ $t("views.home.liveOrUpcomingHeading") }}
                    <v-chip small class="ml-1 px-2" color="primary">{{ lives.length + upcoming.length }}</v-chip>
                </v-tab>
                <v-tab>
                    {{ $t("views.home.recentVideoToggles.official") }}
                </v-tab>
                <v-tab>
                    {{ $t("views.home.recentVideoToggles.subber") }}
                </v-tab>
            </v-tabs>
        </portal>
        <LoadingOverlay :isLoading="false" :showError="hasError" />
        <template v-show="!hasError">
            <template v-if="tab === Tabs.LIVE_UPCOMING">
                <SkeletonCardList v-if="isLoading" :cols="colSizes" :dense="currentGridSize > 0" />
                <template v-else-if="lives.length || upcoming.length">
                    <VideoCardList
                        :videos="lives"
                        includeChannel
                        :includeAvatar="shouldIncludeAvatar"
                        :cols="colSizes"
                        :dense="currentGridSize > 0"
                    >
                    </VideoCardList>
                    <v-divider class="my-3 secondary" v-if="lives.length" />
                    <VideoCardList
                        :videos="upcoming"
                        includeChannel
                        :includeAvatar="shouldIncludeAvatar"
                        :cols="colSizes"
                        :dense="currentGridSize > 0"
                    >
                    </VideoCardList>
                </template>
                <template v-else>
                    <div class="ma-auto pa-5 text-center">
                        {{ $t("views.home.noStreams") }}
                    </div>
                </template>
            </template>
            <template v-else>
                <keep-alive>
                    <generic-list-loader
                        :infiniteLoad="scrollMode"
                        :paginate="!scrollMode"
                        :perPage="this.pageLength"
                        :loadFn="getLoadFn()"
                        v-slot="{ data, isLoading }"
                        :key="'vl-home-' + tab + identifier"
                    >
                        <!-- only keep VideoCardList rendered if scrollMode OR it's not loading. -->
                        <VideoCardList
                            v-show="scrollMode || !isLoading"
                            :videos="data"
                            includeChannel
                            :cols="colSizes"
                            :dense="currentGridSize > 0"
                        />
                        <!-- only show SkeletonCardList if it's loading -->
                        <SkeletonCardList v-if="isLoading" :cols="colSizes" :dense="currentGridSize > 0" />
                    </generic-list-loader>
                </keep-alive>
            </template>
        </template>
    </v-container>
</template>

<script lang="ts">
import VideoCardList from "@/components/video/VideoCardList.vue";
import LoadingOverlay from "@/components/common/LoadingOverlay.vue";
import { mapState } from "vuex";
import reloadable from "@/mixins/reloadable";
import backendApi from "@/utils/backend-api";
import GenericListLoader from "@/components/video/GenericListLoader.vue";
import SkeletonCardList from "@/components/video/SkeletonCardList.vue";
import isActive from "@/mixins/isActive";

export default {
    name: "Home",
    metaInfo() {
        return {
            get title() {
                return "Holodex";
            },
        };
    },
    mixins: [reloadable, isActive],
    components: {
        VideoCardList,
        LoadingOverlay,
        GenericListLoader,
        SkeletonCardList,
    },
    data() {
        return {
            identifier: Date.now(),
            pageLength: 24,
            tab: 0,
            Tabs: Object.freeze({
                LIVE_UPCOMING: 0,
                // ALL: 1,
                ARCHIVE: 1,
                CLIPS: 2,
            }),
        };
    },
    mounted() {
        this.init();
    },
    watch: {
        // eslint-disable-next-line func-names
        "$store.state.currentOrg": function () {
            this.init();
        },
        tab() {
            this.$nextTick(() => {
                window.scrollTo(0, 0);
                switch (this.tab) {
                    case this.Tabs.LIVE_UPCOMING:
                        this.$router.replace({
                            query: {
                                ...this.$route.query,
                            },
                        });
                        break;
                    case this.Tabs.ARCHIVE:
                        this.$router.replace({
                            query: {
                                ...this.$route.query,
                            },
                            hash: "archive",
                        });
                        break;
                    case this.Tabs.CLIPS:
                        this.$router.replace({
                            query: {
                                ...this.$route.query,
                            },
                            hash: "clips",
                        });
                        break;
                    default:
                        break;
                }
            });
        },
    },
    computed: {
        ...mapState("home", ["live", "isLoading", "hasError"]),
        recentVideoFilter: {
            get() {
                return this.$store.state.home.recentVideoFilter;
            },
            set(value) {
                this.$store.commit("home/setRecentVideoFilter", value);
                this.identifier = Date.now();
                this.$router.push({
                    query: {
                        ...this.$route.query,
                        page: undefined,
                    },
                });
            },
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
        lives() {
            return this.live.filter((v) => v.status === "live");
        },
        upcoming() {
            return this.live.filter((v) => v.status === "upcoming");
        },
    },
    methods: {
        init() {
            this.$store.commit("home/resetState");
            this.$store.dispatch("home/fetchLive");
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
            return async (offset, limit) => {
                const res = await backendApi.videos({
                    status: "past",
                    ...{ type: this.tab === this.Tabs.ARCHIVE ? "stream" : "clip" },
                    include: "clips",
                    org: this.$store.state.currentOrg,
                    lang: this.$store.state.settings.clipLangs.join(","),
                    paginated: !this.scrollMode,
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
</style>
