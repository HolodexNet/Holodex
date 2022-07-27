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
  <div class="sticky z-10 px-4 mb-4 tabs top-14 bg-base-100">
    <a
      class="gap-2 tab tab-lg tab-bordered"
      :class="currentTab === 0 ? 'tab-active border-primary' : ''"
      @click="() => updateTab(0)"
    >
      {{ liveUpcomingHeaderSplit[1] }}
      <span v-if="liveUpcomingCounts.liveCnt" class="badge badge-secondary">
        {{ liveUpcomingCounts.liveCnt }}
      </span>
      {{ liveUpcomingHeaderSplit[2] }}
      <span v-if="liveUpcomingCounts.upcomingCnt" class="badge badge-outline">
        {{ liveUpcomingCounts.upcomingCnt }}
      </span>
    </a>
    <a
      class="tab tab-lg tab-bordered"
      :class="currentTab === 1 ? 'tab-active' : ''"
      @click="() => updateTab(1)"
    >
      {{ $t("views.home.recentVideoToggles.official") }}
    </a>
    <a
      class="tab tab-lg tab-bordered"
      :class="currentTab === 2 ? 'tab-active' : ''"
      @click="() => updateTab(2)"
    >
      {{ $t("views.home.recentVideoToggles.subber") }}
    </a>
  </div>
  <div class="px-4">
    <video-card-grid>
      <template
        v-for="(video, index) in videoQuery.data.value?.items"
        :key="video.id"
      >
        <video-card v-if="index < 20" :video="video" />
        <v-lazy v-else class="v-lazy-video"
          ><video-card :video="video"
        /></v-lazy>
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
import {
  useLive,
  usePaginatedVideos,
  useVideoListDatasource,
} from "@/services/video";
import { useSiteStore } from "@/stores";
import { useSettingsStore } from "@/stores/settings";
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
const site = useSiteStore();

const pageOrg = useOrgRouteParamSync();
// TODO:
// paginated: !this.scrollMode,
// ...(this.toDate && {
//   to: nearestUTCDate(dayjs(this.toDate ?? undefined)),
// }),
const lookupState: Ref<
  VideoListLookup<"stream_schedule" | "clip" | "archive">
> = ref({
  flavor: props.favorites
    ? ({
        favorites: props.favorites,
      } as FavLookup)
    : ({ org: pageOrg.value.name } as OrgLookup),
  // type & status for tab selection.
  // Usually selection has a tab between live and archives. Use this to control that aspect.
  type: "stream_schedule" as const,
  // optional if using a TabType, if custom type, then must provide custom statuses.
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

const settings = useSettingsStore();
const currentPage = ref(+params.page || 1);
const perPage = 24;

const { t } = useI18n();
const liveUpcomingCounts = ref({ liveCnt: 0, upcomingCnt: 0 });

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
  if (tab === 0) {
    //unset pagination:
    lookupState.value.pagination = undefined;
  } else {
    lookupState.value.pagination = { offset: 0, pageSize: perPage };
    liveUpcomingCounts.value = { liveCnt: 0, upcomingCnt: 0 };
  }
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

const liveUpcomingHeaderSplit = computed(() => {
  return [
    ...(t("views.home.liveOrUpcomingHeading").match(/(.+)([\\/／・].+)/) || []),
  ];
});

const videoQuery = useVideoListDatasource(lookupState, ref({ enabled: true }));

watch([videoQuery.data, lookupState.value.type], () => {
  if (lookupState.value.type === "stream_schedule") {
    const live = videoQuery.data.value?.items;
    const liveCnt = live?.filter((v) => v.status === "live").length || 0;
    const upcomingCnt =
      live?.filter((v) => v.status === "upcoming").length || 0;
    liveUpcomingCounts.value = { liveCnt, upcomingCnt };
  } else {
    liveUpcomingCounts.value = { liveCnt: 0, upcomingCnt: 0 };
  }
});

const totalPages = computed(() => {
  return Math.ceil((videoQuery?.data.value?.total || 0) / perPage);
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
const isLoading = computed(
  () => videoQuery?.isLoading.value || videoQuery?.isFetching.value
);
const error = computed(() => videoQuery?.error.value);
const isError = computed(() => videoQuery?.isError.value);
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
</style>
