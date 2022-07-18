<template>
  <div>
    <!-- :centered="$vuetify.breakpoint.xs"
      :class="
        $store.state.settings.darkMode
          ? 'secondary darken-1'
          : 'primary lighten-1'
      "
      :active-class="
        $store.state.settings.darkMode
          ? 'primary--text text--lighten-3'
          : 'primary--text text--darken-2'
      " -->
    <v-tabs
      :model-value="currentTab"
      class="mb-2"
      color="primary"
      @update:model-value="(e) => updateTab(e as number)"
    >
      <v-tab class="p-2">
        {{ liveUpcomingHeaderSplit[1] }}
        <span
          class="p-1 mx-1 rounded-md stream-count-chip bg-primary white--text"
        >
          {{ liveUpcomingCounts.liveCnt }}
        </span>
        {{ liveUpcomingHeaderSplit[2] }}
        <span
          class="p-1 ml-1 rounded-md stream-count-chip bg-primary white--text"
        >
          {{ liveUpcomingCounts.upcomingCnt }}
        </span>
      </v-tab>
      <v-tab class="p-2">
        {{ $t("views.home.recentVideoToggles.official") }}
      </v-tab>
      <v-tab class="p-2">
        {{ $t("views.home.recentVideoToggles.subber") }}
      </v-tab>
      <!-- <portal-target
        v-if="!display.breakpoint.xs"
        :name="`date-selector${isFavPage}`"
        class="ml-auto v-tab"
      /> -->
    </v-tabs>
    <video-card-grid>
      <template
        v-for="video in currentTab === Tabs.LIVE ? liveVideos : videos"
        :key="video.id"
      >
        <video-card :video="video" />
      </template>
    </video-card-grid>
    <div v-if="isLoading" class="flex h-20">
      <v-progress-circular
        indeterminate
        color="primary"
        :size="64"
        class="m-auto"
      ></v-progress-circular>
    </div>
    <div
      v-else-if="currentTab !== Tabs.LIVE"
      class="flex items-center justify-center h-20"
    >
      <h-pagination v-model="currentPage" :total-pages="totalPages" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { useLive, usePaginatedVideos } from "@/services/video";
import { useSiteStore } from "@/stores";
import { useSettingsStore } from "@/stores/settings";
import { Ref } from "vue";
import { useI18n } from "vue-i18n";
import HPagination from "@/components/core/HPagination.vue";
import { useUrlSearchParams } from "@vueuse/core";

const params = useUrlSearchParams("history");

const Tabs = {
  LIVE: 0,
  ARCHIVE: 1,
  CLIPS: 2,
} as const;
const currentTab: Ref<typeof Tabs[keyof typeof Tabs]> = ref(Tabs.LIVE);
const router = useRouter();
const route = useRoute();
function updateTab(tab: number, preservePage = true) {
  // Change page before change tab, to avoid fetching wrong offset
  currentPage.value = 1;

  currentTab.value = tab as any;
  // Sync the hash to current tab
  const toHash: Record<number, string> = {
    0: "",
    1: "#archive",
    2: "#clips",
    3: "#list",
  };
  router
    .replace({
      hash: toHash[tab] || "",
      // set page to 0 if on scroll mode
      query: preservePage
        ? {
            ...route.query,
            page: undefined,
          }
        : {},
    })
    .catch(() => {
      // Navigation duplication error expected, catch it and move on
    });
}

const site = useSiteStore();

const settings = useSettingsStore();
const { t } = useI18n();
const liveUpcomingHeaderSplit = computed(() => {
  return [...t("views.home.liveOrUpcomingHeading").match(/(.+)([\\/／・].+)/)];
});
const liveUpcomingCounts = computed(() => {
  const live = liveQuery.data.value;
  const liveCnt = live?.filter((v) => v.status === "live").length || 0;
  const upcomingCnt = (live?.length || 0) - liveCnt;
  return { liveCnt, upcomingCnt };
});

const currentPage = ref(+params.page || 1);
const perPage = 24;

// TODO:
// paginated: !this.scrollMode,
// ...(this.toDate && {
//   to: nearestUTCDate(dayjs(this.toDate ?? undefined)),
// }),

const liveQuery = useLive(
  computed(() => ({
    status: "live,upcoming",
    type: "placeholder,stream",
    org: site.currentOrg.name,
    max_upcoming_hours: 48,
    include: "live_info,mentions",
  })),
  {
    enabled: computed(() => currentTab.value === Tabs.LIVE),
    refetchInterval: 2 * 60 * 1000,
  }
);
const liveVideos = computed(() => liveQuery.data.value);

const archiveQuery = usePaginatedVideos(
  computed(() => ({
    status: "past,missing",
    type: "stream",
    org: site.currentOrg.name,
    include: "clips,mentions",
    max_upcoming_hours: 1,
    offset: (currentPage.value - 1) * perPage,
    limit: 24,
    paginated: true,
  })),
  {
    enabled: computed(() => currentTab.value === Tabs.ARCHIVE),
    refetchInterval: false,
  }
);
const clipQuery = usePaginatedVideos(
  computed(() => ({
    status: "past",
    type: "clip",
    org: site.currentOrg.name,
    // TODO
    // lang: settings.clipLangs.join(","),
    lang: "en",
    offset: (currentPage.value - 1) * perPage,
    limit: 24,
    paginated: true,
  })),
  {
    enabled: computed(() => currentTab.value === Tabs.CLIPS),
    refetchInterval: false,
  }
);

const activeQuery = computed(() => {
  switch (currentTab.value) {
    case 1:
      return archiveQuery;
    case 2:
      return clipQuery;
  }
});

const videos = computed(() => {
  return activeQuery?.value?.data?.value?.items || [];
  // return activeQuery?.value?.data?.value?.pages.reduce((prev, curr, index) => index <= currentPage.value ? prev.concat(curr) : prev, [])
});

const totalPages = computed(() => {
  return Math.ceil((activeQuery?.value?.data.value?.total || 0) / perPage);
});

// Scroll to top when page changes
watch(
  () => currentPage.value,
  () => {
    window.scrollTo({ top: 0 });
    params.page = `${currentPage.value}`;
  }
);
const isLoading = computed(() => activeQuery.value?.isLoading.value);
const error = computed(() => activeQuery.value?.error.value);
const isError = computed(() => activeQuery.value?.isError.value);
</script>
<style>
.v-tabs.v-slide-group--is-overflowing:not(.v-slide-group--has-affixes)
  .v-tab:first-child {
  margin-left: 0 !important;
}
/* shared with favorites.vue */
.stream-count-chip {
  letter-spacing: normal;
  min-width: 24px;
}
</style>
