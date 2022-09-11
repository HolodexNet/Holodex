<template>
  <!-- <page-container> -->

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
  <h-tabs class="mb-4">
    <h-tab :active="currentTab === 0" @click="() => updateTab(0)">
      {{ liveUpcomingHeaderSplit[1] }}
      <span
        v-if="liveUpcomingCounts.liveCnt"
        class="rounded-sm badge badge-secondary badge-sm sm:badge-md mx-1"
      >
        {{ liveUpcomingCounts.liveCnt }}
      </span>
      {{ liveUpcomingHeaderSplit[2] }}
      <span
        v-if="liveUpcomingCounts.upcomingCnt"
        class="rounded-sm badge badge-outline badge-sm sm:badge-md mx-1"
      >
        {{ liveUpcomingCounts.upcomingCnt }}
      </span>
    </h-tab>
    <h-tab :active="currentTab === 1" @click="() => updateTab(1)">
      {{ $t("views.home.recentVideoToggles.official") }}
    </h-tab>
    <h-tab :active="currentTab === 2" @click="() => updateTab(2)">
      {{ $t("views.home.recentVideoToggles.subber") }}
    </h-tab>
  </h-tabs>
  <div class="px-4">
    <video-card-grid>
      <template
        v-for="(video, index) in videoQuery.data.value?.items"
        :key="video.id"
      >
        <video-card
          v-if="index < 20"
          :video="video"
          :hide-channel-image="currentTab !== Tabs.LIVE"
        />
        <v-lazy v-else class="v-lazy-video">
          <video-card
            :video="video"
            :hide-channel-image="currentTab !== Tabs.LIVE"
          />
        </v-lazy>
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
  <!-- </page-container> -->
</template>
<script setup lang="ts">
import { useVideoListDatasource } from "@/services/video";
// import { useSiteStore } from "@/stores";
import { Ref } from "vue";
import { useI18n } from "vue-i18n";
import HPagination from "@/components/core/HPagination.vue";
import { useUrlSearchParams } from "@vueuse/core";
import useOrgRouteParamSync from "@/hooks/common/useOrgRouteParamSync";

const props = defineProps({ favorites: Boolean });
const params = useUrlSearchParams("history");

const Tabs = {
  LIVE: 0,
  ARCHIVE: 1,
  CLIPS: 2,
} as const;
const currentTab: Ref<typeof Tabs[keyof typeof Tabs]> = ref(Tabs.LIVE);
const router = useRouter();
const route = useRoute();
// const site = useSiteStore();

const pageOrg = useOrgRouteParamSync();
// TODO:
// paginated: !this.scrollMode,
// ...(this.toDate && {
//   to: nearestUTCDate(dayjs(this.toDate ?? undefined)),
// }),
const lookupState: Ref<VideoListLookup> = ref({
  flavor: props.favorites
    ? ({
        favorites: props.favorites,
      } as FavLookup)
    : ({ org: pageOrg.value.name } as OrgLookup),
  // type & status for tab selection.
  // Usually selection has a tab between live and archives. Use this to control that aspect.
  type: "stream_schedule" as const,
  // optional if using a enum Type ^,
  // if custom type, then must provide custom statuses.
  statuses: undefined,

  // and regular pagination
  pagination: undefined,
});

watch(
  () => [props.favorites, pageOrg.value],
  () => {
    lookupState.value.flavor = props.favorites
      ? ({
          favorites: props.favorites,
        } as FavLookup)
      : ({ org: pageOrg.value.name } as OrgLookup);
  }
);

// const settings = useSettingsStore();
const currentPage = ref(+params.page || 1);
const perPage = 24;

const { t } = useI18n();

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

  lookupState.value.pagination =
    tab === 0 ? undefined : { offset: 0, limit: perPage };

  switch (tab) {
    case 0:
      lookupState.value.type = "stream_schedule";
      break;

    case 1:
      lookupState.value.type = "archive";
      break;

    case 2:
      lookupState.value.type = "clip";
      break;
  }
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

const videoQuery = useVideoListDatasource(lookupState, ref({ enabled: true }));

const totalPages = computed(() => {
  return Math.ceil((videoQuery?.data.value?.total || 0) / perPage);
});

const liveUpcomingCounts = ref({ liveCnt: 0, upcomingCnt: 0 });
watchEffect(() => {
  if (lookupState.value.type === "stream_schedule") {
    const live = videoQuery.data.value?.items;
    const liveCnt = live?.filter((v) => v.status === "live").length || 0;
    const upcomingCnt =
      live?.filter((v) => v.status === "upcoming").length || 0;
    liveUpcomingCounts.value = { liveCnt, upcomingCnt };
  }
});

const liveUpcomingHeaderSplit = computed(() => {
  return [
    ...(t("views.home.liveOrUpcomingHeading").match(/(.+)([\\/／・].+)/) || []),
  ];
});

// Scroll to top when page changes
watch(
  () => currentPage.value,
  () => {
    window.scrollTo({ top: 0 });
    params.page = `${currentPage.value}`;
    if (lookupState.value.pagination)
      lookupState.value.pagination.offset = (currentPage.value - 1) * perPage;
  }
);
// Reset to first tab when path changes
watch(
  () => route.path,
  () => updateTab(0, false)
);
const isLoading = computed(
  () => videoQuery?.isLoading.value || videoQuery?.isFetching.value
);
// const error = computed(() => videoQuery?.error.value);
// const isError = computed(() => videoQuery?.isError.value);
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

.v-lazy-video:empty {
  width: 1px;
  height: 0;
  padding-bottom: calc((100% / (16 / 9)) + 88px);
}

/* Hide scrollbar for Chrome, Safari and Opera */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.no-scrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
